/**
 * Group Link Command - Get group invite link
 */

module.exports = {
    name: 'grouplink',
    aliases: ['link', 'invite', 'gplink', 'grouplink'],
    category: 'admin',
    description: 'গ্রুপের ইনভাইট লিংক বের করা',
    usage: '.grouplink',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,

    async execute(sock, msg, args, extra) {
      try {
        const code = await sock.groupInviteCode(extra.from);
        const link = `https://chat.whatsapp.com/${code}`;

        let text = `🔗 *গ্রুপের ইনভাইট লিংক*\n\n`;
        text += `📱 *গ্রুপ:* ${extra.groupMetadata.subject}\n`;
        text += `🔗 *লিংক:* ${link}\n\n`;
        text += `⚠️ *এই লিংক পাবলিকলি শেয়ার করবেন না!*`;

        await extra.reply(text);

      } catch (error) {
        await extra.reply(`❌ *এরর:* ${error.message}`);
      }
    }
  };