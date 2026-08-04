const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Max file size: 10MB for profile pictures
const MAX_FILE_SIZE = 10 * 1024 * 1024;

module.exports = {
  name: 'setbotpp',
  aliases: ['setppbot', 'setpp', 'বটpp'],
  category: 'owner',
  description: 'ইমেজ বা স্টিকার দিয়ে বটের প্রোফাইল পিকচার সেট করুন',
  usage: '.setbotpp (ইমেজ বা স্টিকারে রিপ্লাই)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      // Check if message is a reply
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        return extra.reply(
          `🖼️ *বটের প্রোফাইল পিকচার পরিবর্তন*\n\n` +
          `*ব্যবহার:* *কোনো ইমেজ বা স্টিকারে রিপ্লাই দিয়ে* *.setbotpp*\n\n` +
          `*_নোট: ফাইল 10MB এর কম হতে হবে_*`
        );
      }

      // Check if quoted message contains an image or sticker
      const imageMessage = quotedMessage.imageMessage;
      const stickerMessage = quotedMessage.stickerMessage;

      if (!imageMessage &&!stickerMessage) {
        return extra.reply('❌ *রিপ্লাই করা মেসেজে ইমেজ বা স্টিকার থাকতে হবে!*');
      }

      const mediaMessage = imageMessage || stickerMessage;
      const mediaType = imageMessage? 'ইমেজ' : 'স্টিকার';

      const loadingMsg = await extra.reply(`🔄 *${mediaType} ডাউনলোড হচ্ছে...*`);

      const tmpDir = getTempDir();
      const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);

      try {
        // Download the media
        const stream = await downloadContentFromMessage(mediaMessage, 'image');
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
          await sock.sendMessage(extra.from, {
            text: `❌ *ফাইল অনেক বড়!*\n*সাইজ:* ${(buffer.length / 1024 / 1024).toFixed(2)}MB\n*সর্বোচ্চ:* ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            edit: loadingMsg.key
          });
          return deleteTempFile(imagePath);
        }

        await sock.sendMessage(extra.from, {
          text: '🔄 *প্রোফাইল পিকচার আপডেট হচ্ছে...*',
          edit: loadingMsg.key
        });

        // Save the image
        fs.writeFileSync(imagePath, buffer);

        // Set the profile picture
        await sock.updateProfilePicture(sock.user.id.split(':')[0] + '@s.whatsapp.net', { url: imagePath });

        await sock.sendMessage(extra.from, {
          text: `✅ *বটের প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে!*\n\n*টাইপ:* *${mediaType}*\n*সাইজ:* ${(buffer.length / 1024).toFixed(2)}KB`,
          edit: loadingMsg.key
        });

      } catch (error) {
        console.error('setbotpp error:', error);
        await sock.sendMessage(extra.from, {
          text: '❌ *প্রোফাইল পিকচার আপডেট করতে সমস্যা হয়েছে!*',
          edit: loadingMsg.key
        });
      } finally {
        deleteTempFile(imagePath);
      }
    } catch (error) {
      console.error('setbotpp error:', error);
      await extra.reply('❌ *প্রোফাইল পিকচার আপডেট করতে সমস্যা হয়েছে!*');
    }
  }
};