use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

use crate::error::{Error, Result};

/// `YYYY-MM-DD`, the Monday of the exported week. Validated because it becomes a file name.
fn validate_week(week: &str) -> Result<()> {
    let bytes = week.as_bytes();
    let shaped = bytes.len() == 10
        && bytes.iter().enumerate().all(|(i, b)| match i {
            4 | 7 => *b == b'-',
            _ => b.is_ascii_digit(),
        });
    if shaped {
        Ok(())
    } else {
        Err(Error::InvalidWeek(week.to_string()))
    }
}

fn report_dir() -> PathBuf {
    std::env::temp_dir().join("kpt-diary")
}

/// Writes the ready-made report page next to the system temp dir and hands it to the
/// default browser, where "Print → Save as PDF" produces the file the handoff asks for.
pub fn export_report(app: &AppHandle, week: &str, html: &str) -> Result<PathBuf> {
    validate_week(week)?;

    let dir = report_dir();
    fs::create_dir_all(&dir)?;
    let path = dir.join(format!("kpt-report-{week}.html"));
    write_private(&path, html.as_bytes())?;

    app.opener()
        .open_path(path.to_string_lossy(), None::<&str>)
        .map_err(|e| Error::Open(e.to_string()))?;

    Ok(path)
}

/// The report holds personal notes, so on unix it is owner-readable only.
fn write_private(path: &Path, body: &[u8]) -> Result<()> {
    let mut options = fs::OpenOptions::new();
    options.write(true).create(true).truncate(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(path)?;
    file.write_all(body)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::validate_week;

    #[test]
    fn accepts_iso_date() {
        assert!(validate_week("2026-07-27").is_ok());
    }

    #[test]
    fn rejects_malformed_and_traversing_input() {
        for bad in [
            "",
            "2026-7-27",
            "2026/07/27",
            "../../etc/passwd",
            "2026-07-27 ",
            "2026-07-2x",
        ] {
            assert!(validate_week(bad).is_err(), "should reject {bad:?}");
        }
    }
}
