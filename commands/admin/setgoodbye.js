/**
 * Set Goodbye - Customize goodbye message
 */

const db = require('../../database');

module.exports = {
  name: 'setgoodbye',
  aliases: ['goodbyetext', 'bidaytext'],
  category: 'admin',
  desc: 'কাস্টম বিদায় মেসেজ সেট করা',
  usage: 'setgoodbye <মেসেজ> (মেম্বারকে মেনশন করতে @user ব্যবহার করুন)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      
      if (!args.length) {
        const groupSettings = db.getGroupSettings(groupId);
        return await sock.sendMessage(groupId, {
          text: `📝 *বর্তমান বিদায় মেসেজ*\n\n*${groupSettings.goodbyeMessage}*\n\n*ব্যবহার:*.setgoodbye <মেসেজ>\n\n*টিপস:* যে মেম্বার লিভ করবে তাকে মেনশন করতে *@user* ব্যবহার করুন`
        }, { quoted: msg });
      }
      
      const goodbyeMessage = args.join(' ');
      
      if (goodbyeMessage.length > 500) {
        return await sock.sendMessage(groupId, {
          text: '❌ *বিদায় মেসেজ অনেক বড় হয়ে গেছে! সর্বোচ্চ ৫০ অক্ষর দেওয়া যাবে।*'
        }, { quoted: msg });
      }
      
      db.updateGroupSettings(groupId, { goodbyeMessage });
      
      await sock.sendMessage(groupId, {
        text: `✅ *বিদায় মেসেজ আপডেট করা হয়েছে!*\n\n*প্রিভিউ:*\n${goodbyeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}`,
        mentions: [msg.key.participant]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Set Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *এরর:* ${error.message}`
      }, { quoted: msg });
    }
  }
};