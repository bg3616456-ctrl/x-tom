/**
 * Demote Command - Remove admin privileges
 */

const { findParticipant } = require('../../utils/jidHelper');

module.exports = {
  name: 'demote',
  aliases: ['removeadmin', 'adminhato'],
  category: 'admin',
  description: 'কোনো অ্যাডমিনের ক্ষমতা বাতিল করা',
  usage: '.demote @user',
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
        return extra.reply('❌ *অ্যাডমিন পদ থেকে সরাতে হলে কাউকে মেনশন করুন অথবা তার মেসেজে রিপ্লাই করুন!*\n\n*উদাহরণ:*.demote @user');
      }

      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);

      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);

      if (!foundParticipant) {
        return extra.reply('❌ *এই ইউজারকে গ্রুপে পাওয়া যায়নি!*');
      }

      // Check if user is admin using fresh data
      if (foundParticipant.admin!== 'admin' && foundParticipant.admin!== 'superadmin') {
        return extra.reply('❌ *এই ইউজার অ্যাডমিন না!*');
      }

      await sock.groupParticipantsUpdate(extra.from, [target], 'demote');

      await sock.sendMessage(extra.from, {
        text: `✅ *@${target.split('@')[0]} এখন আর অ্যাডমিন নেই!*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};