const moment = require('moment-timezone');
const fetch = require('node-fetch');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/TOM-PRIME-X/TOM-PRIME-X-BOT');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*乂  TOM PRIME X BOT  乂*\n\n`;
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).tz('Asia/Dhaka').format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `📺 *YouTube:* https://youtube.com/@saycotom\n\n`;
    txt += `💥 *Powered by TOM PRIME X*`;

    const myNewPic = 'https://i.postimg.cc/KjB0QNtn/1000086494.png';

    await sock.sendMessage(chatId, { 
        image: { url: myNewPic }, 
        caption: txt
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
  }
}

module.exports = githubCommand;
