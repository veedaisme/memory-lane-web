# App Icons for PWA

This directory should contain the following icon files:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- apple-touch-icon.png (180x180px)
- new-note.png (for shortcut)
- map-view.png (for shortcut)

You can generate these icons from your app logo using tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon Generator](https://realfavicongenerator.net/)
- [App Icon Generator](https://appicon.co/)

## Icon Generation Command

If you have a source image (e.g., logo.png), you can use ImageMagick to generate the icons:

```bash
# Install ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate icons
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
convert logo.png -resize 180x180 apple-touch-icon.png
``` 