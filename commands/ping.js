const os = require('os');
const settings = require('../settings.js');

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h${minutes}m${secs}s`;
    if (minutes > 0) return `${minutes}m${secs}s`;
    return `${secs}s`;
}

async function pingCommand(sock, chatId, message) {
    try {
        const startTime = message.messageTimestamp * 1000;
        
        const { key } = await sock.sendMessage(chatId, { text: '*˹♡💓 𝐋ᴏᴀᴅɪɴɢ.....*' }, { quoted: message });
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const ping = Date.now() - startTime;
        const uptime = formatUptime(process.uptime());
        
        const result = `*—͞𝚸ɢ:${ping}ᴍꜱ|𝐔ᴛ:${uptime}👾*`;
        
        await sock.sendMessage(chatId, { text: result, edit: key });
        
    } catch (error) {
        console.error('Ping command error:', error);
        await sock.sendMessage(chatId, { text: 'Error: Failed to get status' }, { quoted: message });
    }
}

module.exports = pingCommand;