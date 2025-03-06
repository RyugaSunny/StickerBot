# WhatsApp Sticker Bot

A lightweight WhatsApp bot built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) to create stickers from images, GIFs, and videos. Supports multi-device (MD) authentication and session persistence—no QR scans after the first run!

## Features

- Convert images, GIFs, and videos to stickers with `.sticker`.
- Transparent backgrounds for wide/tall media.
- Check bot status with `.status` (replies *"Yes I am wide awake!"*).
- Session persistence to avoid repeated QR scans.
- Automatic cleanup of temporary files after successful sends.

## Requirements

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Git](https://git-scm.com/)
- [FFmpeg](https://ffmpeg.org/) (for media processing)
- A text editor (e.g., VS Code, Notepad)

---

## Setup and Installation

### For Termux (Android)

#### Install dependencies:

```bash
pkg update && pkg upgrade
pkg install nodejs git ffmpeg -y
```

#### Clone the repository:

```bash
git clone https://github.com/RyugaSunny/StickerBot.git
cd StickerBot
```

#### Install Node.js packages:

```bash
npm install
```

#### Run the bot:

```bash
node index.js
```

Scan the QR code with WhatsApp (**Settings > Linked Devices > Link a Device**). Subsequent runs use the saved session (no QR needed).

#### Run 24/7:

```bash
npm i -g pm2
pm2 start index.js --name "StickerBot"
pm2 save
pm2 logs
```

---

### For Linux (e.g., Ubuntu)

#### Install dependencies:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs git ffmpeg -y
```

#### Clone the repository:

```bash
git clone https://github.com/RyugaSunny/StickerBot.git
cd StickerBot
```

#### Install Node.js packages:

```bash
npm install
```

#### Run the bot:

```bash
node index.js
```

Scan the QR code with WhatsApp. Session is saved in the `session` folder for future runs.

---

### For Windows

#### Install dependencies:

1. Download and install [Node.js](https://nodejs.org/).
2. Download and install [Git](https://git-scm.com/).
3. Download [FFmpeg](https://ffmpeg.org/download.html) (e.g., from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/)).
   - Extract to `C:\ffmpeg`.
   - Add `C:\ffmpeg\bin` to your system `PATH` (search *"Edit environment variables"* in Windows, edit `PATH`).

#### Open a Command Prompt or PowerShell:

```bash
git clone https://github.com/RyugaSunny/StickerBot.git
cd StickerBot
npm install
node index.js
```

Scan the QR code with WhatsApp. Session persists in the `session` folder.

---

## Usage

- Send `.sticker` with an image, GIF, or video to create a sticker.
- Send `.status` to check if the bot is running.

---

## Known Bug

### **GIF/Video Repeat Issue:**

**Behavior:** The bot successfully creates a sticker from a GIF or video the first time you send it. However, sending the same GIF/video again in the same session fails with *"Couldn’t download the media."* Images work fine repeatedly.

**Cause:** A limitation in `whatsapp-web.js` where `downloadMedia()` returns `undefined` for repeated animated media due to WhatsApp’s caching.

**Workaround:** Use a different file or edit the GIF/video slightly (e.g., add text in WhatsApp) to treat it as a new file, which works once per unique version.

---

## Notes

- Stickers over **1MB** may fail to send due to WhatsApp’s internal limit—use smaller files if needed.
- Temporary files (`input-*.xxx` and `sticker-*.webp`) are deleted automatically after processing.

---

## Credits

- Built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
- Created by Deepanshu.

