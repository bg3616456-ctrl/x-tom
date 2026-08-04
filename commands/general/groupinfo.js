/**
 * Group Info Command - Display group information
 */

module.exports = {
    name: 'groupinfo',
    aliases: ['info', 'ginfo', 'গ্রুপইনফো'],
    category: 'general',
    description: 'গ্রুপের সম্পূর্ণ তথ্য দেখুন',
    usage: '.groupinfo',
    groupOnly: true,
    
    async execute(sock, msg, args, extra) {
      try {
        const metadata = extra.groupMetadata;
        
        const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const members = metadata.participants.filter(p => !p.admin);
        
        let text = `╭───[ *গ্রুপ ইনফো* ]───╮
│
│ 📋 *গ্রুপের তথ্য*
│
│ 🏷️ *নাম:* ${metadata.subject}
│ 🆔 *আইডি:* ${metadata.id}
│ 👥 *সদস্য:* ${metadata.participants.length} জন
│ 👑 *এডমিন:* ${admins.length} জন
│ 👤 *সাধারণ মেম্বার:* ${members.length} জন
│ 📝 *বিবরণ:* ${metadata.desc || 'কোন বিবরণ নেই'}
│ 🔒 *শুধু এডমিন মেসেজ:* ${metadata.restrict ? 'হ্যাঁ' : 'না'}
│ 📢 *শুধু এডমিন এডিট:* ${metadata.announce ? 'হ্যাঁ' : 'না'}
│ 📅 *তৈরির তারিখ:* ${new Date(metadata.creation * 1000).toLocaleDateString('bn-BD')}
│
│ 👑 *এডমিন লিস্ট:*
`;
        
        admins.forEach((admin, index) => {
          text += `│ ${index + 1}) @${admin.id.split('@')[0]}\n`;
        });
        
        text += `│
╰─────────────╯

 ╰┈➤ *পাওয়ার্ড বাই বট*`;


        await sock.sendMessage(extra.from, {
          text,
          mentions: admins.map(a => a.id)
        }, { quoted: msg });
        
      } catch (error) {
        await extra.reply(`❌ *এরর:* ${error.message}`);
      }
    }
};