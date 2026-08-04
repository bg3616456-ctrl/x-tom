/**
 * Antibadword Command - Delete, Warn, and Kick system
 */

const database = require('../../database');
const warningTracker = new Map();
const WARN_LIMIT = 3;

module.exports = {
  name: 'antibadword',
  aliases: ['antibad', 'antigali', 'badword'],
  category: 'admin',
  description: 'খারাপ শব্দ ফিল্টার, ওয়ার্ন এবং কিক সিস্টেম',
  usage: '.antibadword <on/off/add/remove/list>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const opt = args[0]?.toLowerCase();

      if (!opt) {
        const settings = database.getGroupSettings(chatId);
        const status = settings.antibadword? '✅ *চালু*' : '❌ *বন্ধ*';
        return extra.reply(
          `🚫 *অ্যান্টি-ব্যাডওয়ার্ড সিস্টেম*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*ওয়ার্ন লিমিট:* *${WARN_LIMIT}*\n\n` +
          `*ব্যবহার:*\n` +
          `.antibadword on\n` +
          `.antibadword off\n` +
          `.antibadword add <শব্দ>\n` +
          `.antibadword remove <শব্দ>\n` +
          `.antibadword list`
        );
      }

      if (opt === 'on') {
        database.updateGroupSettings(chatId, { antibadword: true });
        return extra.reply('✅ *অ্যান্টি-ব্যাডওয়ার্ড প্রোটেকশন চালু করা হয়েছে!*\n\n*এখন খারাপ শব্দ বললে 3 বার ওয়ার্ন দিয়ে কিক করা হবে।*');
      }

      if (opt === 'off') {
        database.updateGroupSettings(chatId, { antibadword: false });
        return extra.reply('❌ *অ্যান্টি-ব্যাডওয়ার্ড প্রোটেকশন বন্ধ করা হয়েছে!*');
      }

      if (opt === 'add') {
        if (!args[1]) return extra.reply('*একটি শব্দ দিন:*.antibadword add <শব্দ>');
        const word = args[1].toLowerCase();
        let settings = database.getGroupSettings(chatId);
        let words = settings.badwords || [];
        if (words.includes(word)) return extra.reply(`* "${word}" আগে থেকেই লিস্টে আছে।*`);
        words.push(word);
        database.updateGroupSettings(chatId, { badwords: words });
        return extra.reply(`✅ * "${word}" শব্দটি ব্যান লিস্টে যোগ করা হয়েছে।*`);
      }

      if (opt === 'remove') {
        if (!args[1]) return extra.reply('*একটি শব্দ দিন:*.antibadword remove <শব্দ>');
        const word = args[1].toLowerCase();
        let settings = database.getGroupSettings(chatId);
        let words = settings.badwords || [];
        if (!words.includes(word)) return extra.reply(`* "${word}" লিস্টে পাওয়া যায়নি।*`);
        words = words.filter(w => w!== word);
        database.updateGroupSettings(chatId, { badwords: words });
        return extra.reply(`✅ * "${word}" শব্দটি ব্যান লিস্ট থেকে বাদ দেওয়া হয়েছে।*`);
      }

      if (opt === 'list') {
        const words = database.getGroupSettings(chatId).badwords || [];
        return words.length > 0
         ? extra.reply(`🚫 *ব্যান শব্দের লিস্ট:*\n${words.map((w, i) => `*${i+1}.* ${w}`).join('\n')}`)
          : extra.reply('*ব্যান লিস্ট খালি আছে।*');
      }

      return extra.reply('*বিস্তারিত জানতে ব্যবহার করুন:*.antibadword');

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  },

  async checkBadword(sock, msg, extra) {
    const chatId = extra.from;
    const sender = extra.sender;

    if (extra.isAdmin) return;

    const settings = database.getGroupSettings(chatId);
    if (!settings.antibadword ||!settings.badwords) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!text) return;

    const foundWord = settings.badwords.find(word => text.toLowerCase().includes(word));

    if (foundWord) {
      try {
        await sock.sendMessage(chatId, { delete: msg.key }).catch(() => {});

        if (!warningTracker.has(sender)) warningTracker.set(sender, 0);
        let warns = warningTracker.get(sender) + 1;
        warningTracker.set(sender, warns);

        if (warns >= WARN_LIMIT) {
          await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
          await sock.sendMessage(chatId, {
            text: `🚫 *@${sender.split('@')[0]}* কে গ্রুপ থেকে *কিক* করা হয়েছে!\n*কারণ:* বারবার খারাপ ভাষা ব্যবহার`,
            mentions: [sender]
          });
          warningTracker.set(sender, 0);
        } else {
          await sock.sendMessage(chatId, {
            text: `⚠️ *@${sender.split('@')[0]}* *ওয়ার্নিং!* (*${warns}/${WARN_LIMIT}*)\n\n*খারাপ শব্দ ব্যবহার করবেন না। পরের বার কিক খাবেন।*`,
            mentions: [sender]
          });
        }
      } catch (err) {
        console.error('Antibadword error:', err);
      }
    }
  }
};