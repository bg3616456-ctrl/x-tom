/**
 * ResetWarn Command - Reset warnings for a user
 */

const database = require('../../database');

module.exports = {
  name: 'resetwarn',
  aliases: ['resetwarning', 'clearwarn', 'unwarn', 'delwarn', 'warnclear'],
  category: 'admin',
  description: 'কোনো ইউজারের সব সতর্কতা রিসেট করা',
  usage: '.resetwarn @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        target = ctx.participant;
      } else {
        return extra.reply('❌ *সতর্কতা রিসেট করতে হলে কাউকে মেনশন করুন অথবা তার মেসেজে রিপ্লাই করুন!*\n\n*উদাহরণ:*.resetwarn @user');
      }

      // Get current warnings before clearing
      const currentWarnings = database.getWarnings(extra.from, target);

      if (currentWarnings.count === 0) {
        return extra.reply(`✅ *@${target.split('@')[0]} এর কোনো সতর্কতা নেই।*`, { mentions: [target] });
      }

      // Clear all warnings
      database.clearWarnings(extra.from, target);

      await sock.sendMessage(extra.from, {
        text: `✅ * এডমিনের আদেশে সতর্কতা সব মুছে!*\n\n*👤 ইউজার:* @${target.split('@')[0]}\n*⚠️ পূর্বের সতর্কতা:* ${currentWarnings.count}\n\n*তোরে মাফ করে গ্রুপে থাকতে দিলাম।😾👥💬*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('ResetWarn command error:', error);
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};