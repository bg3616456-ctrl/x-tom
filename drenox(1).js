const baileys = require("@whiskeysockets/baileys")
const { 
  default: makeWASocket,
  proto, 
  jidNormalizedUser, 
  generateWAMessage, 
  generateWAMessageFromContent,
  generateWAMessageContent,  
  getContentType, 
  prepareWAMessageMedia,
  downloadContentFromMessage
} = baileys

// ═══════════════════════════════════════════════════════════
// REQUIRE STORAGE & UTILITIES
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

// Keep generated media files inside the project and clean old files regularly.
// This is part of the main.js runtime behavior and does not change the bot API.
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (statError, stats) => {
                if (!statError && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => {});
                }
            });
        }
    });
}, 3 * 60 * 60 * 1000);
const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');
const infoCommand = require('./commands/info');
const { simCommand, botChat } = require('./commands/sim');

// ═══════════════════════════════════════════════════════════
// GLOBAL VARIABLES INITIALIZATION
// ═══════════════════════════════════════════════════════════
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029Vb7clzdJENxtbn1shb0I";
global.ytch = "Tom Prime X";

const tomSpamTracker = {}; 
const adultStickerTracker = {}; 
let antiSpamActive = false; 
let antiStickerActive = false; 

const channelInfo = {
    contextInfo: {
        forwardingScore: 0,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '',
            newsletterName: '𝐓𝐎𝐌 𝐏𝐑𝐈𝐌𝐄 𝐗',
            serverMessageId: -1
        }
    }
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════
async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;
        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}
        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }
        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }
        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }
        if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

// ═══════════════════════════════════════════════════════════
// MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════
async function handleMessage(bad, mek, chatUpdate, store) {
    try {
        const sock = bad;
        const messageUpdate = chatUpdate;
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;
        const message = messages[0];
        if (!message?.message) return;

        const tomChat = message.key.remoteJid;
        const tomSender = message.key.participant || message.key.remoteJid;
        const chatId = tomChat;
        const senderId = tomSender;
        const isGroup = chatId.endsWith('@g.us');

        // --- ANTI-SPAM LOGIC 
        if (antiSpamActive && isGroup && !message.key.fromMe) {
            const now = Date.now();
            if (!tomSpamTracker[tomSender]) {
                tomSpamTracker[tomSender] = { count: 1, lastTime: now };
            } else {
                const diff = now - tomSpamTracker[tomSender].lastTime;
                if (diff < 10000) { tomSpamTracker[tomSender].count += 1; }
                else { tomSpamTracker[tomSender].count = 1; tomSpamTracker[tomSender].lastTime = now; }
            }
            if (tomSpamTracker[tomSender].count > 5) {
                await sock.sendMessage(tomChat, { text: "⚠️ *ꜱᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ*\nᴛᴏ ᴍᴜᴄʜ ꜱᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ. *𝐱-𝐏𝖗ï๓ē♡ 💗 𝖝* ᴋɪᴄᴋᴇᴅ ʏᴏᴜ." });
                await sock.groupParticipantsUpdate(tomChat, [tomSender], "remove");
                delete tomSpamTracker[tomSender];
                return;
            }
        }

        // --- sᴛɪᴄᴋᴇʀ sᴘᴀᴍ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ ʟᴏɢɪᴄ ---
        const isSticker = message.message?.stickerMessage;
        if (antiStickerActive && isSticker && !message.key.fromMe) {
            if (!isGroup) return;
            const now = Date.now();
            if (!adultStickerTracker[tomSender]) {
                adultStickerTracker[tomSender] = { count: 1, lastTime: now };
            } else {
                const diff = now - adultStickerTracker[tomSender].lastTime;
                if (diff < 8000) { 
                    adultStickerTracker[tomSender].count += 1; 
                } else { 
                    adultStickerTracker[tomSender].count = 1; 
                    adultStickerTracker[tomSender].lastTime = now; 
                }
            }
            if (adultStickerTracker[tomSender].count >= 3) {
                const adminStatus = await isAdmin(sock, tomChat, sock.user.id.split(':')[0] + '@s.whatsapp.net');
                if (!adminStatus.isBotAdmin) return;
                await sock.sendMessage(tomChat, { delete: message.key });
                await sock.sendMessage(tomChat, { 
                    text: "*sᴛɪᴄᴋᴇʀ sᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n3+ sᴛɪᴄᴋᴇʀ 8s ᴇʀ ᴍᴏᴅᴇ → ᴋɪᴄᴋᴇᴅ",
                    mentions: [tomSender]
                });
                await sock.groupParticipantsUpdate(tomChat, [tomSender], "remove");
                delete adultStickerTracker[tomSender];
                return;
            }
        }

        const tomMsg = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const tomLower = tomMsg.toLowerCase();

        // --- ᴀɴᴛɪsᴘᴀᴍ ᴏɴ/ᴏғ ᴄᴏᴍᴀɴᴅs ---
        if (tomLower === '.antispam ᴏɴ' || tomLower === '.antispam on') {
            if (!isGroup) return await sock.sendMessage(tomChat, { text: "This command can only be used in groups." });
            const adminStatus = await isAdmin(sock, tomChat, tomSender);
            if (!adminStatus.isSenderAdmin && !message.key.fromMe) return await sock.sendMessage(tomChat, { text: "```For Group Admins Only!```" });
            if (!adminStatus.isBotAdmin) return await sock.sendMessage(tomChat, { text: "Please make the bot an admin to use admin commands." });
            antiSpamActive = true;
            return await sock.sendMessage(tomChat, { text: "*ᴀɴᴛɪsᴘᴀᴍ ᴏɴ ✅*\n5s ᴇʀ ᴍᴏᴅᴇ 6+ ᴍsɢ = ᴀᴜᴛᴏ ᴋɪᴄᴋ" });
        }

        if (tomLower === '.antispam ᴏғ' || tomLower === '.antispam off') {
            if (!isGroup) return await sock.sendMessage(tomChat, { text: "This command can only be used in groups." });
            const adminStatus = await isAdmin(sock, tomChat, tomSender);
            if (!adminStatus.isSenderAdmin && !message.key.fromMe) return await sock.sendMessage(tomChat, { text: "```For Group Admins Only!```" });
            antiSpamActive = false;
            return await sock.sendMessage(tomChat, { text: "*ᴀɴᴛɪsᴘᴀᴍ ᴏғ ❌*" });
        }

        // --- ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ᴏɴ/ᴏғ ᴄᴏᴍᴀɴᴅs ---
        if (tomLower === '.antisticker ᴏɴ' || tomLower === '.antisticker on') {
            if (!isGroup) return await sock.sendMessage(tomChat, { text: "This command can only be used in groups." });
            const adminStatus = await isAdmin(sock, tomChat, tomSender);
            if (!adminStatus.isSenderAdmin && !message.key.fromMe) return await sock.sendMessage(tomChat, { text: "```For Group Admins Only!```" });
            if (!adminStatus.isBotAdmin) return await sock.sendMessage(tomChat, { text: "Please make the bot an admin to use admin commands." });
            antiStickerActive = true;
            return await sock.sendMessage(tomChat, { text: "*ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ᴏɴ ✅*\n3+ ᴇᴍᴏᴊɪ = ᴀᴜᴛᴏ ᴋɪᴄᴋ" });
        }

        if (tomLower === '.antisticker ᴏғ' || tomLower === '.antisticker off') {
            if (!isGroup) return await sock.sendMessage(tomChat, { text: "This command can only be used in groups." });
            const adminStatus = await isAdmin(sock, tomChat, tomSender);
            if (!adminStatus.isSenderAdmin && !message.key.fromMe) return await sock.sendMessage(tomChat, { text: "```For Group Admins Only!```" });
            antiStickerActive = false;
            return await sock.sendMessage(tomChat, { text: "*ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ᴏғ ❌*" });
        }

        // --- ᴛᴏᴍ ᴘʀɪᴍᴇ x ɴᴜᴄʟᴇᴀʀ ᴋɪᴄᴋ ᴀʟ ---
        if (tomLower === '.kickall') {
            if (!isGroup) return await sock.sendMessage(tomChat, { text: "This command can only be used in groups." });
            const groupMetadata = await sock.groupMetadata(tomChat);
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const isUserAdmin = groupMetadata.participants.find(p => p.id === tomSender)?.admin;
            if (!isUserAdmin) return await sock.sendMessage(tomChat, { text: "```For Group Admins Only!```" });
            const allParticipants = groupMetadata.participants.filter(p => p.id !== botId).map(p => p.id);
            if (allParticipants.length === 0) return;
            await sock.sendMessage(tomChat, { text: "🚫 *ᴛᴏᴍ ᴘʀɪᴍᴇ x ɴᴜᴄʟᴇᴀʀ ᴋɪᴄᴋ ᴀᴄᴛɪᴠᴀᴛᴇᴅ!*\nɢʀᴏᴜᴘ ᴄʟᴇᴀʀɪɴɢ ɪɴ 3...2...1... 💥" });
            const chunks = [];
            for (let i = 0; i < allParticipants.length; i += 50) { chunks.push(allParticipants.slice(i, i + 50)); }
            await Promise.all(chunks.map(chunk => sock.groupParticipantsUpdate(tomChat, chunk, "remove")));
            return;
        }

        // বটের মেসেজে রিপ্লাই চেক
        const isReplyToTom = message.message?.extendedTextMessage?.contextInfo?.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // চ্যাটবট লজিক
        if (tomLower === 'bot' || tomLower === 'বট' || tomLower.startsWith('bot ') || tomLower.startsWith('.bot ') || isReplyToTom) {
            let tomArgs = tomLower.startsWith('.bot ') || tomLower.startsWith('bot ') ? tomMsg.split(' ').slice(1) : (tomLower === 'bot' || tomLower === 'বট' ? [] : tomMsg.split(' '));
            await simCommand(sock, tomChat, message, tomArgs, tomSender);
            return; 
        }

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) { storeMessage(sock, message); }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, { text: '📢 *Join our Channel:*\nhttps://whatsapp.com/channel/0029Vb7clzdJENxtbn1shb0I' }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, { text: `🔗 *Support*\n\nhttps://whatsapp.com/channel/0029Vb7clzdJENxtbn1shb0I` }, { quoted: message });
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {}

        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, { text: '❌ You are banned from using the bot. Contact an admin to get unbanned.', ...channelInfo });
            }
            return;
        }

        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        if (isGroup) {
            if (userMessage) { await handleBadwordDetection(sock, chatId, message, userMessage, senderId); }
            await Antilink(message, sock);
        }

        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        if (!userMessage.startsWith('.')) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            if (isGroup) { await handleTagDetection(sock, chatId, message, senderId); }
            if (isPublic || isOwnerOrSudoCheck) { await handleChatbotResponse(sock, chatId, message, userMessage, senderId); }
            return;
        }

        if (!isPublic && !isOwnerOrSudoCheck) { return; }

        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));
        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use admin commands.', ...channelInfo }, { quoted: message });
                return;
            }
            if (['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote'].some(c => userMessage.startsWith(c))) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
                    return;
                }
            }
        }

        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                return;
            }
        }

        let commandExecuted = false;

        switch (true) {
            case userMessage === '.simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) { await simageCommand(sock, quotedMessage, chatId); } 
                else { await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the .simage command to convert it.', ...channelInfo }, { quoted: message }); }
                commandExecuted = true; break;
            }
            case userMessage.startsWith('.kick'):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                commandExecuted = true; break;
            case userMessage.startsWith('.mute'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const muteArg = parts[1];
                    const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                    if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                        await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .mute with no number to mute immediately.', ...channelInfo }, { quoted: message });
                    } else { await muteCommand(sock, chatId, senderId, message, muteDuration); }
                }
                commandExecuted = true; break;
            case userMessage === '.unmute': await unmuteCommand(sock, chatId, senderId); commandExecuted = true; break;
            case userMessage.startsWith('.ban'): await banCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.unban'): await unbanCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.list': await helpCommand(sock, chatId, message, global.channelLink); commandExecuted = true; break;
            case userMessage === '.sticker' || userMessage === '.s': await stickerCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.warnings'):
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                commandExecuted = true; break;
            case userMessage.startsWith('.warn'):
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                commandExecuted = true; break;
            case userMessage.startsWith('.tts'): await ttsCommand(sock, chatId, userMessage.slice(4).trim(), message); commandExecuted = true; break;
            case userMessage.startsWith('.delete') || userMessage.startsWith('.del'): await deleteCommand(sock, chatId, message, senderId); commandExecuted = true; break;
            case userMessage.startsWith('.attp'): await attpCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.settings': await settingsCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.mode'):
                {
                    let data; try { data = JSON.parse(fs.readFileSync('./data/messageCount.json')); } catch (e) { data = { isPublic: true }; }
                    const action = userMessage.split(' ')[1]?.toLowerCase();
                    if (!action) {
                        await sock.sendMessage(chatId, { text: `Current bot mode: *${data.isPublic ? 'public' : 'private'}*\n\nUsage: .mode public/private`, ...channelInfo }, { quoted: message });
                    } else if (action === 'public' || action === 'private') {
                        data.isPublic = action === 'public';
                        fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
                        await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, ...channelInfo });
                    }
                }
                commandExecuted = true; break;
            case userMessage.startsWith('.anticall'):
                await anticallCommand(sock, chatId, message, userMessage.split(' ').slice(1).join(' '));
                commandExecuted = true; break;
            case userMessage.startsWith('.pmblocker'):
                await pmblockerCommand(sock, chatId, message, userMessage.split(' ').slice(1).join(' '));
                commandExecuted = true; break;
            case userMessage === '.owner': await ownerCommand(sock, chatId); commandExecuted = true; break;
            case userMessage === '.tagall': await tagAllCommand(sock, chatId, senderId, message); commandExecuted = true; break;
            case userMessage === '.tagnotadmin': await tagNotAdminCommand(sock, chatId, senderId, message); commandExecuted = true; break;
            case userMessage.startsWith('.hidetag'):
                await hideTagCommand(sock, chatId, senderId, rawText.slice(8).trim(), message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null, message);
                commandExecuted = true; break;
            case userMessage.startsWith('.tag'):
                await tagCommand(sock, chatId, senderId, rawText.slice(4).trim(), message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null, message);
                commandExecuted = true; break;
            case userMessage.startsWith('.antilink'): await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message); commandExecuted = true; break;
            case userMessage.startsWith('.antitag'): await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message); commandExecuted = true; break;
            case userMessage === '.meme': await memeCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.joke': await jokeCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.quote': await quoteCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.fact': await factCommand(sock, chatId, message, message); commandExecuted = true; break;
            case userMessage.startsWith('.weather'): await weatherCommand(sock, chatId, message, userMessage.slice(9).trim()); commandExecuted = true; break;
            case userMessage === '.news': await newsCommand(sock, chatId); commandExecuted = true; break;
            case userMessage.startsWith('.ttt') || userMessage.startsWith('.tictactoe'): await tictactoeCommand(sock, chatId, senderId, userMessage.split(' ').slice(1).join(' ')); commandExecuted = true; break;
            case userMessage === '.topmembers': topMembers(sock, chatId, isGroup); commandExecuted = true; break;
            case userMessage.startsWith('.hangman'): startHangman(sock, chatId, senderId); commandExecuted = true; break;
            case userMessage.startsWith('.guess'): guessLetter(sock, chatId, senderId, userMessage.split(' ')[1]); commandExecuted = true; break;
            case userMessage === '.trivia': startTrivia(sock, chatId); commandExecuted = true; break;
            case userMessage.startsWith('.answer'): answerTrivia(sock, chatId, senderId, userMessage.split(' ')[1]); commandExecuted = true; break;
            case userMessage === '.compliment': await complimentCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.insult': await insultCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.8ball'): await eightBallCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.lyrics'): await lyricsCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.dare': await dareCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.truth': await truthCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.clear': await clearCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.ping': await pingCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.alive': await aliveCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.blur'): await blurCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.welcome'): await welcomeCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.goodbye'): await goodbyeCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.github'): await githubCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.antibadword'): await antibadwordCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.chatbot'): await handleChatbotCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.take'): await takeCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.flirt': await flirtCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.character'): await characterCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.wasted'): await wastedCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.ship'): await shipCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.groupinfo': await groupInfoCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.resetlink': await resetlinkCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.staff': await staffCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.emojimix'): await emojimixCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.vv': await viewOnceCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.clearsession': await clearSessionCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.autostatus'): await autoStatusCommand(sock, chatId, message, userMessage.split(' ').slice(1)); commandExecuted = true; break;
            case userMessage.startsWith('.simp'): await simpCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.ice'): await textmakerCommand(sock, chatId, message, userMessage, 'ice'); commandExecuted = true; break;
            case userMessage.startsWith('.antidelete'): await handleAntideleteCommand(sock, chatId, message, userMessage.slice(11).trim()); commandExecuted = true; break;
            case userMessage === '.cleartmp': await clearTmpCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.setpp': await setProfilePicture(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.setgdesc'): await setGroupDescription(sock, chatId, senderId, rawText.slice(9).trim(), message); commandExecuted = true; break;
            case userMessage.startsWith('.setgname'): await setGroupName(sock, chatId, senderId, rawText.slice(9).trim(), message); commandExecuted = true; break;
            case userMessage.startsWith('.setgpp'): await setGroupPhoto(sock, chatId, senderId, message); commandExecuted = true; break;
            case userMessage.startsWith('.igsc'):
                await igsCommand(sock, chatId, message, true);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.instagram') ||
                userMessage.startsWith('.insta') ||
                userMessage === '.ig' ||
                userMessage.startsWith('.ig '):
                await instagramCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.igs'): await igsCommand(sock, chatId, message, false); commandExecuted = true; break;
            case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'): await facebookCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.spotify'): await spotifyCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.play') || userMessage.startsWith('.song'): await songCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.video'): await videoCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.tiktok'): await tiktokCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.ai'): await aiCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.translate'): await handleTranslateCommand(sock, chatId, message, userMessage.slice(10)); commandExecuted = true; break;
            case userMessage.startsWith('.ssweb') || userMessage.startsWith('.screenshot'): {
                const ssCommandLength = userMessage.startsWith('.screenshot') ? 11 : 6;
                await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.ss'):
                await handleSsCommand(sock, chatId, message, userMessage.slice(3).trim());
                commandExecuted = true;
                break;
            case userMessage.startsWith('.areact'): await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck); commandExecuted = true; break;
            case userMessage.startsWith('.sudo'): await sudoCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.jid': await groupJidCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.mention '):
                await mentionToggleCommand(sock, chatId, message, userMessage.split(/\s+/).slice(1).join(' '), message.key.fromMe || senderIsSudo);
                commandExecuted = true;
                break;
            case userMessage === '.setmention':
                await setMentionCommand(sock, chatId, message, message.key.fromMe || senderIsSudo);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autotyping'): await autotypingCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.autoread'): await autoreadCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.heart'): await handleHeart(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.lgbt'): await miscCommand(sock, chatId, message, ['lgbt', ...userMessage.split(' ').slice(1)]); commandExecuted = true; break;
            case userMessage.startsWith('.tweet'): await miscCommand(sock, chatId, message, ['tweet', ...userMessage.split(' ').slice(1)]); commandExecuted = true; break;
            case userMessage.startsWith('.animu'): await animeCommand(sock, chatId, message, userMessage.split(' ').slice(1)); commandExecuted = true; break;
            case userMessage === '.crop': await stickercropCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage.startsWith('.pies'): await piesCommand(sock, chatId, message, rawText.trim().split(/\s+/).slice(1)); commandExecuted = true; break;
            case userMessage.startsWith('.update'): await updateCommand(sock, chatId, message, rawText.trim().split(/\s+/)[1] || ''); commandExecuted = true; break;
            case userMessage.startsWith('.remini'): await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1)); commandExecuted = true; break;
            case userMessage.startsWith('.sora'): await soraCommand(sock, chatId, message); commandExecuted = true; break;
            // Commands and aliases carried over from main.js
            case userMessage.startsWith('.promote'): {
                const mentionedJidListPromote = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.demote'): {
                const mentionedJidListDemote = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.info' || userMessage === '.about':
                await infoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.bot':
                await simCommand(sock, chatId, message, [], senderId);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.move'): {
                const position = Number.parseInt(userMessage.split(/\s+/)[1], 10);
                if (Number.isNaN(position)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid position number for Tic-Tac-Toe move.', ...channelInfo }, { quoted: message });
                } else {
                    await handleTicTacToeMove(sock, chatId, senderId, String(position));
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.stupid') ||
                userMessage.startsWith('.itssostupid') ||
                userMessage.startsWith('.iss'): {
                const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const args = userMessage.split(/\s+/).slice(1);
                await stupidCommand(sock, chatId, quoted, mentioned, senderId, args);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.steal'): {
                const takeArgs = rawText.slice(6).trim().split(/\s+/);
                await takeCommand(sock, chatId, message, takeArgs);
                commandExecuted = true;
                break;
            }
            case userMessage === '.git' ||
                userMessage === '.sc' ||
                userMessage === '.script' ||
                userMessage === '.repo':
                await githubCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.waste'): await wastedCommand(sock, chatId, message); commandExecuted = true; break;
            case userMessage === '.infogp' || userMessage === '.infogrupo':
                await groupInfoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.revoke' || userMessage === '.anularlink':
                await resetlinkCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;
            case userMessage === '.admins' || userMessage === '.listadmin':
                await staffCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.tourl') || userMessage.startsWith('.url'):
                await urlCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.emix'):
                await emojimixCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.tg') ||
                userMessage.startsWith('.stickertelegram') ||
                userMessage.startsWith('.tgsticker') ||
                userMessage.startsWith('.telesticker'):
                await stickerTelegramCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.clearsesi':
                await clearSessionCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.metallic'):
                await textmakerCommand(sock, chatId, message, userMessage, 'metallic');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.snow'):
                await textmakerCommand(sock, chatId, message, userMessage, 'snow');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.impressive'):
                await textmakerCommand(sock, chatId, message, userMessage, 'impressive');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.matrix'):
                await textmakerCommand(sock, chatId, message, userMessage, 'matrix');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.light'):
                await textmakerCommand(sock, chatId, message, userMessage, 'light');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.neon'):
                await textmakerCommand(sock, chatId, message, userMessage, 'neon');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.devil'):
                await textmakerCommand(sock, chatId, message, userMessage, 'devil');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.purple'):
                await textmakerCommand(sock, chatId, message, userMessage, 'purple');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.thunder'):
                await textmakerCommand(sock, chatId, message, userMessage, 'thunder');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.leaves'):
                await textmakerCommand(sock, chatId, message, userMessage, 'leaves');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.1917'):
                await textmakerCommand(sock, chatId, message, userMessage, '1917');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.arena'):
                await textmakerCommand(sock, chatId, message, userMessage, 'arena');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.hacker'):
                await textmakerCommand(sock, chatId, message, userMessage, 'hacker');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.sand'):
                await textmakerCommand(sock, chatId, message, userMessage, 'sand');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.blackpink'):
                await textmakerCommand(sock, chatId, message, userMessage, 'blackpink');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.glitch'):
                await textmakerCommand(sock, chatId, message, userMessage, 'glitch');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.fire'):
                await textmakerCommand(sock, chatId, message, userMessage, 'fire');
                commandExecuted = true;
                break;
            case userMessage === '.surrender':
                await handleTicTacToeMove(sock, chatId, senderId, 'surrender');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.music'):
                await playCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.mp3') || userMessage.startsWith('.ytmp3'):
                await songCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.ytmp4'):
                await videoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.tt'):
                await tiktokCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.gpt') || userMessage.startsWith('.gemini'):
                await aiCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.trt'):
                await handleTranslateCommand(sock, chatId, message, userMessage.slice(4));
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autoreact') || userMessage.startsWith('.autoreaction'):
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
            case userMessage === '.goodnight' || userMessage === '.lovenight' || userMessage === '.gn':
                await goodnightCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.shayari' || userMessage === '.shayri':
                await shayariCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.roseday':
                await rosedayCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.imagine') ||
                userMessage.startsWith('.flux') ||
                userMessage.startsWith('.dalle'):
                await imagineCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.horny') ||
                userMessage.startsWith('.circle') ||
                userMessage.startsWith('.lolice') ||
                userMessage.startsWith('.simpcard') ||
                userMessage.startsWith('.tonikawa') ||
                userMessage.startsWith('.its-so-stupid') ||
                userMessage.startsWith('.namecard'): {
                const parts = userMessage.trim().split(/\s+/);
                const args = [parts[0].slice(1), ...parts.slice(1)];
                await miscCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.oogway2') || userMessage.startsWith('.oogway'): {
                const parts = userMessage.trim().split(/\s+/);
                const sub = parts[0].slice(1);
                await miscCommand(sock, chatId, message, [sub, ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.ytcomment'): {
                const parts = userMessage.trim().split(/\s+/);
                await miscCommand(sock, chatId, message, ['youtube-comment', ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.comrade') ||
                userMessage.startsWith('.gay') ||
                userMessage.startsWith('.glass') ||
                userMessage.startsWith('.jail') ||
                userMessage.startsWith('.passed') ||
                userMessage.startsWith('.triggered'): {
                const parts = userMessage.trim().split(/\s+/);
                await miscCommand(sock, chatId, message, [parts[0].slice(1), ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.nom') ||
                userMessage.startsWith('.poke') ||
                userMessage.startsWith('.cry') ||
                userMessage.startsWith('.kiss') ||
                userMessage.startsWith('.pat') ||
                userMessage.startsWith('.hug') ||
                userMessage.startsWith('.wink') ||
                userMessage.startsWith('.facepalm') ||
                userMessage.startsWith('.face-palm') ||
                userMessage.startsWith('.animuquote') ||
                userMessage.startsWith('.loli'): {
                const parts = userMessage.trim().split(/\s+/);
                let sub = parts[0].slice(1);
                if (sub === 'facepalm') sub = 'face-palm';
                if (sub === 'animuquote') sub = 'quote';
                await animeCommand(sock, chatId, message, [sub]);
                commandExecuted = true;
                break;
            }
            case userMessage === '.china':
                await piesAlias(sock, chatId, message, 'china');
                commandExecuted = true;
                break;
            case userMessage === '.indonesia':
                await piesAlias(sock, chatId, message, 'indonesia');
                commandExecuted = true;
                break;
            case userMessage === '.japan':
                await piesAlias(sock, chatId, message, 'japan');
                commandExecuted = true;
                break;
            case userMessage === '.korea':
                await piesAlias(sock, chatId, message, 'korea');
                commandExecuted = true;
                break;
            case userMessage === '.india':
                await piesAlias(sock, chatId, message, 'india');
                commandExecuted = true;
                break;
            case userMessage === '.malaysia':
                await piesAlias(sock, chatId, message, 'malaysia');
                commandExecuted = true;
                break;
            case userMessage === '.thailand':
                await piesAlias(sock, chatId, message, 'thailand');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.removebg') ||
                userMessage.startsWith('.rmbg') ||
                userMessage.startsWith('.nobg'):
                await removebgCommand.exec(sock, message, userMessage.split(/\s+/).slice(1));
                commandExecuted = true;
                break;
            case userMessage.startsWith('.enhance') || userMessage.startsWith('.upscale'):
                await reminiCommand(sock, chatId, message, userMessage.split(/\s+/).slice(1));
                commandExecuted = true;
                break;
            default:
                if (isGroup) {
                    if (userMessage) { await handleChatbotResponse(sock, chatId, message, userMessage, senderId); }
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false; break;
        }

        if (commandExecuted !== false) {
            if (userMessage.startsWith('.')) { await addCommandReaction(sock, message); }
            await showTypingAfterCommand(sock, chatId);
        }

        async function groupJidCommand(sock, chatId, message) {
            const groupJid = message.key.remoteJid;
            if (!groupJid.endsWith('@g.us')) { return await sock.sendMessage(chatId, { text: "❌ This command can only be used in a group." }); }
            await sock.sendMessage(chatId, { text: `✅ Group JID: ${groupJid}` }, { quoted: message });
        }
    } catch (error) { console.error('❌ Error in message handler:', error.message); }
}

handleMessage.handleGroupParticipantUpdate = handleGroupParticipantUpdate;
module.exports = handleMessage;
