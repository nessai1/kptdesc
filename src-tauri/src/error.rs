use serde::{Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("не удалось определить папку данных приложения: {0}")]
    AppDir(String),

    #[error("ошибка файловой системы: {0}")]
    Io(#[from] std::io::Error),

    #[error("повреждённые данные в {path}: {source}")]
    Decode {
        path: String,
        #[source]
        source: serde_json::Error,
    },

    #[error("не удалось сериализовать данные: {0}")]
    Encode(#[source] serde_json::Error),

    #[error("некорректная дата недели: {0}")]
    InvalidWeek(String),

    #[error("не удалось открыть файл отчёта: {0}")]
    Open(String),
}

/// Commands must return something the WebView can read, so errors travel as their message.
impl Serialize for Error {
    fn serialize<S: Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, Error>;
