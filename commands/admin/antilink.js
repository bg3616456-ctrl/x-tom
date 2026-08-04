/**
 * Antilink Command - Toggle antilink protection with delete/kick options
 */

const database = require('../../database');

module.exports = {
  name: 'antilink',
  aliases: ['linkblock', 'antigrp'],
  category: 'admin',
  description: 'গ্রুপে লিংক পাঠানো বন্ধ করা',
  usage: '.antilink <on/off/set/get>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antilink? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antilinkAction || 'delete';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(
          `🔗 *অ্যান্টি-লিংক সিস্টেম*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*একশন:* *${actionText}*\n\n` +
          `*কাজ:* গ্রুপে কোনো লিংক পাঠালে অটো অ্যাকশন নেওয়া হবে\n\n` +
          `*ব্যবহার:*\n` +
          `.antilink on\n` +
          `.antilink off\n` +
          `.antilink set delete | kick\n` +
          `.antilink get`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antilink) {
          return extra.reply('*অ্যান্টি-লিংক আগে থেকেই চালু আছে!*');
        }
        database.updateGroupSettings(extra.from, { antilink: true });
        return extra.reply('✅ *অ্যান্টি-লিংক চালু করা হয়েছে!*\n\n*এখন থেকে গ্রুপে কোনো লিংক পাঠানো যাবে না।*');
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antilink: false });
        return extra.reply('❌ *অ্যান্টি-লিংক বন্ধ করা হয়েছে!*');
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply('*একশন সিলেক্ট করুন:*.antilink set delete | kick');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('*ভুল একশন! শুধু delete অথবা kick সিলেক্ট করুন।*');
        }

        database.updateGroupSettings(extra.from, {
          antilinkAction: setAction,
          antilink: true // Auto-enable when setting action
        });

        const actionText = setAction === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`✅ *অ্যান্টি-লিংক একশন সেট করা হয়েছে:* *${actionText}*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antilink? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antilinkAction || 'delete';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`🔗 *অ্যান্টি-লিংক কনফিগারেশন:*\n*স্ট্যাটাস:* ${status}\n*একশন:* *${actionText}*`);
      }

      return extra.reply('*বিস্তারিত জানতে ব্যবহার করুন:*.antilink');

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};