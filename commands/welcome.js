const { isWelcomeOn, addWelcome, delWelcome, getWelcome } = require('../lib/index');

async function welcomeCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = text.split(' ').slice(1).join(' ').toLowerCase();

    if(args === 'on') {
        await addWelcome(chatId, true);
        await sock.sendMessage(chatId, {text: '✅ Welcome ON kora hoise'});
    }
    else if(args === 'off') {
        await delWelcome(chatId);
        await sock.sendMessage(chatId, {text: '❌ Welcome OFF kora hoise'});
    }
    else {
        const status = await isWelcomeOn(chatId)? 'ON' : 'OFF';
        await sock.sendMessage(chatId, {text: `Welcome: *${status}*\n\nUse:.welcome on /.welcome off`});
    }
}

async function handleJoinEvent(sock, id, participants) {
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;

    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const customMsg = await getWelcome(id);

    for (const participant of participants) {
        try {
            const participantString = typeof participant === 'string'? participant : (participant.id || participant.toString());

            let displayName = participantString.split('@')[0];
            try {
                const userParticipant = groupMetadata.participants.find(p => p.id === participantString);
                if (userParticipant && userParticipant.name) {
                    displayName = userParticipant.name;
                }
            } catch {}

            let finalMessage = customMsg || `🎉✨ 𝐇𝐞𝐲 @${displayName}, \n\n` +
                               `𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ⚖️ ${groupName} \n` +
                               `⚡♘𓆗☠️! 🌟🎊\n\n` +
                               `🚀 𝐘𝐨𝐮 𝐣𝐮𝐬𝐭 𝐥𝐚𝐧𝐝𝐞𝐝 𝐢𝐧 𝐚𝐧 \n` +
                               `𝐚𝐰𝐞𝐬𝐨𝐦𝐞 𝐠𝐫𝐨𝐮𝐩!\n` +
                               `👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${groupMetadata.participants.length}\n` +
                               `📢 𝐑𝐮𝐥𝐞𝐬: 𝐁𝐞 𝐫𝐞𝐬𝐩𝐞𝐜𝐭𝐟𝐮𝐥, 𝐬𝐭𝐚𝐲 \n` +
                               `𝐚𝐜𝐭𝐢𝐯𝐞 & 𝐞𝐧𝐣𝐨𝐲\n` +
                               ` ╰┈➤ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 ʙʏ 𝐓𝐎𝐌\n` +
                               ` 𝐏𝐑𝐈𝐌𝐄 𝐗`;

            finalMessage = finalMessage.replace('{user}', `@${displayName}`).replace('{group}', groupName);

            let profilePicUrl = null;
            try {
                profilePicUrl = await sock.profilePictureUrl(participantString, 'image');
            } catch {}

            if (profilePicUrl) {
                await sock.sendMessage(id, {
                    image: { url: profilePicUrl },
                    caption: finalMessage,
                    mentions: [participantString]
                });
            } else {
                await sock.sendMessage(id, {
                    text: finalMessage,
                    mentions: [participantString]
                });
            }

        } catch (error) {
            console.error('Error in welcome system:', error);
        }
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
