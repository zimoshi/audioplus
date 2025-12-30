# AudioPlus

**AudioPlus** is a lightweight, embeddable HTML audio player delivered as a native Web Component.

It provides a static waveform, scrubbing, playback speed control, loop support, and a tasteful developer console signature — all without frameworks or build steps.

---

## Installation

```html
<script src="https://audioplus-7n9b.onrender.com/audioplus.min.js"></script>
```

---

## Basic Usage

```html
<audio-plus src="happier.mp3"></audio-plus>
```

That’s it.

---

## Features

* ▶ / ⏸ Play & pause
* Static waveform (precomputed from audio)
* Click-to-seek
* Right-click context menu
* Playback speed control
* Loop toggle
* Shadow DOM isolation (no CSS conflicts)
* Multiple instances supported
* No backend required

---

## Context Menu

Right-click on the waveform to open the menu.

### Playback speeds

* 0.1×
* 0.25×
* 0.5×
* 0.75×
* 1× (default)
* 2×
* 3×
* 4×
* 5×

### Other

* **Loop** — toggles looping of the current track

Active options are marked with ✓.

---

## Attributes

### `src` (required)

Path or URL to an audio file supported by the browser (e.g. `mp3`).

```html
<audio-plus src="/audio/song.mp3"></audio-plus>
```

Changing `src` dynamically reloads the audio and waveform.

---

## Developer Console Signature

When AudioPlus is used, it prints a **single, non-intrusive console banner**:

* Logged once per page
* Collapsible (`console.groupCollapsed`)
* Uses text + Unicode block art only (no images, no fonts)
* No tracking or telemetry

This is intended as a friendly SDK signature, not advertising.

---

## Browser Support

* Chrome (desktop)
* ChromeOS / Chromebooks
* Chromium-based browsers

Other browsers may work but are not officially tested.

---

## Notes & Limitations

* This is **not DRM**
* Audio files are fetched directly by the browser
* Designed for personal, embedded, or low-traffic use
* No analytics
* No backend dependencies

---

## Example

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="audioplus.js"></script>
  </head>
  <body>
    <audio-plus src="happier.mp3"></audio-plus>
    <audio-plus src="another-song.mp3"></audio-plus>
  </body>
</html>
```

Each instance is fully isolated.

---

## Development Status

* Version: **v0**
* API may evolve
* Backwards compatibility not guaranteed yet

---

## License

APPL (Check LICENSE)

---

## Roadmap (informal)

* Keyboard shortcuts
* Playlist support
* Optional theming
* Mobile polish
