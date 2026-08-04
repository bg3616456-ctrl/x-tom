/**
 * AutoSticker Command - Enable or disable auto-sticker conversion
 */

const database = require('../../database');

module.exports = {
  name: 'autosticker',
  aliases: ['autos', 'asticker', 'autostiker'],
  category: 'admin',
  description: 'ইমেজ/ভিডিও অটো স্টিকারে কনভার্ট করা অন/অফ করা',
  usage: '.autosticker <on/off>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.autosticker? '✅ *চালু*' : '❌ *বন্ধ*';
        return extra.reply(
          `📌 *অটো স্টিকার স্ট্যাটাস*\n\n` +
          `*স্ট্যাটাস:* ${status}\n\n` +
          `*চালু থাকলে গ্রুপে পাঠানো সব ইমেজ এবং ভিডিও অটোমেটিক স্টিকারে কনভার্ট হয়ে যাবে।*\n\n` +
          `*ব্যবহার:*\n` +
          `.autosticker on\n` +
          `.autosticker off`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).autosticker) {
          return extra.reply('*অটো স্টিকার আগে থেকেই চালু আছে!*');
        }
        database.updateGroupSettings(extra.from, { autosticker: true });
        return extra.reply('✅ *অটো স্টিকার চালু করা হয়েছে!*\n\n*এখন থেকে গ্রুপে পাঠানো সব ইমেজ এবং ভিডিও অটো স্টিকারে কনভার্ট হবে।*');
      }

      if (opt === 'off') {
        if (!database.getGroupSettings(extra.from).autosticker) {
          return extra.reply('*অটো স্টিকার আগে থেকেই বন্ধ আছে!*');
        }
        database.updateGroupSettings(extra.from, { autosticker: false });
        return extra.reply('❌ *অটো স্টিকার বন্ধ করা হয়েছে!*');
      }

      return extra.reply('❌ *ভুল অপশন!*\n*ব্যবহার:*.autosticker <on/off>');
    } catch (error) {
      console.error('[AutoSticker Command Error]:', error);
      return extra.reply('❌ *অটো স্টিকার সেটিং আপডেট করা যায়নি!*');
    }
  }
};