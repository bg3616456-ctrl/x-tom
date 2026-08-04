/**
 * Unmute Command - Open group (all members can send)
 */

module.exports = {
    name: 'unmute',
    aliases: ['open', 'opengroup', 'khule_dao'],
    category: 'admin',
    description: 'গ্রুপ ওপেন করে দেয় - সবাই মেসেজ পাঠাতে পারবে',
    usage: '.unmute',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      try {
        await sock.groupSettingUpdate(extra.from, 'not_announcement');
        await extra.reply('🔓 *এখন সবাই আগের মতন আড্ডা দেও*\n\n*গ্রুপ খুলে দিলাম*....!!🫠🌷🌸');
        
      } catch (error) {
        await extra.reply(`❌ এরর: ${error.message}`);
      }
    }
  };