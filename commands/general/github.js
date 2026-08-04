/**
 * GitHub Command - Show bot Premium Info Box
 */

const config = require('../../config');

module.exports = {
    name: 'github',
    aliases: ['repo', 'git', 'source', 'sc', 'script'],
    category: 'general',
    description: 'বটের প্রিমিয়াম তথ্য দেখুন',
    usage: '.github',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;

            // Step 1: Loading animation
            const loadingFrames = [
                '🔍 *লোডিং.*',
                '🔍 *লোডিং..*',
                '🔍 *লোডিং...*'
            ];

            let loadingMsg = await extra.reply(loadingFrames[0]);

            for(let i = 1; i < loadingFrames.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await sock.sendMessage(chatId, {
                    text: loadingFrames[i],
                    edit: loadingMsg.key
                });
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            // Step 2: Your Exact Box
            const premiumText = `*______________________*
*|* *👑 TOM_X_YEAN – প্রিমিয়াম প্রাইভেট বট 👑*
*_______________________*
*|*
*|* *TOM_X_YEAN কোনো সাধারণ বট নয়; এটি একটি প্রিমিয়াম*
*|* *প্রাইভেট বট, যা শুধুমাত্র আমাদের সম্মানিত VIP*
*|* *মেম্বারদের জন্য সংরক্ষিত।*
*|*
*|* *✨ বটের বিশেষত্ব:*
*|* *✅ প্রিমিয়াম ফিচারস ও স্মুথ পারফরম্যান্স।*
*|* *✅ শুধুমাত্র ভিআইপিদের জন্য বিশেষ সুবিধা।*
*|* *✅ আমাদের দক্ষ ডেভেলপার দ্বারা নিয়মিত আপডেট।*
*|*
*|* *💰 বট মূল্য: ওনারের সাথে যোগাযোগ করুন।*
*|*
*|* *📞 সাপোর্ট (২৪/৭ অনলাইন):*
*|* *📱 +88 01606-169773*
*|* *📱 +88 01323-266193*
*|* *🌐 আমাদের সাথে যুক্ত থাকুন:*
*|* *📢 হোয়াটসঅ্যাপ চ্যানেল:*
*|* *https://whatsapp.com/channel/0029VbBItW060eBXTB93HT1Q*
*|* *👤 বট ডেভেলপার (ফেসবুক):*
*|*
*https://www.facebook.com/majidul.islam.zihad*
*|*
*|* *নির্দ্বিধায় যোগাযোগ করুন, ইনশাআল্লাহ দ্রুত সার্ভিস*
*|* *নিশ্চিত করা হবে* ☺️🌷❤️‍🩹
*|*
*|__________________________|*`;

            await sock.sendMessage(chatId, {
                text: premiumText,
                edit: loadingMsg.key
            });

        } catch (error) {
            console.error('GitHub command error:', error);
            await extra.reply(`❌ *এরর:* ${error.message}`);
        }
    }
};