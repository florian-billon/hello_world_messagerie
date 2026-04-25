{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    pkg-config
    gobject-introspection
    cargo
    rustc
    rustfmt
    clippy
  ];

  buildInputs = with pkgs; [
    at-spi2-atk
    atkmm
    cairo
    gdk-pixbuf
    glib
    gtk3
    harfbuzz
    fribidi
    dbus
    librsvg
    libsoup_3
    pango
    webkitgtk_4_1
    openssl
  ];

  # Indispensable pour que pkg-config trouve les .pc
  shellHook = ''
    export PKG_CONFIG_PATH="${pkgs.glib.dev}/lib/pkgconfig:${pkgs.gtk3.dev}/lib/pkgconfig:${pkgs.webkitgtk_4_1.dev}/lib/pkgconfig:${pkgs.libsoup_3.dev}/lib/pkgconfig:${pkgs.at-spi2-atk.dev}/lib/pkgconfig:${pkgs.cairo.dev}/lib/pkgconfig:${pkgs.pango.dev}/lib/pkgconfig:${pkgs.gdk-pixbuf.dev}/lib/pkgconfig:${pkgs.atk.dev}/lib/pkgconfig:${pkgs.harfbuzz.dev}/lib/pkgconfig:${pkgs.fribidi.dev}/lib/pkgconfig:${pkgs.dbus.dev}/lib/pkgconfig"
    export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-desktop-schemas:${pkgs.gtk3}/share/gsettings-desktop-schemas:$XDG_DATA_DIRS
  '';
}
