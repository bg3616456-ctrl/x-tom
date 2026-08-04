/**
 * Set Bot Name Command - Change bot name in config
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setbotname',
  aliases: ['setname', 'botname', 'নামসেট'],
  category: 'owner',
  description: 'বটের নাম পরিবর্তন করুন',
  usage: '.setbotname <নতুন নাম> অথবা রিপ্লাই দিয়ে .setbotname',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      let newBotName = '';

      // Check if message is a reply
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMsg) {
        const quotedText = quotedMsg.conversation ||
                          quotedMsg.extendedTextMessage?.text ||
                          quotedMsg.imageMessage?.caption ||
                          quotedMsg.videoMessage?.caption ||
                          '';
        newBotName = quotedText.trim();
      } else {
        newBotName = args.join(' ').trim();
      }

      // Validate
      if (!newBotName) {
        return extra.reply(
          `📝 *বটের নাম পরিবর্তন*\n\n` +
          `*বর্তমান নাম:* *${config.botName}*\n\n` +
          `*ব্যবহার:*\n` +
          `*.setbotname <নতুন নাম>*\n` +
          `*অথবা কোনো মেসেজে রিপ্লাই দিয়ে* *.setbotname*\n\n` +
          `*_নোট: নাম 50 অক্ষরের বেশি হবে না_*`
        );
      }

      if (newBotName.length > 50) {
        return extra.reply('❌ *বটের নাম 50 অক্ষরের বেশি হতে পারবে না!*');
      }

      await extra.reply(`🔄 *নাম পরিবর্তন হচ্ছে...*\n*নতুন নাম:* *${newBotName}*`);

      // Update runtime config
      config.botName = newBotName;

      // Update config file
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf-8');

      // Replace botName value
      if (configContent.includes('botName:')) {
        configContent = configContent.replace(
          /botName:\s*['"`]([^'"`]*)['"`]/,
          `botName: '${newBotName.replace(/'/g, "\\'")}'`
        );
      } else {
        // if botName not found, add it
        configContent = configContent.replace(/module\.exports\s*=\s*{/, `module.exports = {\n  botName: '${newBotName.replace(/'/g, "\\'")}',`);
      }

      fs.writeFileSync(configPath, configContent, 'utf-8');

      // Reload config module cache
      delete require.cache[require.resolve('../../config')];

      await extra.reply(
        `✅ *বটের নাম পরিবর্তন করা হয়েছে!*\n\n` +
        `*পুরাতন নাম:* *${config.botName}*\n` +
        `*নতুন নাম:* *${newBotName}*\n\n` +
        `*_নতুন নাম এখন মেনু এবং অন্যান্য জায়গায় ব্যবহার হবে। বট রিস্টার্ট দিলে ভালো হয়।_*`
      );

    } catch (error) {
      console.error('Setbotname command error:', error);
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};