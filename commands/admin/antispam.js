/**
 * Antispam Command - Kick users who spam messages
 */

const database = require('../../database');

// Memory tracker for message spam
const messageTracker = new Map();

const TIME_WINDOW = 10; // seconds
const MESSAGE_LIMIT = 6; // kick if more than 6 messages in 10s

module.exports = {
  name: 'antispam',
  aliases: ['antisp', 'aspam'],
  category: 'admin',
  description: 'স্প্যাম করা ইউজারদের ডিলিট/কিক করা',
  usage: '.antispam <on/off/set/get>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antispam? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antispamAction || 'kick';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(
          `🛡️ *অ্যান্টি-স্প্যাম সিস্টেম*\n\n` +
          `*স্ট্যাটাস:* ${status}\n` +
          `*একশন:* *${actionText}*\n` +
          `*লিমিট:* *${MESSAGE_LIMIT} টি মেসেজ ${TIME_WINDOW} সেকেন্ডে*\n\n` +
          `*ব্যবহার:*\n` +
          `.antispam on\n` +
          `.antispam off\n` +
          `.antispam set delete | kick\n` +
          `.antispam get`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antispam) {
          return extra.reply('*অ্যান্টি-স্প্যাম আগে থেকেই চালু আছে!*');
        }
        database.updateGroupSettings(extra.from, { antispam: true });
        return extra.reply(`✅ *অ্যান্টি-স্প্যাম চালু করা হয়েছে!*\n\n*${TIME_WINDOW} সেকেন্ডে ${MESSAGE_LIMIT} টির বেশি মেসেজ পাঠালে অ্যাকশন নেওয়া হবে।*`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antispam: false });
        return extra.reply('❌ *অ্যান্টি-স্প্যাম বন্ধ করা হয়েছে!*');
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply('*একশন সিলেক্ট করুন:*.antispam set delete | kick');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('*ভুল একশন! শুধু delete অথবা kick সিলেক্ট করুন।*');
        }

        database.updateGroupSettings(extra.from, {
          antispamAction: setAction,
          antispam: true
        });

        const actionText = setAction === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`✅ *অ্যান্টি-স্প্যাম একশন সেট করা হয়েছে:* *${actionText}*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antispam? '✅ *চালু*' : '❌ *বন্ধ*';
        const action = settings.antispamAction || 'kick';
        const actionText = action === 'kick'? 'কিক' : 'ডিলিট';
        return extra.reply(`🛡️ *অ্যান্টি-স্প্যাম কনফিগারেশন:*\n*স্ট্যাটাস:* ${status}\n*একশন:* *${actionText}*\n*লিমিট:* *${MESSAGE_LIMIT}/${TIME_WINDOW}s*`);
      }

      return extra.reply('*বিস্তারিত জানতে ব্যবহার করুন:*.antispam');

    } catch (error) {
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  },

  async checkSpam(sock, msg, extra) {
    if (msg.key.fromMe) return;

    // 1. Do not process if the message is a deleted notification (protocolMessage)
    if (msg.message?.protocolMessage) return;

    const chatId = extra.from;
    const sender = msg.key.participant || msg.key.remoteJid;

    const settings = database.getGroupSettings(chatId);
    if (!settings.antispam) return;

    // Skip admins
    const groupMetadata = await sock.groupMetadata(chatId);
    const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
    if (isAdmin) return;

    const now = Date.now() / 1000;

    if (!messageTracker.has(sender)) {
      messageTracker.set(sender, []);
    }

    let times = messageTracker.get(sender);
    times = times.filter(t => now - t < TIME_WINDOW);
    times.push(now);
    messageTracker.set(sender, times);

    // 2. Trigger only once when the limit is reached exactly
    if (times.length === MESSAGE_LIMIT) {
      try {
        const action = settings.antispamAction || 'kick';

        // Delete the spam message
        await sock.sendMessage(chatId, { delete: msg.key }).catch(() => {});

        if (action === 'kick') {
          await sock.groupParticipantsUpdate(chatId, [sender], 'remove');

          // 3. Send goodbye message without quoting to keep it clean
          await sock.sendMessage(chatId, {
            text: `🚫 *@${sender.split('@')[0]}* কে গ্রুপ থেকে *কিক* করা হয়েছে!\n*কারণ:* মেসেজ স্প্যাম`,
            mentions: [sender]
          });
        } else {
          await sock.sendMessage(chatId, {
            text: `⚠️ *@${sender.split('@')[0]}* স্প্যাম করার কারণে মেসেজ *ডিলিট* করা হয়েছে!`,
            mentions: [sender]
          });
        }

        // Clear tracker to prevent duplicate actions
        messageTracker.set(sender, []);

      } catch (err) {
        console.log('Antispam error:', err);
      }
    }
  }
};