/**
 * Mode Command
 * Toggle bot between private and public mode
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'privatemode', 'publicmode', 'বটমোড'],
  description: 'বটকে প্রাইভেট অথবা পাবলিক মোডে সেট করা',
  usage: '.mode <private/public>',
  category: 'owner',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const currentMode = config.selfMode? 'private' : 'public';
        const modeText = config.selfMode? '🔒 *প্রাইভেট*' : '🌐 *পাবলিক*';
        const description = config.selfMode
         ? '*শুধু ওনার এবং sudo ইউজাররা কমান্ড ব্যবহার করতে পারবে*'
          : '*সবাই কমান্ড ব্যবহার করতে পারবে*';

        return extra.reply(
          `🤖 *বট মোড সিস্টেম*\n\n` +
          `*বর্তমান মোড:* ${modeText}\n` +
          `*স্ট্যাটাস:* ${description}\n\n` +
          `*ব্যবহার:*\n` +
          `.mode private - *শুধু ওনার ব্যবহার করতে পারবে*\n` +
          `.mode public - *সবাই ব্যবহার করতে পারবে*`
        );
      }

      const mode = args[0].toLowerCase();

      if (mode === 'private' || mode === 'priv') {
        if (config.selfMode) {
          return extra.reply('🔒 *বট আগে থেকেই প্রাইভেট মোডে আছে!*\n*শুধু ওনার কমান্ড ব্যবহার করতে পারবে।*');
        }

        // Update config
        updateConfig('selfMode', true);
        config.selfMode = true; // Update runtime config
        return extra.reply('🔒 *বট মোড পরিবর্তন করা হয়েছে: প্রাইভেট*\n\n*এখন থেকে শুধু ওনার কমান্ড ব্যবহার করতে পারবে।*');
      }

      if (mode === 'public' || mode === 'pub') {
        if (!config.selfMode) {
          return extra.reply('🌐 *বট আগে থেকেই পাবলিক মোডে আছে!*\n*সবাই কমান্ড ব্যবহার করতে পারবে।*');
        }

        // Update config
        updateConfig('selfMode', false);
        config.selfMode = false; // Update runtime config
        return extra.reply('🌐 *বট মোড পরিবর্তন করা হয়েছে: পাবলিক*\n\n*এখন থেকে সবাই কমান্ড ব্যবহার করতে পারবে।*');
      }

      return extra.reply('❌ *ভুল মোড!*\n*ব্যবহার:*.mode <private/public>');

    } catch (error) {
      console.error('Mode command error:', error);
      await extra.reply('❌ *বট মোড পরিবর্তন করতে সমস্যা হয়েছে।*');
    }
  }
};

function updateConfig(key, value) {
  try {
    const configPath = path.join(__dirname, '..', '..', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Update the value
    const regex = new RegExp(`(${key}:\\s*)(true|false)`, 'g');
    configContent = configContent.replace(regex, `$1${value}`);

    fs.writeFileSync(configPath, configContent, 'utf8');

    // Reload config
    delete require.cache[require.resolve('../../config')];
  } catch (error) {
    console.error('Error saving config:', error);
  }
}