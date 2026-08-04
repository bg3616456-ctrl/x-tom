/**
 * Goodbye - Enable/disable goodbye messages
 */

const db = require('../../database');

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff', 'biday'],
  category: 'admin',
  desc: 'বিদায় মেসেজ অন/অফ করা',
  usage: 'goodbye on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      if (!action ||!['on', 'off'].includes(action)) {
        const groupSettings = db.getGroupSettings(groupId);
        const status = groupSettings.goodbye? '✅ *চালু আছে*' : '❌ *বন্ধ আছে*';
        return await sock.sendMessage(groupId, {
          text: `👋 *বিদায় মেসেজ*\n\n*স্ট্যাটাস:* ${status}\n*মেসেজ:* ${groupSettings.goodbyeMessage}\n\n*ব্যবহার:*.goodbye on/off\n\n*কাস্টম করতে:*.setgoodbye <মেসেজ>`
        }, { quoted: msg });
      }

      const enable = action === 'on';
      db.updateGroupSettings(groupId, { goodbye: enable });

      await sock.sendMessage(groupId, {
        text: `✅ *বিদায় মেসেজ ${enable? 'চালু' : 'বন্ধ'} করা হয়েছে!*${enable? '\n\n*কেউ গ্রুপ থেকে লিভ করলে এখন বিদায় মেসেজ যাবে।*' : ''}`
      }, { quoted: msg });

    } catch (error) {
      console.error('Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *এরর:* ${error.message}`
      }, { quoted: msg });
    }
  }
};