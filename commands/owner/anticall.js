/**
 * Anti-Call Command - Enable or disable anti-call system
 */

module.exports = {
  name: 'anticall',
  aliases: ['callblock', 'callguard'],
  category: 'owner',
  ownerOnly: true,
  description: 'কল এলে অটো ব্লক/রিজেক্ট অন অফ করা',
  usage: '.anticall on/off',

  async execute(sock, msg, args, extra) {
    if (!args[0]) {
      return extra.reply(
        `📞 *এন্টি-কল সিস্টেম*\n\n` +
        `*ব্যবহার:* *.anticall on/off*\n` +
        `*.anticall on* - *কল আসলে অটো ব্লক হবে*\n` +
        `*.anticall off* - *কল ব্লক বন্ধ হবে*`
      );
    }

    const option = args[0].toLowerCase();

    if (!['on', 'off'].includes(option)) {
      return extra.reply('❌ *ভুল কমান্ড!*\n*ব্যবহার:* *.anticall on/off*');
    }

    const enabled = option === 'on';

    // Update the default setting in config
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../../config.js');

    try {
      // Read the current config file
      let configFile = fs.readFileSync(configPath, 'utf8');

      // Update the anticall setting
      if (configFile.includes('anticall:')) {
        configFile = configFile.replace(/anticall:\s*(true|false)/g, `anticall: ${enabled}`);
      } else {
        // if anticall key not found, add it
        configFile = configFile.replace(/module\.exports\s*=\s*{/, `module.exports = {\n anticall: ${enabled},`);
      }

      // Write the updated config file
      fs.writeFileSync(configPath, configFile);

      // Clear the config cache so the next require gets the updated version
      delete require.cache[require.resolve('../../config')];

      await extra.reply(
        enabled
         ? `📞 *এন্টি-কল চালু করা হয়েছে!*\n\n*✅ এখন থেকে কেউ কল দিলে অটো রিজেক্ট + ব্লক হয়ে যাবে।*`
          : `📞 *এন্টি-কল বন্ধ করা হয়েছে!*\n\n*❌ এখন থেকে কল ব্লক হবে না।*`
      );
    } catch (err) {
      console.error('[anticall cmd] error:', err);
      extra.reply('❌ *এন্টি-কল সেটিং আপডেট করতে সমস্যা হয়েছে।*');
    }
  }
};