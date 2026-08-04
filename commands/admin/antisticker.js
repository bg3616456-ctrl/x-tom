/**
 * Antisticker Command - Fast Delete & Kick System
 */

const database = require('../../database');

module.exports = {
  name: 'antisticker',
  aliases: ['antistk', 'antistick'],
  category: 'admin',
  description: 'গ্রুপে স্টিকার পাঠানো বন্ধ করা',
  usage: '.antisticker <on/off>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  execute: async function(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antisticker? '✅ *চালু*' : '❌ *বন্ধ*';
        return extra.reply(
          `🎭 *অ্যান্টি-স্টিকার সিস্টেম*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*ওয়ার্ন লিমিট:* *3*\n\n` +
          `*ব্যবহার:*\n` +
          `.antisticker on\n` +
          `.antisticker off`
        );
      }

      const opt = args[0].toLowerCase();
      if (opt === 'on') {
        database.updateGroupSettings(extra.from, { antisticker: true });
        return extra.reply('✅ *অ্যান্টি-স্টিকার চালু করা হয়েছে!*\n\n*এখন কেউ স্টিকার পাঠালে 3 বার ওয়ার্ন দিয়ে কিক করা হবে।*');
      } else if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antisticker: false });
        return extra.reply('❌ *অ্যান্টি-স্টিকার বন্ধ করা হয়েছে!*');
      }
      return extra.reply('*ব্যবহার:*.antisticker <on/off>');
    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  },

  checkSticker: async function(sock, msg, extra) {
    // Only process if it is a sticker message
    if (!msg.message?.stickerMessage) return;

    const chatId = extra.from;
    const sender = msg.key.participant || msg.key.remoteJid;
    const settings = database.getGroupSettings(chatId);

    // 1. Admin/Owner bypass check
    const groupMetadata = await sock.groupMetadata(chatId).catch(() => ({ participants: [] }));
    const participant = groupMetadata.participants.find(p => p.id === sender);
    const isSenderAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');

    if (extra.isAdmin || isSenderAdmin || extra.isOwner) return;
    if (!settings.antisticker) return;

    try {
      // 2. Delete the sticker message
      await sock.sendMessage(chatId, { delete: msg.key }).catch(() => {});

      // 3. Add warning to database
      const userData = database.addWarning(chatId, sender, 'স্টিকার স্প্যাম');
      const warnCount = userData.count;

      // 4. Check warning limit (Kick at 3)
      if (warnCount >= 3) {
        await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
        await sock.sendMessage(chatId, {
          text: `🚫 *@${sender.split('@')[0]}* কে গ্রুপ থেকে *কিক* করা হয়েছে!\n*কারণ:* স্টিকার স্প্যাম (*3/3 ওয়ার্ন*)`,
          mentions: [sender]
        });
        database.clearWarnings(chatId, sender);
      } else {
        // 5. Send warning notification
        await sock.sendMessage(chatId, {
          text: `⚠️ *@${sender.split('@')[0]}* *স্টিকার ডিটেক্ট!*\n*ওয়ার্নিং:* (*${warnCount}/3*)\n\n*স্টিকার পাঠানো বন্ধ করুন। পরের বার কিক খাবেন।*`,
          mentions: [sender]
        });
      }
    } catch (err) {
      console.error('Antisticker check error:', err);
    }
  }
};