const { getStats } = require('../../utils/groupstats');

module.exports = {
    name: 'groupstats',
    aliases: ['stats', 'leaderboard', 'gstats', 'topmembers', 'msgs', 'messagestats', 'গ্রুপস্ট্যাটস'],
    category: 'general',
    description: 'আজকের গ্রুপের চ্যাট স্ট্যাটস + গ্রুপ ইনফো দেখুন',
    usage: '.groupstats',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        try {
            const from = extra.from;
            const groupMetadata = await sock.groupMetadata(from);
            const stats = getStats(from);

            // 1. MEMBER DISTRIBUTION
            const totalMembers = groupMetadata.participants.length;
            const admins = groupMetadata.participants.filter(p => p.admin).length;
            const regular = totalMembers - admins;
            const adminPercent = ((admins / totalMembers) * 100).toFixed(1);
            const regularPercent = ((regular / totalMembers) * 100).toFixed(1);

            // 2. TIMELINE - AGE fix
            let createdDate = 'অজানা';
            let ageDays = 'অজানা';
            if (groupMetadata.creation && groupMetadata.creation > 0) {
                const created = new Date(groupMetadata.creation * 1000);
                createdDate = `${created.getDate()}/${created.getMonth() + 1}/${created.getFullYear()}`;
                ageDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
                if(ageDays < 0) ageDays = 0;
            }

            // 3. SETTINGS STATUS
            const isAnnounce = groupMetadata.announce; 
            const isLocked = groupMetadata.restrict;   
            const joinApproval = groupMetadata.joinApprovalMode || false;

            const messagingStatus = isAnnounce ? '🔒 *শুধু এডমিন*' : '🔓 *সবার জন্য খোলা*';
            const infoEditStatus = isLocked ? '🔒 *লক করা*' : '🔓 *সবার জন্য খোলা*';
            const joinStatus = joinApproval ? '✅ *অনুমতি লাগবে*' : '❌ *সরাসরি জয়েন*';

            // 4. TODAY'S ACTIVITY STATS
            let totalMsgs = 0;
            let topText = '*আজ কোনো এক্টিভিটি নেই।*';
            let mentions = [];

            if (stats && stats.users) {
                totalMsgs = stats.total;
                const sortedUsers = Object.entries(stats.users)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                mentions = sortedUsers.map(u => u[0]);

                topText = sortedUsers.length
                    ? sortedUsers.map(([id, count], i) => `${i + 1}) @${id.split('@')[0]} — ${count} টি মেসেজ`).join('\n')
                    : '*এখনো কেউ এক্টিভ না।*';
            }

            const text = `
╭──[ *গ্রুপ স্ট্যাটস* ]──╮
│
│ 📊 *সদস্য বণ্টন*
│ • *মোট সদস্য:* ${totalMembers} জন
│ • *এডমিন:* ${admins} জন (${adminPercent}%)
│ • *সাধারণ:* ${regular} জন (${regularPercent}%)
│
│ 📅 *টাইমলাইন*
│ • *তৈরির তারিখ:* ${createdDate}
│ • *গ্রুপের বয়স:* ${ageDays} দিন
│
│ ⚙️ *সেটিংস*
│ • *মেসেজ:* ${messagingStatus}
│ • *তথ্য এডিট:* ${infoEditStatus}
│ • *জয়েন মোড:* ${joinStatus}
│
├──[ *আজকের এক্টিভিটি* ]──┤
│
│ 📌 *মোট মেসেজ:* ${totalMsgs} টি
│
│ 👥 *টপ এক্টিভ মেম্বার:*
${topText}
│
╰─────────────╯

*নিজের স্ট্যাটস দেখতে:* *.myactivity*

╰┈➤ *পাওয়ার্ড বাই বট*`;


            await sock.sendMessage(from, {
                text,
                mentions: mentions
            }, { quoted: msg });

        } catch (err) {
            console.error('[groupstats cmd] error:', err);
            extra.reply('❌ *গ্রুপ স্ট্যাটস লোড করতে সমস্যা হয়েছে।*');
        }
    }
};