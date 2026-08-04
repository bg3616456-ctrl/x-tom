/**
 * Newsletter Command - Get newsletter information from WhatsApp channel link
 */

/**
 * Extract invite code from WhatsApp channel link
 * @param {string} link - Channel link (e.g., https://whatsapp.com/channel/0029Vb7clzdJENxtbn1shb0I)
 * @returns {string|null} - Invite code or null if invalid
 */
function getChannelInviteCode(link) {
  try {
    let cleanLink = link.trim();
    cleanLink = cleanLink.split('?')[0].split('#')[0];

    try {
      const url = new URL(cleanLink);
      const parts = url.pathname.split('/').filter(Boolean);
      const code = parts[parts.length - 1];
      if (code && code.length > 0) {
        return code;
      }
    } catch (urlError) {}

    const patterns = [
      /(?:whatsapp\.com|wa\.me)\/channel\/([A-Za-z0-9]+)/i,
      /\/channel\/([A-Za-z0-9]+)/i,
      /channel\/([A-Za-z0-9]+)/i
    ];

    for (const pattern of patterns) {
      const match = cleanLink.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    if (/^[A-Za-z0-9]+$/.test(cleanLink)) {
      return cleanLink;
    }

    return null;
  } catch (error) {
    console.error('Error extracting invite code:', error);
    return null;
  }
}

module.exports = {
  name: 'newsletter',
  aliases: ['channel', 'channelinfo', 'nl', 'চ্যানেল'],
  category: 'owner',
  description: 'হোয়াটসঅ্যাপ চ্যানেলের তথ্য বের করুন',
  usage: '.newsletter <channel link>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      const text = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   args.join(' ');

      if (!text || text.trim().length === 0) {
        return extra.reply(
          `📢 *নিউজলেটার ইনফো*\n\n` +
          `*ব্যবহার:* *.newsletter <চ্যানেল লিংক>*\n\n` +
          `*উদাহরণ:* *.newsletter https://whatsapp.com/channel/0029Vb7clzdJENxtbn1shb0I*\n` +
          `*অথবা শুধু কোড:* *.newsletter 0029VaAbCdEfGhIJkL*`
        );
      }

      let link = text.replace(/^\.(newsletter|nl|channel|channelinfo|চ্যানেল)\s+/i, '').trim() || args.join(' ').trim();

      if (!link || link.length === 0) {
        return extra.reply('❌ *চ্যানেল লিংক দিন!*\n*উদাহরণ:* *.newsletter https://whatsapp.com/channel/xxxx*');
      }

      const loadingMsg = await extra.reply('🔍 *চ্যানেলের তথ্য খুঁজছি...*');

      const inviteCode = getChannelInviteCode(link);

      if (!inviteCode) {
        return sock.sendMessage(chatId, {
          text: '❌ *ভুল লিংক!*\n\n*সঠিক লিংক দিন:*\n*https://whatsapp.com/channel/0029Vb7clzdJENxtbn1shb0I*\n\n*অথবা শুধু কোড দিন:* *.newsletter 0029VaAbCdEfGhIJkL*',
          edit: loadingMsg.key
        });
      }

      try {
        const meta = await sock.newsletterMetadata('invite', inviteCode);

        if (!meta) {
          throw new Error('Newsletter not found');
        }

        let infoText = `*______________________*
*|* *📢 চ্যানেল ইনফরমেশন* *|*
*╠══════════════╣*
*|* *👑 নাম:* *${meta.name || 'N/A'}* *|*
*|* *🆔 আইডি:* *${meta.id || 'N/A'}* *|*`;

        if (meta.description) {
          infoText += `\n*|* *📝 বিবরণ:* *${meta.description}* *|*`;
        }

        if (meta.invite) {
          infoText += `\n*|* *🔗 ইনভাইট কোড:* *${meta.invite}* *|*`;
        }

        if (meta.subscriberCount!== undefined) {
          infoText += `\n*|* *👥 সাবস্ক্রাইবার:* *${meta.subscriberCount.toLocaleString()}* *|*`;
        }

        if (meta.creationTime) {
          const date = new Date(meta.creationTime * 1000);
          infoText += `\n*|* *📅 তৈরি:* *${date.toLocaleDateString('bn-BD')}* *|*`;
        }

        infoText += `\n*|* *🔗 লিংক:* *https://whatsapp.com/channel/${meta.invite}* *|*
*|______________________|*`;

        if (meta.image) {
          await sock.sendMessage(chatId, {
            image: { url: meta.image },
            caption: infoText
          }, { quoted: msg });
          await sock.sendMessage(chatId, { delete: loadingMsg.key });
        } else {
          await sock.sendMessage(chatId, {
            text: infoText,
            edit: loadingMsg.key
          }, { quoted: msg });
        }

      } catch (error) {
        console.error('Newsletter command error:', error);

        let errorMsg = '❌ *চ্যানেলের তথ্য পাওয়া যায়নি!*';
        if (error.message.includes('Invalid channel link')) {
          errorMsg = '❌ *ভুল চ্যানেল লিংক!*\n*সঠিক লিংক দিন।*';
        } else if (error.message.includes('Newsletter not found')) {
          errorMsg = '❌ *চ্যানেল পাওয়া যায়নি!*\n*লিংকটি ভুল অথবা চ্যানেলটি নেই।*';
        } else if (error.message.includes('newsletterMetadata')) {
          errorMsg = '❌ *নিউজলেটার ফিচার পাওয়া যায়নি!*\n*Baileys v7.0.0-rc বা তার উপরের ভার্সন লাগবে।*';
        } else {
          errorMsg = `❌ *এরর:* ${error.message}`;
        }

        await sock.sendMessage(chatId, {
          text: errorMsg,
          edit: loadingMsg.key
        });
      }

    } catch (error) {
      console.error('Newsletter command error:', error);
      await extra.reply(`❌ *এরর:* ${error.message}`);
    }
  }
};