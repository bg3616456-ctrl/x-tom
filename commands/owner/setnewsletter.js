/**
 * SetNewsletter Command - Owner only
 * Set or change the newsletter JID for menu forwarding
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
  name: 'setnewsletter',
  aliases: ['setnl', 'setchannel', 'নিউজসেট'],
  category: 'owner',
  description: 'মেনু ফরওয়ার্ডিং এর জন্য নিউজলেটার JID সেট করুন',
  usage: '.setnewsletter <newsletter JID>',
  ownerOnly: true,
  adminOnly: false,
  groupOnly: false,
  botAdminOnly: false,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      let newsletterJid = '';

      // 1. Check if we're currently in a newsletter chat
      if (msg.key.remoteJid && msg.key.remoteJid.endsWith('@newsletter')) {
        newsletterJid = msg.key.remoteJid;
      }
      // 2. Check if replying to a newsletter message
      else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = msg.message.extendedTextMessage.contextInfo;

        const findNewsletterJid = (obj, depth = 0) => {
          if (depth > 5 ||!obj || typeof obj!== 'object') return null;

          for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'string' && value.endsWith('@newsletter')) {
              return value;
            }
            if (typeof value === 'object' && value!== null) {
              const found = findNewsletterJid(value, depth + 1);
              if (found) return found;
            }
          }
          return null;
        };

        newsletterJid = findNewsletterJid(contextInfo);

        if (!newsletterJid) {
          return extra.reply('❌ *রিপ্লাই করা মেসেজটি নিউজলেটার থেকে না!*\n\n*নিউজলেটার মেসেজে রিপ্লাই দিন অথবা JID সরাসরি দিন।*');
        }
      }
      // 3. Get JID from command arguments
      else if (args[0]) {
        newsletterJid = args[0].trim();
      }
      // 4. Show current status
      else {
        const currentJid = config.newsletterJid || '*সেট করা নেই*';
        return extra.reply(
          `📰 *নিউজলেটার কনফিগারেশন*\n\n` +
          `*বর্তমান JID:* *${currentJid}*\n` +
          `*বটের নাম:* *${config.botName}*\n\n` +
          `*ব্যবহার:*\n` +
          `*.setnewsletter <newsletter JID>*\n` +
          `*অথবা নিউজলেটার মেসেজে রিপ্লাই দিয়ে* *.setnewsletter*\n\n` +
          `*উদাহরণ:* *.setnewsletter 120363161513685998@newsletter*\n\n` +
          `*_নোট: এই JID থেকে মেনু ফরওয়ার্ড হবে_*`
        );
      }

      // Validate JID format
      if (!newsletterJid.endsWith('@newsletter')) {
        return extra.reply('❌ *ভুল JID ফরম্যাট!*\n\n*JID অবশ্যই* `@newsletter` *দিয়ে শেষ হতে হবে*\n*উদাহরণ:* *120363161513685998@newsletter*');
      }

      await extra.reply(`🔄 *নিউজলেটার JID আপডেট হচ্ছে...*\n*JID:* *${newsletterJid}*`);

      // Update config.js
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf8');

      if (configContent.includes('newsletterJid:')) {
        configContent = configContent.replace(
          /newsletterJid:\s*['"]([^'"]+)['"]/,
          `newsletterJid: '${newsletterJid}'`
        );
      } else {
        configContent = configContent.replace(
          /(sessionName:\s*['"][^'"]+['"],)/,
          `$1\n newsletterJid: '${newsletterJid}', // Newsletter JID for menu forwarding`
        );
      }

      fs.writeFileSync(configPath, configContent, 'utf8');

      // Update in-memory config
      config.newsletterJid = newsletterJid;

      await extra.reply(
        `✅ *নিউজলেটার JID সফলভাবে আপডেট হয়েছে!*\n\n` +
        `*📰 JID:* *${newsletterJid}*\n` +
        `*📛 নাম:* *${config.botName}*\n\n` +
        `*_এখন থেকে মেনু এই নিউজলেটার থেকে ফরওয়ার্ড হবে।_*`
      );

    } catch (error) {
      console.error('SetNewsletter command error:', error);
      await extra.reply(`❌ *নিউজলেটার JID সেট করতে সমস্যা:* ${error.message}`);
    }
  }
};