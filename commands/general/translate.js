/**
 * Translate Command - Translate text to different languages
 */

const APIs = require('../../utils/api');

module.exports = {
  name: 'translate',
  aliases: ['tr', 'trans', 'অনুবাদ'],
  category: 'general',
  description: 'লেখা এক ভাষা থেকে অন্য ভাষায় অনুবাদ করুন',
  usage: '.translate <lang code> <text>',

  async execute(sock, msg, args, extra) {
    try {
      if (args.length < 2) {
        return extra.reply(
          `❌ *ব্যবহার:* *.translate <ভাষার কোড> <লেখা>*\n\n` +
          `*উদাহরণ:* *.translate bn Hello world*\n` +
          `*উদাহরণ:* *.translate en কেমন আছেন*`
        );
      }

      const targetLang = args[0];
      const text = args.slice(1).join(' ');

      await extra.reply('🔄 *অনুবাদ করা হচ্ছে...*');

      const result = await APIs.translate(text, targetLang);

      let replyText = `🌐 *অনুবাদ*\n\n`;
      replyText += `📝 *মূল লেখা:* ${text}\n`;
      replyText += `🔤 *অনুবাদ:* ${result.translation || result}\n`;
      replyText += `🌍 *ভাষা:* ${targetLang.toUpperCase()}`;

      await extra.reply(replyText);

    } catch (error) {
      await extra.reply(
        `❌ *অনুবাদ করতে সমস্যা হয়েছে!*\n\n` +
        `*সাপোর্টেড কোড:* en, es, fr, de, it, pt, ru, ja, ko, zh, bn, hi, ar\n\n` +
        `*এরর:* ${error.message}`
      );
    }
  }
};