/**
 * ATTP - Animated Text to Picture Sticker
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { writeExifVid } = require('../../utils/exif');

module.exports = {
  name: 'attp',
  aliases: ['ttp', 'এনিমেটেড'],
  category: 'general',
  description: 'এনিমেটেড টেক্সট স্টিকার বান',
  usage: '.attp <লেখা>',

  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(`❌ *লেখা দিন!*\n\n*উদাহরণ:* *${extra.prefix || '.'}attp Hello World*`);
      }

      const text = args.join(' ');
      if (text.length > 50) {
        return extra.reply('❌ *লেখা অনেক বড়! সর্বোচ্চ 50 অক্ষর দেওয়া যাবে।*');
      }

      const loadingMsg = await extra.reply(`🔄 *"${text}" দিয়ে এনিমেটেড স্টিকার বানানো হচ্ছে...*`);

      try {
        const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
        const webpBuffer = await writeExifVid(mp4Buffer, { packname: 'ᴛᴏᴍ ᴘʀɪᴍᴇ x' });
        await sock.sendMessage(extra.from, { sticker: webpBuffer }, { quoted: msg });
        
        await sock.sendMessage(extra.from, {
          text: `✅ *এনিমেটেড স্টিকার রেডি!*\n\n*লেখা:* *${text}*`,
          edit: loadingMsg.key
        });
      } catch (error) {
        console.error('Error generating attp sticker:', error);
        await sock.sendMessage(extra.from, {
          text: '❌ *স্টিকার বানাতে সমস্যা হয়েছে!*',
          edit: loadingMsg.key
        });
      }
    } catch (error) {
      console.error('ATTP command error:', error);
      await extra.reply('❌ *এনিমেটেড স্টিকার বানোর সময় সমস্যা হয়েছে!*');
    }
  }
};

function renderBlinkingVideoWithFfmpeg(text) {
  return new Promise((resolve, reject) => {
    const fontPath = process.platform === 'win32'
      ? 'C:/Windows/Fonts/arialbd.ttf'
      : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

    const escapeDrawtextText = (s) => s
      .replace(/\\/g, '\\\\')
      .replace(/:/g, '\\:')
      .replace(/,/g, '\\,')
      .replace(/'/g, "\\'")
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/%/g, '\\%');

    const safeText = escapeDrawtextText(text);
    const safeFontPath = process.platform === 'win32'
      ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
      : fontPath;

    // Blink cycle length (seconds) and fast delay ~0.1s per color
    const cycle = 0.3;
    const dur = 1.8; // 6 cycles

    const drawRed = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=red:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t\\,${cycle})\\,0.1)'`;
    const drawBlue = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=blue:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;
    const drawGreen = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=green:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t\\,${cycle})\\,0.2)'`;

    const filter = `${drawRed},${drawBlue},${drawGreen}`;

    const args = [
      '-y',
      '-f', 'lavfi',
      '-i', `color=c=black:s=512x512:d=${dur}:r=20`,
      '-vf', filter,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart+frag_keyframe+empty_moov',
      '-t', String(dur),
      '-f', 'mp4',
      'pipe:1'
    ];

    const ff = spawn('ffmpeg', args);
    const chunks = [];
    const errors = [];
    ff.stdout.on('data', d => chunks.push(d));
    ff.stderr.on('data', e => errors.push(e));
    ff.on('error', reject);
    ff.on('close', code => {
      if (code === 0) return resolve(Buffer.concat(chunks));
      reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
    });
  });
}