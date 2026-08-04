/**
 * Delete Command
 * Delete a replied message
 */

module.exports = {
  name: 'delete',
  aliases: ['del', 'msgdel', 'deletemsg'],
  description: 'রিপ্লাই করা মেসেজ ডিলিট করা',
  usage: '.delete (কোনো মেসেজে রিপ্লাই দিন)',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.stanzaId || !ctx?.participant) {
        return extra.reply('🗑️ *যে মেসেজ ডিলিট করতে চান সেটাতে রিপ্লাই করুন।*');
      }

      const deleteKey = {
        remoteJid: extra.from,
        id: ctx.stanzaId,
        participant: ctx.participant
      };

      await sock.sendMessage(extra.from, { delete: deleteKey });

      await extra.reply('✅ *মেসেজ সফলভাবে ডিলিট করা হয়েছে!*');

    } catch (error) {
      console.error('Delete command error:', error);
      await extra.reply('❌ *মেসেজ ডিলিট করা যায়নি!*');
    }
  }
};