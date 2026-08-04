/**
 * Welcome - Enable/disable welcome messages
 */

const db = require('../../database');

module.exports = {
  name: 'welcome',
  aliases: ['welcomeon', 'welcomeoff', 'swagotom'],
  category: 'admin',
  desc: 'ওয়েলকাম মেসেজ অন/অফ করা',
  usage: 'welcome on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      if (!action ||!['on', 'off'].includes(action)) {
        const groupSettings = db.getGroupSettings(groupId);
        const status = groupSettings.welcome? '*চালু আছে*' : '*বন্ধ আছে*';
        return await sock.sendMessage(groupId, {
          text: `👋 *ওয়েলকাম মেসেজ*\n\n*স্ট্যাটাস:* ${status}\n*মেসেজ:* ${groupSettings.welcomeMessage}\n\n*ব্যবহার:*.welcome on/off\n*কাস্টম করতে:*.setwelcome <মেসেজ>`
        }, { quoted: msg });
      }

      const enable = action === 'on';
      db.updateGroupSettings(groupId, { welcome: enable });

      await sock.sendMessage(groupId, {
        text: `✅ *ওয়েলকাম মেসেজ ${enable? 'চালু' : 'বন্ধ'} করা হয়েছে!*${enable? '\n\n*এখন থেকে নতুন মেম্বার আসলে ওয়েলকাম মেসেজ পাবে।*' : ''}`
      }, { quoted: msg });

    } catch (error) {
      console.error('Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *এরর:* ${error.message}`
      }, { quoted: msg });
    }
  }
};