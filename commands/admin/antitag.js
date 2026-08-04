/**
 * AntiTag Command
 * Enable/disable anti-tag and set action (delete/kick)
 */

const database = require('../../database');

module.exports = {
  name: 'antitag',
  aliases: ['antimention', 'at', 'antitagall'],
  description: 'ট্যাগঅল/হাইডট্যাগ থেকে গ্রুপকে প্রোটেকশন দেওয়া',
  usage: '.antitag <on/off/set/get>',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antitag? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antitagAction || 'delete';
        return extra.reply(
          `📛 *অ্যান্টি-ট্যাগ সিস্টেম*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*একশন:* *${action === 'kick'? 'কিক' : 'ডিলিট'}*\n\n` +
          `*ব্যবহার:*\n` +
          `.antitag on\n` +
          `.antitag off\n` +
          `.antitag set delete | kick\n` +
          `.antitag get`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antitag) {
          return extra.reply('*অ্যান্টি-ট্যাগ আগে থেকেই চালু আছে!*');
        }
        database.updateGroupSettings(extra.from, { antitag: true });
        return extra.reply('✅ *অ্যান্টি-ট্যাগ চালু করা হয়েছে!*\n\n*কেউ ট্যাগঅল/হাইডট্যাগ করলে অ্যাকশন নেওয়া হবে।*');
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antitag: false });
        return extra.reply('❌ *অ্যান্টি-ট্যাগ বন্ধ করা হয়েছে!*');
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply('*একশন সিলেক্ট করুন:*.antitag set delete | kick');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('*ভুল একশন! শুধু delete অথবা kick সিলেক্ট করুন।*');
        }

        database.updateGroupSettings(extra.from, {
          antitagAction: setAction,
          antitag: true // Auto-enable when setting action
        });

        const actionText = setAction === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`✅ *অ্যান্টি-ট্যাগ একশন সেট করা হয়েছে:* *${actionText}*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antitag? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antitagAction || 'delete';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`📛 *অ্যান্টি-ট্যাগ কনফিগারেশন:*\n*স্ট্যাটাস:* ${status}\n*একশন:* *${actionText}*`);
      }

      return extra.reply('*বিস্তারিত জানতে ব্যবহার করুন:*.antitag');

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};