mod error;
mod export;
mod model;
mod storage;

use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};

use error::Result;
use model::{Diary, Settings};

/// Serialises writes so two rapid saves cannot interleave on the same temp file.
#[derive(Default)]
struct WriteLock(Mutex<()>);

impl WriteLock {
    fn acquire(&self) -> std::sync::MutexGuard<'_, ()> {
        // A poisoned lock only means a previous write panicked; the file itself is
        // still consistent thanks to the atomic rename, so keep going.
        self.0.lock().unwrap_or_else(|e| e.into_inner())
    }
}

#[tauri::command]
fn load_diary(app: AppHandle) -> Result<Diary> {
    storage::read_json(&storage::data_dir(&app)?, storage::DIARY_FILE)
}

#[tauri::command]
fn save_diary(app: AppHandle, lock: State<'_, WriteLock>, diary: Diary) -> Result<()> {
    let _guard = lock.acquire();
    storage::write_json(&storage::data_dir(&app)?, storage::DIARY_FILE, &diary)
}

#[tauri::command]
fn load_settings(app: AppHandle) -> Result<Settings> {
    storage::read_json(&storage::data_dir(&app)?, storage::SETTINGS_FILE)
}

#[tauri::command]
fn save_settings(app: AppHandle, lock: State<'_, WriteLock>, settings: Settings) -> Result<()> {
    let _guard = lock.acquire();
    storage::write_json(&storage::data_dir(&app)?, storage::SETTINGS_FILE, &settings)
}

/// Writes the rendered weekly report to a temp file and opens it in the default browser,
/// where the user saves it as PDF through the print dialog.
#[tauri::command]
fn export_report(app: AppHandle, week: String, html: String) -> Result<String> {
    let path = export::export_report(&app, &week, &html)?;
    Ok(path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(WriteLock::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_diary,
            save_diary,
            load_settings,
            save_settings,
            export_report
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
