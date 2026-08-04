/**
 * Promote Command - Make member admin
 */

const { findParticipant } = require('../../utils/jidHelper');

module.exports = {
  name: 'promote',
  aliases: ['makeadmin', 'adminbanao'],
  category: 'admin',
  description: 'কোনো মেম্বারকে অ্যাডমিন বানানো',
  usage: '.promote @user',
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
        return extra.reply('❌ *অ্যাডমিন বানাতে হলে কাউকে মেনশন করুন অথবা তার মেসেজে রিপ্লাই করুন!*\n\n*উদাহরণ:*.promote @user');
      }

      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);

      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);

      if (!foundParticipant) {
        return extra.reply('❌ *এই ইউজারকে গ্রুপে পাওয়া যায়নি!*');
      }

      // Check if already admin using fresh data
      if (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin') {
        return extra.reply('❌ *এই ইউজার আগে থেকেই অ্যাডমিন আছে!*');
      }

      await sock.groupParticipantsUpdate(extra.from, [target], 'promote');

      await sock.sendMessage(extra.from, {
        text: `✅ *@${target.split('@')[0]} এখন অ্যাডমিন!*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};