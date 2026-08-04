/**
 * Unblock Command - Unblock a user
 */

module.exports = {
  name: 'unblock',
  aliases: ['আনব্লক', 'unban'],
  category: 'owner',
  description: 'কোনো ইউজারকে আনব্লক করুন',
  usage: '.unblock @user অথবা রিপ্লাই',
  ownerOnly: true,

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
        return extra.reply(
          `🔓 *ইউজার আনব্লক*\n\n` +
          `*ব্যবহার:*\n` +
          `*.unblock @user* = মেনশন করে\n` +
          `*রিপ্লাই +* *.unblock* = রিপ্লাই দিয়ে\n` +
          `*_উদাহরণ:_* *.unblock @017xxxxxxxx*`
        );
      }

      const loadingMsg = await extra.reply(`🔄 *@${target.split('@')[0]} কে আনব্লক করা হচ্ছে...*`, [target]);

      await sock.updateBlockStatus(target, 'unblock');

      await sock.sendMessage(extra.from, {
        text: `✅ *@${target.split('@')[0]} সফলভাবে আনব্লক করা হয়েছে!*\n\n*_এখন এই ইউজার আপনাকে আবার মেসেজ দিতে পারবে।_*`,
        mentions: [target],
        edit: loadingMsg.key
      }, { quoted: msg });

    } catch (error) {
      console.error('Unblock error:', error);
      await extra.reply(`❌ *আনব্লক করতে সমস্যা:* ${error.message}`);
    }
  }
};