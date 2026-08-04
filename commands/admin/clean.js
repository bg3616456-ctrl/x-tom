/**
 * Clean Command - Delete messages in group
 */

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear', 'msgclean'],
  category: 'admin',
  description: 'গ্রুপের মেসেজ ডিলিট করা। রিপ্লাই দিলে নির্দিষ্ট ইউজারের মেসেজ ডিলিট হবে',
  usage: '.clean <সংখ্যা>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const count = parseInt(args[0]);
      if (!count || count < 1 || count > 100) {
        return extra.reply('❌ *১ থেকে ১০০ এর মধ্যে একটি সঠিক সংখ্যা দিন।*\n\n*উদাহরণ:*.clean 10');
      }

      const jid = extra.from;
      const { store } = require('../../index');

      // Check if message is a reply
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      const msgs = store.messages[jid];
      if (!msgs) {
        return extra.reply('❌ *কোনো স্টোর করা মেসেজ পাওয়া যায়নি।*');
      }

      await extra.reply(`⏳ *${count} টি মেসেজ ডিলিট করা হচ্ছে...*`);

      let messagesToDelete = [];

      if (quotedMsg && quotedParticipant) {
        // Mode: Delete specific user's messages
        messagesToDelete = Object.values(msgs)
         .filter(m => {
            const sender = m.key.participant || m.key.remoteJid;
            return sender === quotedParticipant;
          })
         .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
         .slice(0, count);
      } else {
        // Mode: Delete last N messages from chat
        messagesToDelete = Object.values(msgs)
         .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
         .slice(0, count);
      }

      let deleted = 0;
      for (const m of messagesToDelete) {
        try {
          await sock.sendMessage(jid, { delete: m.key });
          deleted++;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error('[clean] delete error:', err.message);
        }
      }

      if (deleted > 0) {
        if (quotedParticipant) {
          await extra.reply(`✅ *${deleted} টি মেসেজ ডিলিট করা হয়েছে!*\n\n*👤 ইউজার:* @${quotedParticipant.split('@')[0]}`, { mentions: [quotedParticipant] });
        } else {
          await extra.reply(`✅ *${deleted} টি মেসেজ সফলভাবে ডিলিট করা হয়েছে!*`);
        }
      } else {
        await extra.reply('❌ *কোনো মেসেজ ডিলিট করা যায়নি।*');
      }

    } catch (e) {
      console.error('[clean cmd] error:', e);
      extra.reply('❌ *মেসেজ ক্লিন করা যায়নি!*');
    }
  }
};