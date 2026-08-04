/**
 * Block Command - Block a user
 */

module.exports = {
  name: 'block',
  aliases: ['blk', 'ban'],
  category: 'owner',
  description: 'একজন ইউজারকে ব্লক করুন',
  usage: '.block @user অথবা রিপ্লাই',
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
        return extra.reply('❌ *একজন ইউজারকে মেনশন করুন অথবা রিপ্লাই দিন ব্লক করার জন্য!*\n*উদাহরণ:* *.block @user*');
      }

      // Check if already owner
      if (target === sock.user.id) {
        return extra.reply('❌ *নিজেকে ব্লক করা যাবে না!*');
      }

      await sock.updateBlockStatus(target, 'block');

      const userNumber = target.split('@')[0];

      await sock.sendMessage(extra.from, {
        text: `🔨 *ইউজার ব্লক করা হয়েছে!*\n\n` +
              `*👤 ইউজার:* @${userNumber}\n` +
              `*✅ স্ট্যাটাস:* *সফলভাবে ব্লক করা হয়েছে*\n\n` +
              `*এই ইউজার এখন আর আপনাকে মেসেজ বা কল করতে পারবে না।*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[block cmd] error:', error);
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};