use tauri::{Emitter, Manager};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_sql::{Migration, MigrationKind};

const EDITOR_DB_URL: &str = "sqlite:fylepad-zen.db";

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_collections_and_editor_tabs",
        sql: r#"
            CREATE TABLE IF NOT EXISTS collections (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL UNIQUE
            );

            INSERT OR IGNORE INTO collections (id, name)
            VALUES ('default', 'Default folder');

            CREATE TABLE IF NOT EXISTS editor_tabs (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                collection_id TEXT NOT NULL DEFAULT 'default',
                content TEXT NOT NULL,
                metadata TEXT,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT
            );

            CREATE INDEX IF NOT EXISTS idx_editor_tabs_collection_id ON editor_tabs(collection_id);
        "#,
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(EDITOR_DB_URL, migrations)
                .build(),
        )
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("Single instance args: {:?}", args);

            // Extract deep link URL from args
            let url = args.iter().find(|a| a.starts_with("fylepad://"));
            println!("Deep link from single instance: {:?}", url);

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
                if let Some(u) = url {
                    let _ = window.emit("deep-link-received", vec![u.clone()]);
                }
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();
                app.deep_link().on_open_url(move |event| {
                    let urls: Vec<String> = event.urls().iter().map(|u| u.to_string()).collect();

                    println!("🔗 Deep link URLs: {:?}", urls);

                    if let Some(window) = handle.get_webview_window("main") {
                        let _ = window.set_focus();
                        let _ = window.emit("deep-link-received", urls);
                    }
                });

                app.deep_link().register("fylepad")?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
