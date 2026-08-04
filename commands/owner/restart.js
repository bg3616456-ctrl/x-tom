/**
 * Restart Command - Restart bot (Owner Only)
 */

const { exec } = require('child_process');

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'reload', 'রিস্টার্ট'],
  category: 'owner',
  description: 'বট রিস্টার্ট করুন (ওনার অনলি)',
  usage: '.restart',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const loadingMsg = await extra.reply('🔁 *বট রিস্টার্ট হচ্ছে...*');

      const loadingFrames = [
        '🔁 *রিস্টার্ট হচ্ছে.*',
        '🔁 *রিস্টার্ট হচ্ছে..*',
        '🔁 *রিস্টার্ট হচ্ছে...*'
      ];

      for(let i = 0; i < loadingFrames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await sock.sendMessage(extra.from, {
          text: loadingFrames[i],
          edit: loadingMsg.key
        });
      }

      const run = (cmd) =>
        new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout || stderr);
          });
        });

      try {
        // PM2 থাকলে PM2 দিয়ে রিস্টার্ট
        await run('pm2 restart all');
        await sock.sendMessage(extra.from, {
          text: '✅ *PM2 দিয়ে বট রিস্টার্ট করা হয়েছে!*\n*_১০ সেকেন্ডের মধ্যে অনলাইন হবে_*',
          edit: loadingMsg.key
        });
        return;
      } catch (e) {
        console.log('PM2 not available, falling back to process.exit');
      }

      // PM2 না থাকলে process.exit
      await sock.sendMessage(extra.from, {
        text: '✅ *বট রিস্টার্ট হচ্ছে...*\n*_৫ সেকেন্ডের মধ্যে অনলাইন হবে_*',
        edit: loadingMsg.key
      });

      setTimeout(() => {
        process.exit(0);
      }, 1000);

    } catch (error) {
      console.error('Restart error:', error);
      await extra.reply(`❌ *বট রিস্টার্ট করতে সমস্যা:* ${error.message}`);
    }
  },
};