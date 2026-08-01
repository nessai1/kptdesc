use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use serde::de::DeserializeOwned;
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::error::{Error, Result};

pub const DIARY_FILE: &str = "diary.json";
pub const SETTINGS_FILE: &str = "settings.json";

/// Application data directory, created on first use.
pub fn data_dir(app: &AppHandle) -> Result<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| Error::AppDir(e.to_string()))?;
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

/// Reads a JSON file, falling back to the default value when it does not exist yet.
pub fn read_json<T: DeserializeOwned + Default>(dir: &Path, name: &str) -> Result<T> {
    let path = dir.join(name);
    let raw = match fs::read_to_string(&path) {
        Ok(raw) => raw,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(T::default()),
        Err(e) => return Err(e.into()),
    };
    if raw.trim().is_empty() {
        return Ok(T::default());
    }
    serde_json::from_str(&raw).map_err(|source| Error::Decode {
        path: path.display().to_string(),
        source,
    })
}

/// Writes a JSON file atomically: full write and flush into a sibling temp file, then rename.
/// A crash mid-write can never leave a half-written diary behind.
///
/// `fs::rename` replaces an existing destination on every supported platform — on Windows it
/// maps to `MoveFileExW`/`SetFileInformationByHandle` with replace semantics — so no separate
/// "remove then rename" path is needed (that one would not be atomic anyway).
pub fn write_json<T: Serialize>(dir: &Path, name: &str, value: &T) -> Result<()> {
    fs::create_dir_all(dir)?;
    let path = dir.join(name);
    let tmp = dir.join(format!("{name}.tmp"));

    let body = serde_json::to_vec_pretty(value).map_err(Error::Encode)?;
    write_and_sync(&tmp, &body)?;

    if let Err(e) = replace(&tmp, &path) {
        let _ = fs::remove_file(&tmp);
        return Err(e.into());
    }
    Ok(())
}

/// On Windows an antivirus scanner or the search indexer can hold the destination open for
/// a few milliseconds right after it was written, and the rename then fails with a sharing
/// violation. Retrying briefly turns that into a non-event; elsewhere the first try is it.
fn replace(tmp: &Path, path: &Path) -> std::io::Result<()> {
    const ATTEMPTS: u32 = if cfg!(windows) { 5 } else { 1 };

    let mut attempt = 0;
    loop {
        attempt += 1;
        match fs::rename(tmp, path) {
            Ok(()) => return Ok(()),
            Err(_) if attempt < ATTEMPTS => {
                std::thread::sleep(std::time::Duration::from_millis(20 * u64::from(attempt)));
            }
            Err(e) => return Err(e),
        }
    }
}

fn write_and_sync(path: &Path, body: &[u8]) -> Result<()> {
    let mut file = fs::File::create(path)?;
    file.write_all(body)?;
    file.sync_all()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::{read_json, write_json, DIARY_FILE};
    use crate::error::Error;
    use crate::model::{CareItem, DayRecord, Diary, Settings};

    fn temp_dir(name: &str) -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!("kptdesc-test-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn sample_diary() -> Diary {
        let mut day = DayRecord::default();
        day.checkup.day.insert("0".into(), true);
        day.care.push(CareItem {
            what: "Прогулка".into(),
            time: "14:30".into(),
        });
        BTreeMap::from([("2026-07-31".to_string(), day)])
    }

    #[test]
    fn missing_file_reads_as_default() {
        let dir = temp_dir("missing");
        let diary: Diary = read_json(&dir, DIARY_FILE).unwrap();
        assert!(diary.is_empty());

        let settings: Settings = read_json(&dir, "settings.json").unwrap();
        assert!(settings.show_hints);
        assert!(settings.emotion_list.contains("Тревога"));
    }

    #[test]
    fn empty_file_reads_as_default() {
        let dir = temp_dir("empty");
        std::fs::write(dir.join(DIARY_FILE), "   \n").unwrap();
        let diary: Diary = read_json(&dir, DIARY_FILE).unwrap();
        assert!(diary.is_empty());
    }

    #[test]
    fn round_trips_a_diary_and_leaves_no_temp_file() {
        let dir = temp_dir("round-trip");
        write_json(&dir, DIARY_FILE, &sample_diary()).unwrap();

        let loaded: Diary = read_json(&dir, DIARY_FILE).unwrap();
        let day = loaded.get("2026-07-31").expect("day is stored");
        assert_eq!(day.checkup.day.get("0"), Some(&true));
        assert_eq!(day.care[0].time, "14:30");

        assert!(!dir.join(format!("{DIARY_FILE}.tmp")).exists());
    }

    #[test]
    fn overwrites_previous_content_completely() {
        let dir = temp_dir("overwrite");
        write_json(&dir, DIARY_FILE, &sample_diary()).unwrap();
        write_json(&dir, DIARY_FILE, &Diary::new()).unwrap();

        let loaded: Diary = read_json(&dir, DIARY_FILE).unwrap();
        assert!(loaded.is_empty());
    }

    #[test]
    fn handles_long_entries() {
        let dir = temp_dir("long-entry");
        let long = "Длинная запись со спецсимволами <>&\"' и переносами\n".repeat(4000);
        let mut day = DayRecord::default();
        day.cbt.push(crate::model::CbtEntry {
            happened: long.clone(),
            thought: long.clone(),
            alt: String::new(),
            emotions: vec![],
        });
        let diary = BTreeMap::from([("2026-07-31".to_string(), day)]);

        write_json(&dir, DIARY_FILE, &diary).unwrap();
        let loaded: Diary = read_json(&dir, DIARY_FILE).unwrap();
        assert_eq!(loaded["2026-07-31"].cbt[0].happened, long);
    }

    #[test]
    fn corrupted_file_reports_its_path_instead_of_silently_resetting() {
        let dir = temp_dir("corrupt");
        std::fs::write(dir.join(DIARY_FILE), "{ not json").unwrap();

        match read_json::<Diary>(&dir, DIARY_FILE) {
            Err(Error::Decode { path, .. }) => assert!(path.ends_with(DIARY_FILE)),
            other => panic!("expected a decode error, got {other:?}"),
        }
    }

    #[test]
    fn tolerates_records_missing_optional_fields() {
        let dir = temp_dir("partial");
        std::fs::write(
            dir.join(DIARY_FILE),
            r#"{"2026-07-31":{"cbt":[{"happened":"что-то"}]}}"#,
        )
        .unwrap();

        let loaded: Diary = read_json(&dir, DIARY_FILE).unwrap();
        let day = loaded.get("2026-07-31").unwrap();
        assert_eq!(day.cbt[0].happened, "что-то");
        assert!(day.cbt[0].emotions.is_empty());
        assert!(day.care.is_empty());
        assert!(day.checkup.day.is_empty());
    }
}
