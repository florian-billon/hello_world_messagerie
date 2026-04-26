#!/usr/bin/env bash
# Script de lancement ULTIME pour NixOS/Hyprland

# 1. Export des certificats SSL (pour Giphy)
export SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt
[ ! -f "$SSL_CERT_FILE" ] && export SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

# 2. Recherche dynamique du schéma GTK FileChooser (évite le crash upload)
# On cherche le dossier qui contient org.gtk.Settings.FileChooser.gschema.xml
SCHEMA_PATH=$(dirname $(find /nix/store -name 'org.gtk.Settings.FileChooser.gschema.xml' | head -n 1))
if [ -n "$SCHEMA_PATH" ]; then
    export GSETTINGS_SCHEMA_DIR="$SCHEMA_PATH"
fi

# 3. Lancement propre via le shell Nix
cd frontend && nix-shell --run "GSETTINGS_BACKEND=memory WEBKIT_DISABLE_DMABUF_RENDERER=1 GDK_BACKEND=wayland npm run tauri dev"
