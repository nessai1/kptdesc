use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// Whole diary, keyed by local date `YYYY-MM-DD` — the schema the design handoff defines.
pub type Diary = BTreeMap<String, DayRecord>;

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct DayRecord {
    #[serde(default)]
    pub checkup: Checkup,
    #[serde(default)]
    pub cbt: Vec<CbtEntry>,
    #[serde(default)]
    pub care: Vec<CareItem>,
}

/// Checkup marks for both halves of the day. Keys are checklist item indices as strings.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct Checkup {
    #[serde(default)]
    pub day: BTreeMap<String, bool>,
    #[serde(default)]
    pub eve: BTreeMap<String, bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CbtEntry {
    pub happened: String,
    #[serde(default)]
    pub thought: String,
    #[serde(default)]
    pub alt: String,
    #[serde(default)]
    pub emotions: Vec<Emotion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Emotion {
    pub name: String,
    #[serde(default)]
    pub intensity: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CareItem {
    pub what: String,
    #[serde(default)]
    pub time: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    /// Show the helper text under each checkup item.
    pub show_hints: bool,
    /// Comma-separated emotion names; "?" is always appended by the UI.
    pub emotion_list: String,
    /// Optional client name printed in the report header.
    pub client_name: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            show_hints: true,
            emotion_list: "Тревога, Грусть, Злость, Страх, Стыд, Вина, Обида, Разочарование, Одиночество, Растерянность, Радость, Спокойствие".into(),
            client_name: String::new(),
        }
    }
}
