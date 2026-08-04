const { getStats } = require('../../utils/groupstats');

module.exports = {
    name: 'myactivity',
    aliases: ['mystats', 'mymsgs', 'rank', 'আমারএক্টিভিটি'],
    category: 'general',
    description: 'আজকের আপনার চ্যাট এক্টিভিটি চেক করুন',
    usage: '.myactivity',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        try {
            const from = extra.from;
            const sender = extra.sender;
            const stats = getStats(from);

            if (!stats ||!stats.users ||!stats.users[sender]) {
                return extra.reply('📊 *আজ আপনি এখনো কোনো মেসেজ পাঠাননি!*');
            }

            const userCount = stats.users[sender];
            const totalMessages = stats.total;
            const percentage = ((userCount / totalMessages) * 100).toFixed(1);

            // Calculate rank
            const sortedUsers = Object.entries(stats.users)
              .sort((a, b) => b[1] - a[1]);

            const rank = sortedUsers.findIndex(([id]) => id === sender) + 1;

            const text = `
📊 *আজকের আপনার এক্টিভিটি*

👤 *ইউজার:* @${sender.split('@')[0]}
📝 *মেসেজ পাঠিয়েছেন:* ${userCount} টি
📈 *আপনার অংশ:* ${percentage}%
🏆 *র‍্যাংক:* #${rank} / ${sortedUsers.length}

*চ্যাট করতে থাকুন!* 💬

╰┈➤ *পাওয়ার্ড বাই বট*`;


            await sock.sendMessage(from, {
                text,
                mentions: [sender]
            }, { quoted: msg });

        } catch (err) {
            console.error('[myactivity cmd] error:', err);
            extra.reply('❌ *আপনার এক্টিভিটি স্ট্যাটস লোড করতে সমস্যা হয়েছে।*');
        }
    }
};