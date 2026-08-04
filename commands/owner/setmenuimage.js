/**
 * SetMenuImage Command - Owner only
 * Set/change the menu image by replying to an image or sticker
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'setmenuimage',
  aliases: ['setmenuimg', 'changemenuimage', 'মেনুimg'],
  category: 'owner',
  description: 'ইমেজ বা স্টিকার দিয়ে মেনুর ছবি সেট করুন',
  usage: '.setmenuimage (ইমেজ/স্টিকারে রিপ্লাই)',
  ownerOnly: true,
  adminOnly: false,
  groupOnly: false,
  botAdminOnly: false,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      // Check if message is a reply
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.quotedMessage) {
        return extra.reply(
          `📷 *মেনু ছবি পরিবর্তন*\n\n` +
          `*ব্যবহার:* *কোনো ইমেজ বা স্টিকারে রিপ্লাই দিয়ে* *.setmenuimage*\n\n` +
          `*_নোট: স্টিকার অটো JPG তে কনভার্ট হয়ে যাবে_*`
        );
      }

      const quotedMsg = ctx.quotedMessage;
      const imageMsg = quotedMsg.imageMessage || quotedMsg.stickerMessage;

      if (!imageMsg) {
        return extra.reply('❌ *রিপ্লাই করা মেসেজটি ইমেজ অথবা স্টিকার হতে হবে!*');
      }

      const mediaType = quotedMsg.imageMessage? 'ইমেজ' : 'স্টিকার';
      const loadingMsg = await extra.reply(`🔄 *${mediaType} ডাউনলোড হচ্ছে...*`);

      // Download the media
      const targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: quotedMsg,
      };

      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) {
        return sock.sendMessage(chatId, {
          text: '❌ *ইমেজ ডাউনলোড করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।*',
          edit: loadingMsg.key
        });
      }

      await sock.sendMessage(chatId, {
        text: '🔄 *ছবি প্রসেস হচ্ছে...*',
        edit: loadingMsg.key
      });

      // Convert to JPEG if it's a sticker or other format
      let finalBuffer = mediaBuffer;
      if (quotedMsg.stickerMessage) {
        const sharp = require('sharp');
        finalBuffer = await sharp(mediaBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      } else if (!imageMsg.mimetype?.includes('jpeg') && !imageMsg.mimetype?.includes('jpg')) {
        const sharp = require('sharp');
        finalBuffer = await sharp(mediaBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      // Save to utils/bot_image.jpg
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');

      // Delete old image if exists
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {
          console.warn('Could not delete old menu image:', e);
        }
      }

      // Write new image
      fs.writeFileSync(imagePath, finalBuffer);

      await sock.sendMessage(chatId, {
        text: `✅ *মেনুর ছবি সফলভাবে আপডেট করা হয়েছে!*\n\n*টাইপ:* *${mediaType}*\n*সাইজ:* ${(finalBuffer.length / 1024).toFixed(2)}KB\n*_এখন থেকে মেনুতে এই ছবি দেখা যাবে।_*`,
        edit: loadingMsg.key
      });

    } catch (error) {
      console.error('SetMenuImage command error:', error);
      await extra.reply(`❌ *মেনু ছবি সেট করতে সমস্যা:* ${error.message}`);
    }
  }
};