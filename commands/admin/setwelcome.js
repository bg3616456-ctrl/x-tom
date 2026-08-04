/**
 * Set Welcome - Customize welcome message
 */

const db = require('../../database');

module.exports = {
  name: 'setwelcome',
  aliases: ['welcometext', 'swagotomtext'],
  category: 'admin',
  desc: 'কাস্টম ওয়েলকাম মেসেজ সেট করা',
  usage: 'setwelcome <মেসেজ> (নতুন মেম্বার মেনশন করতে @user ব্যবহার করুন)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      
      if (!args.length) {
        const groupSettings = db.getGroupSettings(groupId);
        return await sock.sendMessage(groupId, {
          text: `📝 *বর্তমান ওয়েলকাম মেসেজ*\n\n*${groupSettings.welcomeMessage}*\n\n*ব্যবহার:*.setwelcome <মেসেজ>\n\n*টিপস:* নতুন মেম্বারকে মেনশন করতে *@user* ব্যবহার করুন`
        }, { quoted: msg });
      }
      
      const welcomeMessage = args.join(' ');
      
      if (welcomeMessage.length > 500) {
        return await sock.sendMessage(groupId, {
          text: '❌ *ওয়েলকাম মেসেজ অনেক বড় হয়ে গেছে! সর্বোচ্চ ৫০ অক্ষর দেওয়া যাবে।*'
        }, { quoted: msg });
      }
      
      db.updateGroupSettings(groupId, { welcomeMessage });
      
      await sock.sendMessage(groupId, {
        text: `✅ *ওয়েলকাম মেসেজ আপডেট করা হয়েছে!*\n\n*প্রিভিউ:*\n${welcomeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}`,
        mentions: [msg.key.participant]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Set Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *এরর:* ${error.message}`
      }, { quoted: msg });
    }
  }
};