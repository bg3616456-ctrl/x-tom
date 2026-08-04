/**
 * Warn Command - Warn a user
 */

const database = require('../../database');
const config = require('../../config');

module.exports = {
  name: 'warn',
  aliases: ['warning', 'satorko'],
  category: 'admin',
  description: 'কোনো মেম্বারকে সতর্ক করা',
  usage: '.warn @user <কারণ>',
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
        return extra.reply('❌ সতর্ক করতে হলে কাউকে মেনশন করুন অথবা তার মেসেজে রিপ্লাই করুন!\n\nউদাহরণ:.warn @user নিয়ম ভঙ্গ');
      }

      const reason = args.slice(mentioned.length > 0? 1 : 0).join(' ') || '*কোন কারণ ছাড়াই এডমিনের আদেশে তোরে ওয়ার্নিং দিলাম😾*';

      // Cannot warn admins
      const foundParticipant = extra.groupMetadata.participants.find(
        p => (p.id === target || p.lid === target) && (p.admin === 'admin' || p.admin === 'superadmin')
      );

      if (foundParticipant) {
        return extra.reply('❌ অ্যাডমিনকে সতর্ক করা যাবে না!');
      }

      const warnings = database.addWarning(extra.from, target, reason);

      let text = `⚠️ *সতর্কবার্তা*\n\n`;
      text += `👤 ইউজার: @${target.split('@')[0]}\n`;
      text += `📝 কারণ: ${reason}\n`;
      text += `⚠️ সতর্কতা: ${warnings.count}/${config.maxWarnings}\n\n`;

      if (warnings.count >= config.maxWarnings) {
        text += `*❌ কিরে তোরে তিনবার সতর্ক কলাম। তোর গায়ে লাগলো না,এবার কিক খা😹🌸🚩*`;

        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });

        if (extra.isBotAdmin) {
          await sock.groupParticipantsUpdate(extra.from, [target], 'remove');
          database.clearWarnings(extra.from, target);
        }
      } else {
        text += `*⚠️ পরবর্তী সতর্কতায় তোরে গ্রুপ থাইকা অপমান করে উষ্টা দিয়া বের করে দিমু সাবধান!☠️🥱😾*`;

        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('Warn command error:', error);
      await extra.reply(`❌ এরর: ${error.message}`);
    }
  }
};