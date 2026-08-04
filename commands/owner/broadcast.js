/**
 * Broadcast Command - Send message to all chats
 */

module.exports = {
    name: 'broadcast',
    aliases: ['bc', 'ব্রডকাস্ট'],
    category: 'owner',
    description: 'সব গ্রুপ এবং চ্যাটে মেসেজ পাঠান',
    usage: '.broadcast <message>',
    ownerOnly: true,

    async execute(sock, msg, args, extra) {
      try {
        if (args.length === 0) {
          return extra.reply(
            `📢 *ব্রডকাস্ট সিস্টেম*\n\n` +
            `*ব্যবহার:* *.broadcast <মেসেজ>*\n\n` +
            `*উদাহরণ:* *.broadcast হ্যালো সবাই!*\n\n` +
            `*নোট: এই কমান্ড সব গ্রুপ এবং পার্সোনাল চ্যাটে মেসেজ পাঠাবে।*`
          );
        }

        const message = args.join(' ');

        // Get all chats - groups + personal
        const chats = await sock.groupFetchAllParticipating();
        const groups = Object.values(chats);
        const allChats = await sock.store.chats.all();

        let success = 0;
        let failed = 0;
        let total = 0;

        await extra.reply(`📢 *ব্রডকাস্ট শুরু হচ্ছে...*\n*মোট চ্যাট খুঁজে পাওয়া গেছে:* ${groups.length + allChats.length}`);

        // Send to all groups
        for (const group of groups) {
          try {
            await sock.sendMessage(group.id, {
              text: `*╔══════════╗*
*║* *📢 ব্রডকাস্ট মেসেজ* *║*
*╠══════════╣*
*║*
*║* *${message}*
*║*
*╚══════════╝*

*_এটি বট ওনারের পক্ষ থেকে একটি ব্রডকাস্ট মেসেজ_*`
            });
            success++;
            total++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay to avoid ban
          } catch (e) {
            failed++;
            total++;
          }
        }

        // Send to all personal chats
        for (const chat of allChats) {
          if (!chat.id.endsWith('@g.us')) { // skip groups
            try {
              await sock.sendMessage(chat.id, {
                text: `*╔══════════╗*
*║* *📢 ব্রডকাস্ট মেসেজ* *║*
*╠══════════╣*
*║*
*║* *${message}*
*║*
*╚══════════╝*

*_এটি বট ওনারের পক্ষ থেকে একটি ব্রডকাস্ট মেসেজ_*`
              });
              success++;
              total++;
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
            } catch (e) {
              failed++;
              total++;
            }
          }
        }

        await extra.reply(
          `✅ *ব্রডকাস্ট সম্পন্ন!*\n\n` +
          `*📊 রিপোর্ট:*\n` +
          `*✅ সফল:* ${success}\n` +
          `*❌ ব্যর্থ:* ${failed}\n` +
          `*📨 মোট:* ${total}\n\n` +
          `*_নোট: বেশি দ্রুত পাঠালে ব্যান হতে পারে, তাই 1s গ্যাপ দেওয়া হয়েছে।_*`
        );

      } catch (error) {
        console.error('[broadcast cmd] error:', error);
        await extra.reply(`❌ *এরর:* ${error.message}`);
      }
    }
  };