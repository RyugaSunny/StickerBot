const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

let ffmpegPath = 'ffmpeg';
try {
    require('child_process').execSync('ffmpeg -version');
    console.log('FFmpeg found in PATH');
} catch (e) {
    ffmpegPath = process.platform === 'win32' 
        ? 'C:\\ffmpeg\\bin\\ffmpeg.exe' // Adjust for your Windows path
        : '/data/data/com.termux/files/usr/bin/ffmpeg';
    console.log(`FFmpeg not in PATH, using: ${ffmpegPath}`);
}

const client = new Client({
    ffmpegPath: ffmpegPath,
    puppeteer: { args: ['--no-sandbox'] },
    authStrategy: new LocalAuth({ dataPath: './session' })
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code.');
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('authenticated', () => {
    console.log('Authenticated successfully!');
});

client.on('message', async (message) => {
    try {
        console.log(`Received message: ${message.body} from ${message.from}`);
        if (message.body.toLowerCase() === '.status') {
            await message.reply('Yes I am wide awake!');
            console.log('Responded to .status command');
        } else if (message.body.toLowerCase().startsWith('.sticker') && message.hasMedia) {
            const media = await message.downloadMedia();
            if (!media) {
                console.log('Failed to download media');
                await message.reply('Couldn’t download the media. Try sending it again or use a different file.');
                return;
            }

            const fileName = `input-${Date.now()}.${media.mimetype.split('/')[1]}`;
            const inputPath = path.join(__dirname, fileName);
            const outputPath = path.join(__dirname, `sticker-${Date.now()}.webp`);

            console.log(`Processing media: ${inputPath}, MIME: ${media.mimetype}`);
            fs.writeFileSync(inputPath, Buffer.from(media.data, 'base64'));

            await processMedia(inputPath, outputPath, media.mimetype);

            const sticker = MessageMedia.fromFilePath(outputPath);
            try {
                await message.reply(sticker, null, { sendMediaAsSticker: true });
                console.log('Sticker sent successfully!');
                fs.unlinkSync(outputPath); // Delete output file
            } catch (sendError) {
                console.error('Failed to send sticker:', sendError);
                const size = fs.statSync(outputPath).size / 1024 / 1024; // Size in MB
                await message.reply(`Output file size is ${size.toFixed(2)} MB, which is over 1MB. Try again with a smaller file.`);
            }

            fs.unlinkSync(inputPath); // Delete input file
        } else if (message.body.toLowerCase().startsWith('.sticker')) {
            await message.reply('Send an image, GIF, or video with `.sticker`.');
        }
    } catch (error) {
        console.error('Error processing message:', error);
        await message.reply('Error creating sticker. Try again!');
    }
});

function processMedia(inputPath, outputPath, mimeType) {
    return new Promise((resolve, reject) => {
        const isVideoOrGif = mimeType.includes('video') || mimeType.includes('gif');
        ffmpeg(inputPath)
            .output(outputPath)
            .outputOptions(isVideoOrGif ? [
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:0x00000000',
                '-loop', '0',
                '-c:v', 'libwebp_anim',
                '-q:v', '20',
                '-b:v', '200k',
                '-pix_fmt', 'yuva420p',
            ] : [
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:0x00000000',
                '-c:v', 'libwebp',
                '-q:v', '30',
                '-pix_fmt', 'yuva420p',
            ])
            .on('end', () => {
                const size = fs.statSync(outputPath).size / 1024 / 1024; // Size in MB
                console.log(`Generated sticker: ${outputPath}, Size: ${size.toFixed(2)} MB`);
                resolve();
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            })
            .run();
    });
}

client.initialize();