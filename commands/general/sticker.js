/**
 * Sticker Command
 * Uses ffmpeg + webpmux-style EXIF metadata to always embed packname
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const webp = require('node-webpmux');
const ffmpegPath = require('ffmpeg-static');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../config');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'stc', 'স্টিকার'],
  description: 'ইমেজ বা ভিডিও থেকে স্টিকার বান',
  usage: '.sticker (মিডিয়াতে রিপ্লাই)',
  category: 'general',
  
  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const messageToQuote = msg;
    let targetMessage = msg;
    
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (ctxInfo?.quotedMessage) {
      targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };
    }
    
    const mediaMessage =
      targetMessage.message?.imageMessage ||
      targetMessage.message?.videoMessage ||
      targetMessage.message?.documentMessage;
    
    if (!mediaMessage) {
      return extra.reply(
        `📎 *স্টিকার মেকার*\n\n` +
        `*ব্যবহার:* *কোনো ইমেজ/ভিডিও/জিআইএফ এ রিপ্লাই দিয়ে* *.sticker*\n` +
        `*অথবা ক্যাপশনে* *.sticker* *দিয়ে মিডিয়া পাঠান*\n\n` +
        `*_নোট: সর্বোচ্চ 50MB পর্যন্ত সাপোর্ট করে_*`
      );
    }
    
    const loadingMsg = await extra.reply('🔄 *স্টিকার বানানো হচ্ছে...*');
    const tempDir = getTempDir();
    const timestamp = Date.now();
    const tempInput = path.join(tempDir, `in_${timestamp}`);
    const tempOutput = path.join(tempDir, `out_${timestamp}.webp`);
    let tempFiles = [tempInput, tempOutput];
    
    try {
      await sock.sendMessage(chatId, { text: '📥 *মিডিয়া ডাউনলোড হচ্ছে...*', edit: loadingMsg.key });

      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );
      
      if (!mediaBuffer) {
        return sock.sendMessage(chatId, {
          text: '❌ *মিডিয়া ডাউনলোড করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।*',
          edit: loadingMsg.key
        });
      }
      
      if (mediaBuffer.length > MAX_FILE_SIZE) {
        return sock.sendMessage(chatId, {
          text: `❌ *ফাইল অনেক বড়!*\n*সাইজ:* ${(mediaBuffer.length / 1024 / 1024).toFixed(2)}MB\n*সর্বোচ্চ:* ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          edit: loadingMsg.key
        });
      }
      
      fs.writeFileSync(tempInput, mediaBuffer);
      
      const isAnimated =
        mediaMessage.mimetype?.includes('gif') ||
        mediaMessage.mimetype?.includes('video') ||
        (mediaMessage.seconds || 0) > 0;
      
      await sock.sendMessage(chatId, {
        text: `🔄 *স্টিকার কনভার্ট হচ্ছে...*\n*টাইপ:* ${isAnimated? 'অ্যানিমেটেড' : 'স্ট্যাটিক'}`,
        edit: loadingMsg.key
      });

      const baseFfmpegCmd = isAnimated
        ? `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
        : `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
      
      const execPromise = (cmd) =>
        new Promise((resolve, reject) => exec(cmd, (err) => (err ? reject(err) : resolve())));
      
      await execPromise(baseFfmpegCmd);
      
      let webpBuffer = fs.readFileSync(tempOutput);
      
      // Large animated sticker fallback
      if (isAnimated && webpBuffer.length > 1000 * 1024) {
        await sock.sendMessage(chatId, { text: '🔄 *ফাইল বড়, কম্প্রেস করা হচ্ছে...*', edit: loadingMsg.key });
        const tempOutput2 = path.join(tempDir, `out_fallback_${Date.now()}.webp`);
        tempFiles.push(tempOutput2);
        const fileSizeKB = mediaBuffer.length / 1024;
        const isLargeFile = fileSizeKB > 5000;
        
        const fallbackCmd = isLargeFile
          ? `"${ffmpegPath}" -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=8,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput2}"`
          : `"${ffmpegPath}" -y -i "${tempInput}" -t 3 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput2}"`;
        
        await execPromise(fallbackCmd);
        
        if (fs.existsSync(tempOutput2)) {
          webpBuffer = fs.readFileSync(tempOutput2);
        }
      }
      
      await sock.sendMessage(chatId, { text: '📦 *EXIF ডেটা যোগ হচ্ছে...*', edit: loadingMsg.key });
      
      const img = new webp.Image();
      await img.load(webpBuffer);
      
      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': config.packname || 'Made by ' + (config.botName || 'Bot'),
        'sticker-pack-publisher': config.author || 'Meta AI',
        emojis: ['🤖'],
      };
      
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);
      
      img.exif = exif;
      const finalBuffer = await img.save(null);
      
      await sock.sendMessage(chatId, {
        sticker: finalBuffer
      }, { quoted: msg });

      await sock.sendMessage(chatId, {
        text: `✅ *স্টিকার সফলভাবে বানানো হয়েছে!*\n\n*প্যাক:* *${json['sticker-pack-name']}*\n*সাইজ:* ${(finalBuffer.length / 1024).toFixed(2)}KB`,
        edit: loadingMsg.key
      });
      
    } catch (error) {
      console.error('Sticker command error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ *স্টিকার বানাতে সমস্যা হয়েছে!*\n*কারণ:* ${error.message}`,
        edit: loadingMsg.key
      });
    } finally {
      tempFiles.forEach(file => deleteTempFile(file));
    }
  },
};