const axios = require('axios');

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic', 'প্রোফাইল'],
  category: 'general',
  description: 'কোনো ইউজারের প্রোফাইল পিকচার দেখুন',
  usage: '.getpp (মেসেজে রিপ্লাই দিন অথবা ট্যাগ করুন)',

  async execute(sock, msg, args, extra) {
    try {
      let targetUser = null;

      // Check if it's a reply
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        // Get the participant who sent the quoted message
        targetUser = msg.message.extendedTextMessage.contextInfo.participant;
      } else {
        // Check if user is tagged
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJid && mentionedJid.length > 0) {
          targetUser = mentionedJid[0];
        } else {
          // If no reply or tag, use the sender of current message
          targetUser = extra.sender;
        }
      }

      if (!targetUser) {
        return extra.reply('❌ *ইউজার খুঁজে পাওয়া যায়নি! মেসেজে রিপ্লাই দিন অথবা কাউকে ট্যাগ করুন।*');
      }

      try {
        // Try to get the profile picture
        const ppUrl = await sock.profilePictureUrl(targetUser, 'image');

        if (!ppUrl) {
          return extra.reply('❌ *এই ইউজারের প্রোফাইল পিকচার পাওয়া যায়নি।*');
        }

        // Download the profile picture
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        // Send the profile picture
        await sock.sendMessage(extra.from, {
          image: buffer,
          caption: `👤 *@${targetUser.split('@')[0]} এর প্রোফাইল পিকচার*`,
          mentions: [targetUser]
        }, { quoted: msg });

      } catch (profileError) {
        // Handle different types of errors
        if (profileError.message?.includes('item-not-found') ||
            profileError.output?.statusCode === 404 ||
            profileError.output?.statusCode === 500 ||
            profileError.message?.includes('not found')) {
          return extra.reply('❌ *এই ইউজারের প্রোফাইল পিকচার পাওয়া যায়নি।*');
        } else if (profileError.output?.statusCode === 401 ||
                   profileError.message?.includes('forbidden') ||
                   profileError.message?.includes('unauthorized')) {
          return extra.reply('❌ *প্রোফাইল পিকচার প্রাইভেট। দেখা যাচ্ছে না।*');
        } else {
          return extra.reply('❌ *এই ইউজারের প্রোফাইল পিকচার পাওয়া যায়নি।*');
        }
      }

    } catch (error) {
      extra.reply('❌ *প্রোফাইল পিকচার পাওয়া যায়নি।*');
    }
  }
};