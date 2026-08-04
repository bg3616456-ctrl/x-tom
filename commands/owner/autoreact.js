/**
 * Auto-React Command - Configure automatic reactions
 */

const { load, save } = require('../../utils/autoReact');

module.exports = {
  name: 'autoreact',
  aliases: ['ar', 'autorea'],
  category: 'owner',
  description: 'অটো রিয়াক্ট অন/অফ এবং মুড সেট করা',
  usage: '.autoreact <on/off/set bot/set all>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        return extra.reply(
          `🤖 *অটো-রিয়াক্ট সিস্টেম*\n\n` +
          `*অপশন:*\n` +
          `*.autoreact on* - *অটো রিয়াক্ট চালু*\n` +
          `*.autoreact off* - *অটো রিয়াক্ট বন্ধ*\n` +
          `*.autoreact set bot* - *শুধু বট কমান্ডে রিয়াক্ট*\n` +
          `*.autoreact set all* - *সব মেসেজে রিয়াক্ট*\n\n` +
          `*বর্তমান স্ট্যাটাস দেখতে:* *.autoreact status*`
        );
      }

      const db = load();
      const opt = args.join(' ').toLowerCase();

      if (opt === 'on') {
        db.enabled = true;
        save(db);
        return extra.reply('✅ *অটো-রিয়াক্ট চালু করা হয়েছে!*\n*এখন থেকে বট অটোমেটিক রিয়াক্ট দিবে।*');
      }

      if (opt === 'off') {
        db.enabled = false;
        save(db);
        return extra.reply('❌ *অটো-রিয়াক্ট বন্ধ করা হয়েছে!*\n*এখন থেকে আর অটো রিয়াক্ট দিবে না।*');
      }

      if (opt === 'set bot') {
        db.mode = 'bot';
        save(db);
        return extra.reply('🤖 *অটো-রিয়াক্ট মুড:* *শুধু বট কমান্ড*\n*শুধুমাত্র বটের কমান্ডে* ⏳ *রিয়াক্ট দিবে।*');
      }

      if (opt === 'set all') {
        db.mode = 'all';
        save(db);
        return extra.reply('🌟 *অটো-রিয়াক্ট মুড:* *সব মেসেজ*\n*সব মেসেজে রেন্ডম ইমোজি রিয়াক্ট দিবে।*');
      }

      if (opt === 'status') {
        const status = db.enabled? '✅ *চালু*' : '❌ *বন্ধ*';
        const mode = db.mode === 'bot'? '*শুধু বট কমান্ড*' : '*সব মেসেজ*';
        return extra.reply(
          `🤖 *অটো-রিয়াক্ট স্ট্যাটাস*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*মুড:* ${mode}`
        );
      }

      extra.reply('❌ *ভুল অপশন!*\n*ব্যবহার:* *on | off | set bot | set all | status*');
    } catch (err) {
      console.error('[autoreact cmd] error:', err);
      extra.reply('❌ *অটো-রিয়াক্ট সেটিং আপডেট করতে সমস্যা হয়েছে।*');
    }
  }
};