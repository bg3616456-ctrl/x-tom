/**
 * Set Prefix Command - Change bot command prefix
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'প্রিফিক্স'],
  category: 'owner',
  description: 'বটের কমান্ড প্রিফিক্স পরিবর্তন করুন',
  usage: '.setprefix <নতুন প্রিফিক্স>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(
          `📌 *প্রিফিক্স সেটিং*\n\n` +
          `*বর্তমান প্রিফিক্স:* *${config.prefix}*\n\n` +
          `*ব্যবহার:* *.setprefix <নতুন প্রিফিক্স>*\n` +
          `*উদাহরণ:* *.setprefix !*\n\n` +
          `*_নোট: প্রিফিক্স 1-3 অক্ষরের মধ্যে হতে হবে_*`
        );
      }

      const newPrefix = args[0];

      if (newPrefix.length > 3) {
        return extra.reply('❌ *প্রিফিক্স 1-3 অক্ষরের বেশি হতে পারবে না!*');
      }

      if (newPrefix.length === 0) {
        return extra.reply('❌ *প্রিফিক্স খালি রাখা যাবে না!*');
      }

      await extra.reply(`🔄 *প্রিফিক্স পরিবর্তন হচ্ছে...*\n*নতুন প্রিফিক্স:* *${newPrefix}*`);

      // Update config
      config.prefix = newPrefix;

      // Update config file
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf-8');
      
      // Replace prefix (handles both single and double quotes)
      configContent = configContent.replace(
        /prefix:\s*['"`]([^'"`]*)['"`]/,
        `prefix: '${newPrefix.replace(/'/g, "\\'")}'`
      );
      fs.writeFileSync(configPath, configContent, 'utf-8');

      await extra.reply(
        `✅ *প্রিফিক্স সফলভাবে পরিবর্তন করা হয়েছে!*\n\n` +
        `*পুরাতন:* *${config.prefix}*\n` +
        `*নতুন:* *${newPrefix}*\n\n` +
        `*নতুন কমান্ড ফরম্যাট:* *${newPrefix}command*\n` +
        `*উদাহরণ:* *${newPrefix}menu* *${newPrefix}restart*\n\n` +
        `*_বট রিস্টার্ট দিলে সব জায়গায় আপডেট হবে_*`
      );

    } catch (error) {
      console.error('Setprefix error:', error);
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};