/**
 * Menu Command - Display all available commands
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Show all available commands',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};

      // Group commands by category
      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          if (!categories[cmd.category]) {
            categories[cmd.category] = [];
          }
          categories[cmd.category].push(cmd);
        }
      });

      const ownerNames = Array.isArray(config.ownerName)? config.ownerName : [config.ownerName];
      const displayOwner = ownerNames[0] || config.ownerName || 'Bot Owner';

      const time = new Date().toLocaleTimeString('en-US', { hour12: true });
      const date = new Date().toLocaleDateString('en-GB');
      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      const runtime = `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;

      let menuText = `*╭┈───〔 ᴛᴏᴍ-x♡💗ʏᴇᴀɴ 〕┈───⊷*\n`;
      menuText += `*├✦ Oᴡɴᴇʀ:* ${displayOwner}\n`;
      menuText += `*├✦ Cᴏᴍᴍᴀɴᴅꜱ:* 110+\n`;
      menuText += `*├✦ Rᴜɴᴛɪᴍᴇ:* ${runtime}\n`;
      menuText += `*├✦ Pʀᴇꜰɪx:* ${config.prefix}\n`;
      menuText += `*├✦ ʟᴀᴜɴᴄʜᴇᴅ:* 2025\n`;
      menuText += `*├✦ Vᴇʀꜱɪᴏɴ:* ${config.version || '1.1.0 Bᴇᴛᴀ'}\n`;
      menuText += `*├✦ Tɪᴍᴇ:* ${time}\n`;
      menuText += `*├✦ Dᴀᴛᴇ:* ${date}\n`;
      menuText += `*╰───────────────────⊷*\n\n`;

      // Helper to add category
      const addCategory = (title, catName) => {
        if (categories[catName] && categories[catName].length > 0) {
          menuText += `\`『 ${title.toUpperCase()} 』\`\n`;
          menuText += `╭───────────────────⊷\n`;
          categories[catName].forEach(cmd => {
            menuText += `*┋ ⬡ ${cmd.name}*\n`;
          });
          menuText += `╰───────────────────⊷\n`;
        }
      };

      addCategory('OWNER MENU', 'owner');
      addCategory('ADMIN MENU', 'admin');
      addCategory('GROUP MENU', 'group');
      addCategory('AI MENU', 'ai');
      addCategory('MEDIA MENU', 'media');
      addCategory('FUN MENU', 'fun');
      addCategory('GENERAL MENU', 'general');
      addCategory('ANIME MENU', 'anime');
      addCategory('TEXTMAKER MENU', 'textmaker');

      menuText += `\n> *_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴏᴍ x♡ 💗 ʏᴇᴀɴ_*\n`;
      menuText += `_ʟᴜxᴜʀʏ ʀᴇᴅᴇғɪɴᴇᴅ • ᴅʜᴀᴋᴀ 2026_`;

      // Send menu with image
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');

      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: menuText,
          mentions: [extra.sender],
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.newsletterJid || '120363403719538106@newsletter',
              newsletterName: config.botName,
              serverMessageId: -1
            }
          }
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          text: menuText,
          mentions: [extra.sender]
        }, { quoted: msg });
      }

    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};