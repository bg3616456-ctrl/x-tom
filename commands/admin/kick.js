/**
 * Kick Command
 * Remove mentioned or replied users from the group
 * Includes robust self-kick prevention for PN/LID IDs
 */

const config = require('../../config');
const handler = require('../../handler');

module.exports = {
  name: 'kick',
  aliases: ['remove', 'berkore'],
  category: 'admin',
  description: 'মেনশন বা রিপ্লাই করা মেম্বারকে গ্রুপ থেকে বের করে দেয়',
  usage: '.kick @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      let usersToKick = [];

      if (mentioned && mentioned.length > 0) {
        usersToKick = mentioned;
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        usersToKick = [ctx.participant];
      }

      if (usersToKick.length === 0) {
        return extra.reply('👤 *কাউকে কিক করতে হলে তাকে মেনশন করুন অথবা তার মেসেজে রিপ্লাই করুন।*');
      }

      const botId = sock.user?.id || '';
      const botLid = sock.user?.lid || '';
      const botPhoneNumber = botId.includes(':')? botId.split(':')[0] : (botId.includes('@')? botId.split('@')[0] : botId);
      const botIdFormatted = botPhoneNumber + '@s.whatsapp.net';
      const botLidNumeric = botLid.includes(':')? botLid.split(':')[0] : (botLid.includes('@')? botLid.split('@')[0] : botLid);
      const botLidWithoutSuffix = botLid.includes('@')? botLid.split('@')[0] : botLid;

      const metadata = await sock.groupMetadata(chatId);
      const participants = metadata.participants || [];

      const isTryingToKickBot = usersToKick.some((userId) => {
        const userPhoneNumber = userId.includes(':')? userId.split(':')[0] : (userId.includes('@')? userId.split('@')[0] : userId);
        const userLidNumeric = userId.includes('@lid')? userId.split('@')[0].split(':')[0] : '';

        const directMatch = (
          userId === botId ||
          userId === botLid ||
          userId === botIdFormatted ||
          userPhoneNumber === botPhoneNumber ||
          (userLidNumeric && botLidNumeric && userLidNumeric === botLidNumeric)
        );

        if (directMatch) return true;

        const participantMatch = participants.some((p) => {
          const pPhoneNumber = p.phoneNumber? p.phoneNumber.split('@')[0] : '';
          const pId = p.id? p.id.split('@')[0] : '';
          const pLid = p.lid? p.lid.split('@')[0] : '';
          const pFullId = p.id || '';
          const pFullLid = p.lid || '';
          const pLidNumeric = pLid.includes(':')? pLid.split(':')[0] : pLid;

          const isThisParticipantBot = (
            pFullId === botId ||
            pFullLid === botLid ||
            pLidNumeric === botLidNumeric ||
            pPhoneNumber === botPhoneNumber ||
            pId === botPhoneNumber ||
            p.phoneNumber === botIdFormatted ||
            (botLid && pLid && botLidWithoutSuffix === pLid)
          );

          if (!isThisParticipantBot) return false;

          return (
            userId === pFullId ||
            userId === pFullLid ||
            userPhoneNumber === pPhoneNumber ||
            userPhoneNumber === pId ||
            userId === p.phoneNumber ||
            (pLid && userLidNumeric && userLidNumeric === pLidNumeric) ||
            (userLidNumeric && pLidNumeric && userLidNumeric === pLidNumeric)
          );
        });

        return participantMatch;
      });

      if (isTryingToKickBot) {
        await extra.reply('❌ *আমাকে নিজেকে কিক করা যাবে না!*');
        return;
      }

      await sock.groupParticipantsUpdate(chatId, usersToKick, 'remove');

      const usernames = usersToKick.map((jid) => `@${jid.split('@')[0]}`);
      const text = `✅ ${usernames.join(', ')} *কিরে ফকিন্নির পোলা তোর তো এই গ্রুপে থাকার কোনো যোগ্যতা নাই ....!!🐣😹💔*`;

      await sock.sendMessage(extra.from, { text, mentions: usersToKick }, { quoted: msg });
    } catch (error) {
      console.error('Kick command error:', error);
      await extra.reply('*❌ কিক করতে পারলাম না। বট অ্যাডমিন আছে কিনা চেক করুন।*');
    }
  },
};