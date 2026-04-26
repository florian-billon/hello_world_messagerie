// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::thread;
use std::time::Duration;

fn main() {
    // Lancer Next.js en production SANS npm
    // Note : On utilise 'node' pour lancer le binaire next directement depuis node_modules
    #[cfg(not(debug_assertions))]
    {
      Command::new("node")
          .args(["node_modules/.bin/next", "start", "-p", "3000"])
          .spawn()
          .expect("Failed to start Next.js server");

      // Attendre que le serveur démarre
      thread::sleep(Duration::from_secs(2));
    }

    app_lib::run();
}
