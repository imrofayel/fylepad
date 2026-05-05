use tauri::{Emitter, Manager};
use tauri_plugin_deep_link::DeepLinkExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
                    let urls: Vec<String> = event.urls()
                        .iter()
                        .map(|u| u.to_string())
                        .collect();

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