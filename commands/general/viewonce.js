/**
 * ViewOnce Command - Reveal view-once messages
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'viewonce',
  aliases: ['readvo', 'read', 'vv', 'readviewonce', 'দেখাও'],
  category: 'general',
  description: 'ভিউ ওয়ান্স মেসেজ রিভিল করুন (ইমেজ/ভিডিও/অডিও)',
  usage: '.viewonce (ভিউ-ওয়ান্স মেসেজে রিপ্লাই)',

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;

      // contextInfo বের করা
      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.buttonsResponseMessage?.contextInfo
        || msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage ||!ctx?.stanzaId) {
        return await sock.sendMessage(
          chatId,
          { text: '👁️ *ভিউ-ওয়ান্স মেসেজে রিপ্লাই দিয়ে* *.viewonce* *কমান্ড ব্যবহার করুন।*' },
          { quoted: msg }
        );
      }

      const quotedMsg = ctx.quotedMessage;

      // ভিউ-ওয়ান্স চেক
      const hasViewOnce =
      !!quotedMsg.viewOnceMessageV2 ||
      !!quotedMsg.viewOnceMessageV2Extension ||
      !!quotedMsg.viewOnceMessage ||
      !!quotedMsg.viewOnce ||
      !!quotedMsg?.imageMessage?.viewOnce ||
      !!quotedMsg?.videoMessage?.viewOnce ||
      !!quotedMsg?.audioMessage?.viewOnce;

      if (!hasViewOnce) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ *এটা ভিউ-ওয়ান্স মেসেজ না!*' },
          { quoted: msg }
        );
      }

      let actualMsg = null;
      let mtype = null;

      if (quotedMsg.viewOnceMessageV2Extension?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2Extension.message;
        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.viewOnceMessageV2?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2.message;
        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.viewOnceMessage?.message) {
        actualMsg = quotedMsg.viewOnceMessage.message;
        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.imageMessage?.viewOnce) {
        actualMsg = { imageMessage: quotedMsg.imageMessage };
        mtype = 'imageMessage';
      } else if (quotedMsg.videoMessage?.viewOnce) {
        actualMsg = { videoMessage: quotedMsg.videoMessage };
        mtype = 'videoMessage';
      } else if (quotedMsg.audioMessage?.viewOnce) {
        actualMsg = { audioMessage: quotedMsg.audioMessage };
        mtype = 'audioMessage';
      }

      if (!actualMsg ||!mtype) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ *এই ধরনের ভিউ-ওয়ান্স সাপোর্ট করে না।*' },
          { quoted: msg }
        );
      }

      const downloadType =
        mtype === 'imageMessage'
        ? 'image'
          : mtype === 'videoMessage'
        ? 'video'
          : 'audio';

      await sock.sendMessage(chatId, { text: '🔄 *মিডিয়া ডাউনলোড হচ্ছে...*' }, { quoted: msg });

      const mediaStream = await downloadContentFromMessage(
        actualMsg[mtype],
        downloadType
      );

      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = actualMsg[mtype]?.caption || '';

      if (/video/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            video: buffer,
            caption: caption? `📹 *ভিউ-ওয়ান্স ভিডিও*\n\n${caption}` : '📹 *ভিউ-ওয়ান্স ভিডিও*',
            mimetype: 'video/mp4'
          },
          { quoted: msg }
        );
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            image: buffer,
            caption: caption? `🖼️ *ভিউ-ওয়ান্স ইমেজ*\n\n${caption}` : '🖼️ *ভিউ-ওয়ান্স ইমেজ*',
            mimetype: 'image/jpeg'
          },
          { quoted: msg }
        );
      } else if (/audio/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            audio: buffer,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
          },
          { quoted: msg }
        );
      }
    } catch (error) {
      console.error('Error in viewonce command:', error);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `❌ *ভিউ-ওয়ান্স রিভিল করতে সমস্যা:*\n${error.message || 'Unknown error'}`
        },
        { quoted: msg }
      );
    }
  }
};