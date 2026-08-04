/**
 * Anti-Group Mention Command - Toggle antigroupmention protection with delete/kick options
 */

const database = require('../../database');

module.exports = {
  name: 'antigroupmention',
  aliases: ['agm', 'antigrouptag'],
  category: 'admin',
  description: 'গ্রুপের নাম মেনশন করলে প্রোটেকশন দেয়',
  usage: '.antigroupmention <on/off/set/get>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antigroupmentionAction || 'delete';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(
          `📌 *অ্যান্টি-গ্রুপ-মেনশন সিস্টেম*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*একশন:* *${actionText}*\n\n` +
          `*কাজ:* কেউ গ্রুপের নাম মেনশন করলে অ্যাকশন নেওয়া হবে\n\n` +
          `*ব্যবহার:*\n` +
          `.antigroupmention on\n` +
          `.antigroupmention off\n` +
          `.antigroupmention set delete | kick\n` +
          `.antigroupmention get`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antigroupmention) {
          return extra.reply('*অ্যান্টি-গ্রুপ-মেনশন আগে থেকেই চালু আছে!*');
        }
        database.updateGroupSettings(extra.from, { antigroupmention: true });
        return extra.reply('✅ *অ্যান্টি-গ্রুপ-মেনশন চালু করা হয়েছে!*\n\n*কেউ গ্রুপের নাম মেনশন করলে অ্যাকশন নেওয়া হবে।*');
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antigroupmention: false });
        return extra.reply('❌ *অ্যান্টি-গ্রুপ-মেনশন বন্ধ করা হয়েছে!*');
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply('*একশন সিলেক্ট করুন:*.antigroupmention set delete | kick');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('*ভুল একশন! শুধু delete অথবা kick সিলেক্ট করুন।*');
        }

        database.updateGroupSettings(extra.from, {
          antigroupmentionAction: setAction,
          antigroupmention: true // Auto-enable when setting action
        });

        const actionText = setAction === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`✅ *অ্যান্টি-গ্রুপ-মেনশন একশন সেট করা হয়েছে:* *${actionText}*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antigroupmentionAction || 'delete';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`📌 *অ্যান্টি-গ্রুপ-মেনশন কনফিগারেশন:*\n*স্ট্যাটাস:* ${status}\n*একশন:* *${actionText}*`);
      }

      return extra.reply('*বিস্তারিত জানতে ব্যবহার করুন:*.antigroupmention');

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};