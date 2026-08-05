const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn, getWelcome } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');

// GLOBAL SOCK RAKHAR JONNO
let globalSock = null;

// Event listener ekhanei lagano
function initWelcome(sock) {
    globalSock = sock;
    sock.ev.on('group-participants.update', async (update) => {
        if (update.action === 'add') {
            await handleJoinEvent(sock, update.id, update.participants);
        }
    });
}

async function welcomeCommand(sock, chatId, message, match) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: '⚠️ This command can only be used in groups.' });
        return;
    }
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');
    await handleWelcome(sock, chatId, message, matchText);
}

async function handleJoinEvent(sock, id, participants) {
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;

    let groupMetadata;
    try {
        groupMetadata = await sock.groupMetadata(id);
    } catch (e) {
        console.error('Group metadata error:', e);
        return;
    }

    const groupName = groupMetadata.subject;

    for (const participant of participants) {
        try {
            const participantString = typeof participant === 'string'? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];

            let customMsg = await getWelcome(id);
            let finalMessage;

            if (customMsg) {
                finalMessage = customMsg.replace('@user', `@${user}`).replace('@gname', groupName);
            } else {
                // DEFAULT ANIMATION WELCOME
                finalMessage = `╭━━━━━━━━━━━━━━━╮
┃ 🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🎉 ┃
╰━━━━━━━━━━━━━━━╯

𝐇𝐞𝐲 @${user} 👋

⚡ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨: ${groupName}
👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${groupMetadata.participants.length}

📢 𝐑𝐮𝐥𝐞𝐬:
➤ 𝐁𝐞 𝐫𝐞𝐬𝐩𝐞𝐜𝐭𝐟𝐮𝐥
➤ 𝐒𝐭𝐚𝐲 𝐚𝐜𝐭𝐢𝐯𝐞
➤ 𝐄𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩

╭━━━━━━━━━━━━━╮
┃ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 ʙʏ 𝐓𝐎𝐌 𝐏𝐑𝐈𝐌𝐄 𝐗 ┃
╰━━━━━━━━━━━━━╯`;
            }

            let profilePicUrl = null;
            try {
                profilePicUrl = await sock.profilePictureUrl(participantString, 'image');
            } catch {}

            if (profilePicUrl) {
                await sock.sendMessage(id, {
                    image: { url: profilePicUrl },
                    caption: finalMessage,
                    mentions: [participantString],
                   ...channelInfo // tomar channel context
                });
            } else {
                await sock.sendMessage(id, {
                    text: finalMessage,
                    mentions: [participantString],
                   ...channelInfo
                });
            }

        } catch (error) {
            console.error('Error in welcome system:', error);
        }
    }
}

// index.js e ei 1 line boshailei hobe
// require('./commands/welcome').initWelcome(sock)

module.exports = { welcomeCommand, handleJoinEvent, initWelcome };
