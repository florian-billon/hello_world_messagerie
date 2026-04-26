{ pkgs ? import <nixpkgs> {} }:

let
  libraries = with pkgs; [
    webkitgtk_4_1
    gtk3
    cairo
    gdk-pixbuf
    glib
    dbus
    openssl
    librsvg
    libsoup_3
    at-spi2-atk
    libdbusmenu-gtk3
    glib-networking
  ];
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_22
    pkg-config
    dbus
    openssl
    librsvg
    libsoup_3
    webkitgtk_4_1
    at-spi2-atk
    gtk3
    libdbusmenu-gtk3
    glib-networking
    gsettings-desktop-schemas
    adwaita-icon-theme
    dconf
  ];

  nativeBuildInputs = with pkgs; [
    pkg-config
    gobject-introspection
    cargo
    rustc
    rustfmt
    clippy
  ];

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
    
    # Chemins corrects pour les schémas et icônes sur NixOS
    export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-desktop-schemas:${pkgs.gtk3}/share/gsettings-desktop-schemas:${pkgs.gtk3}/share:${pkgs.gsettings-desktop-schemas}/share:${pkgs.adwaita-icon-theme}/share:$XDG_DATA_DIRS"
    export GSETTINGS_SCHEMA_DIR="${pkgs.gtk3}/share/glib-2.0/schemas:${pkgs.gsettings-desktop-schemas}/share/glib-2.0/schemas:$GSETTINGS_SCHEMA_DIR"
    
    # Modules GIO (pour dconf, le réseau HTTPS et le file chooser)
    export GIO_EXTRA_MODULES="${pkgs.dconf.lib}/lib/gio/modules:${pkgs.glib-networking}/lib/gio/modules"
    
    # Force les décorations côté client (CSD) pour voir les boutons fermer/réduire sur Hyprland
    export GTK_CSD=1
  '';
}
