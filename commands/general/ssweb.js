/**
 * SSWeb - Screenshot Website Command
 */

const APIs = require('../../utils/api');

module.exports = {
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss', 'ওয়েবশট'],
  category: 'general',
  description: 'ওয়েবসাইটের স্ক্রিনশট তুলুন',
  usage: '.ssweb <url>',

  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply('❌ *ওয়েবসাইটের লিংক দিন!*\n\n*উদাহরণ:* *.ssweb https://github.com*');
      }

      const url = args.join(' ');

      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return extra.reply('❌ *সঠিক লিংক দিন। http:// অথবা https:// দিয়ে শুরু হতে হবে*');
      }

      await sock.sendMessage(extra.from, {
        react: { text: '📥', key: msg.key }
      });

      await extra.reply('🔄 *ওয়েবসাইটের স্ক্রিনশট নেওয়া হচ্ছে...*');

      const screenshotBuffer = await APIs.screenshotWebsite(url);

      await sock.sendMessage(extra.from, {
        image: screenshotBuffer,
        caption: `🌐 *ওয়েবসাইট:* ${url}`
      }, { quoted: msg });

    } catch (error) {
      console.error('SSWeb command error:', error);
      await extra.reply(`❌ *স্ক্রিনশট নিতে সমস্যা হয়েছে: ${error.message}*`);
    }
  }
};