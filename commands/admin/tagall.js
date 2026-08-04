/**
 * Tag All Command - Mention all group members
 */

module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'everyone', 'tag', 'all'],
    category: 'admin',
    description: 'গ্রুপের সব মেম্বারকে মেনশন করা',
    usage: '.tagall <মেসেজ>',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,

    async execute(sock, msg, args, extra) {
      try {
        const message = args.join(' ') || '📢 *সবাইকে ডাকা হচ্ছে!*';

        const participants = extra.groupMetadata.participants.map(p => p.id);

        let text = `📢 *গ্রুপ ঘোষণা*\n\n`;
        text += `*${message}*\n\n`;
        text += `👥 *মেনশনকৃত মেম্বার:*\n`;

        participants.forEach((participant, index) => {
          text += `*${index + 1}.* @${participant.split('@')[0]}\n`;
        });

        await sock.sendMessage(extra.from, {
          text,
          mentions: participants
        }, { quoted: msg });

      } catch (error) {
        await extra.reply(`❌ *এরর:* ${error.message}`);
      }
    }
  };