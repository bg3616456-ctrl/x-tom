const os = require('os');
const config = require('../../config');

module.exports = {
  name: 'info',
  aliases: ['about', 'admininfo', 'serverinfo', 'আমারসম্পর্কে'],
  category: 'utility',
  description: 'এডমিন এবং সার্ভারের তথ্য দেখুন',
  usage: '.info',

  async execute(sock, msg, args, extra) {
    try {
      const uptimeSeconds = process.uptime();
      const uptime = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);

      const infoMessage = `--------------------------------------------
➥ *আসসালামু আলাইকুম*
╭────《 🌸 *আমার সম্পর্কে* 🌸 》────⊷
│ ╭────────✧❁✧────────◆
│ │ 👤 *নাম*     : ইয়ান
│ │ 🎂 *বয়স*      : ১৮ বছর
│ │ 🩸 *রক্তের গ্রুপ* : O Negative (O-)
│ │ 🏠 *ঠিকানা*  : বালাপুর, মাধবদী, নরসিংদী
│ │ 🏡 *বাড়ি*     : ছোট ও সুন্দর
│ │ 📚 *শিক্ষা*      : গোপনীয়
│ ╰────────✧❁✧────────◆
╰══════════════════⊷

══════════⊷


🖥️ *সার্ভার তথ্য:*
• *প্ল্যাটফর্ম*       : ${os.platform()}
• *CPU*            : ${os.cpus()[0].model}
• *Node.js ভার্সন* : ${process.version}
• *আপটাইম*         : ${uptime}
• *মোট RAM*       : ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB
• *ফ্রি RAM*       : ${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`;

      await sock.sendMessage(extra.from, {
        image: { url: "https://i.postimg.cc/3RTZ99NN/1784046009530.png" }, 
        caption: infoMessage,
        mentions: [extra.sender]
      }, { quoted: msg });

    } catch (error) {
      console.error(error);
      await extra.reply('❌ *তথ্য আনতে সমস্যা হয়েছে।*');
    }
  },
};