/**
 * Mute Command - Close group (only admins can send)
 */

module.exports = {
    name: 'mute',
    aliases: ['close', 'closegroup', 'bondho_koro'],
    category: 'admin',
    description: 'গ্রুপ লক করে দেয় - শুধু অ্যাডমিনরা মেসেজ পাঠাতে পারবে',
    usage: '.mute',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      try {
        await sock.groupSettingUpdate(extra.from, 'announcement');
        await extra.reply('🔒 *যাহ গ্রুপ বন্ধ করে দিলাম*!\n\n*গ্রুপে সুন্দরী মেয়েরা নাই😫🌸🌷*');
        
      } catch (error) {
        console.error('Mute command error:', error);
        await extra.reply(`❌ এরর হয়েছে: ${error.message}`);
      }
    }
  };