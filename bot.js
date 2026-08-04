require('dotenv').config();
require('./setting/config');
const TelegramBot = require('node-telegram-bot-api').default;
const fs = require('fs').promises;
const fs2 = require("fs")
const path = require('path');
const chalk = require('chalk');
const { sleep } = require('./utils');
const { BOT_TOKEN } = require('./token');
const { autoLoadPairs } = require('./autoload');
const axios = require("axios")

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const adminFilePath = path.join(__dirname, 'kingbadboitimewisher', 'admin.json');
let adminIDs = [];

const userStates = new Map();

// ===== Prevent double "Bot Connected" messages =====
const notifiedConnections = new Set();

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// ===== Reply options: reply to the user's original message =====
const replyOpts = (msg, extra = {}) => ({
  reply_to_message_id: msg.message_id,
  parse_mode: 'HTML',
  ...extra
});

const sendReferenceImage = async (chatId, fileName, caption) => {
  const filePath = path.join(__dirname, fileName);
  if (!(await exists(filePath))) return;
  return bot.sendPhoto(chatId, filePath, {
    caption,
    parse_mode: 'HTML'
  });
};

const loadAdminIDs = async () => {
  const ownerID = '8801791903810';
  const defaultAdmins = [ownerID];

  if (!(await exists(adminFilePath))) {
    await fs.writeFile(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
    adminIDs = defaultAdmins;
    console.log('✅ ᴄʀᴇᴀᴛᴇᴅ ᴀᴅᴍɪɴ.ᴊsᴏɴ ᴡɪᴛʜ ᴅᴇғᴀᴜʟᴛ ᴏᴡɴᴇʀ ɪᴅ');
  } else {
    try {
      const raw = await fs.readFile(adminFilePath, 'utf8');
      adminIDs = JSON.parse(raw);
    } catch (err) {
      console.error('ᴇʀᴏʀ ʟᴏᴀᴅɪɴɢ ᴀᴅᴍɪɴ.ᴊsᴏɴ:', err);
      adminIDs = defaultAdmins;
    }
  }
  console.log('📥 ʟᴏᴀᴅᴇᴅ ᴀᴅᴍɪɴ ɪᴅs:', adminIDs);
};

let isShuttingDown = false;
let isAutoLoadRunning = true;

const runAutoLoad = async () => {
  if (isAutoLoadRunning || isShuttingDown) return;
  isAutoLoadRunning = true;
  try {
    console.log('⏱️ ɪɴɪᴛɪᴀᴛɪɴɢ ᴀᴜᴛᴏ-ʟᴏᴀᴅ');
    await autoLoadPairs();
    console.log('✅ ᴀᴜᴛᴏ-ʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇᴅ');
  } catch (e) {
    console.error('❌ ᴀᴜᴛᴏ-ʟᴏᴀᴅ ғᴀɪʟᴇᴅ:', e);
  } finally {
    isAutoLoadRunning = false;
  }
};

const startAutoLoadLoop = () => {
  runAutoLoad();
  setInterval(runAutoLoad, 60 * 60 * 1000);
};
startAutoLoadLoop();

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`🛑 ʀᴇᴄᴇɪᴠᴇᴅ ${signal}. sʜᴜᴛɪɴɢ ᴅᴏᴡɴ ɢʀᴀᴄᴇғᴜʟʏ...`);
  bot.stopPolling();
  console.log('✅ ʙᴏᴛ sᴛᴏᴘᴇᴅ sᴜᴄᴇssғᴜʟʏ');
  process.exit(0);
};

const getCountryFlag = (code) => {
  const flags = {
    '880': '🇧🇩', '91': '🇮🇳', '92': '🇵🇰', '1': '🇺🇸', '44': '🇬🇧', '62': '🇮🇩'
  };
  return flags[code] || '🌍';
};

const getCountryName = (code) => {
  const countries = {
    '880': 'BD', '91': 'IN', '92': 'PK', '1': 'US', '44': 'GB', '62': 'ID'
  };
  return countries[code] || 'UNKNOWN';
};

// ===== Helper: Count active sessions =====
const getActiveSessionCount = async () => {
  try {
    const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
    if (!(await exists(pairingFolder))) return 0;
    const entries = await fs.readdir(pairingFolder, { withFileTypes: true });
    return entries.filter(e => e.isDirectory() && e.name.includes('@s.whatsapp.net')).length;
  } catch {
    return 0;
  }
};

const sendGroupOnlyMessage = async (chatId, msg) => {
  return bot.sendMessage(
    chatId,
    `🌸 <b>Gʀᴏᴜᴩ Oɴʟʏ Fᴇᴀᴛᴜʀᴇ</b>\n\n` +
    `👉 Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ᴛʜᴇ ᴏғɪᴄɪᴀʟ ɢʀᴏᴜᴘ.\n` +
    `Cʟɪᴄᴋ ʙᴇʟᴏᴡ ᴛᴏ ᴊᴏɪɴ ᴀɴᴅ ᴜsᴇ /pair ᴛʜᴇʀᴇ.\n` +
    `https://t.me/tomxbugvip`,
    replyOpts(msg)
  );
};

// ===================== /start =====================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (!isGroup) {
    return sendGroupOnlyMessage(chatId, msg);
  }

  await bot.sendPhoto(
    chatId,
    path.join(__dirname, "IMG-20260803-WA0030_1785737664933.jpg"),
    {
      caption:
        `🪀 <b>x-Tᴏᴍ♡ 💗Mɪɴɪ</b>\n\n` +
        `╔════════════╗\n` +
        ` ⤷ /ᴘᴀɪʀ &lt;ᴡᴀ_ɴᴜᴍʙᴇʀ&gt;\n` +
        ` ⤷ /ᴜɴᴘᴀɪʀ &lt;ᴡᴀ_ɴᴜᴍʙᴇʀ&gt;\n` +
        `╚════════════╝`,
      parse_mode: 'HTML',
      reply_to_message_id: msg.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: "👑 Oᴡɴᴇʀ", url: "https://t.me/majidulislamzihad" }]
        ]
      }
    }
  );
});

// ===================== /ping =====================
bot.onText(/\/ping/, async (msg) => {
  const chatId = msg.chat.id;
  const startedAt = Date.now();
  const sent = await bot.sendMessage(chatId, `🏓 <b>PONG!</b>`, replyOpts(msg));
  const latency = Date.now() - startedAt;

  await sendReferenceImage(
    chatId,
    "IMG-20260803-WA0031_1785737664787.jpg",
    `🏓 PONG!\n⚡ ${latency}ms`
  );

  return bot.editMessageText(
    `🏓 <b>PONG!</b>\n⚡ ${latency}ms`,
    {
      chat_id: chatId,
      message_id: sent.message_id,
      parse_mode: 'HTML'
    }
  );
});

// ===================== /status =====================
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;

  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  const sessionCount = await getActiveSessionCount();

  const statusText =
    `📊 <b>Bᴏᴛ Sᴛᴀᴛᴜs</b>\n` +
    `⚡ <b>Pᴏᴡᴇʀᴇᴅ ʙʏ 𝐱-𝐓𝐨𝐦♡</b>\n\n` +
    `⏱️ <b>Uᴘᴛɪᴍᴇ:</b> ${hours}ʜ ${minutes}ᴍ ${seconds}s\n` +
    `💾 <b>Mᴇᴍᴏʀʏ:</b> ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB\n` +
    `📡 <b>Aᴄᴛɪᴠᴇ Sᴇssɪᴏɴs:</b> ${sessionCount}\n` +
    `🟢 <b>ONLINE</b>\n` +
    `🖥️ <b>Pʟᴀᴛғᴏʀᴍ:</b> ${process.platform}\n` +
    `📦 <b>Nᴏᴅᴇ.ᴊs:</b> ${process.version}`;

  await sendReferenceImage(
    chatId,
    "IMG-20260803-WA0036_1785737664753.jpg",
    statusText.replace(/<[^>]*>/g, '')
  );

  return bot.sendMessage(chatId, statusText, replyOpts(msg));
});

// ===================== /pair =====================
bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  const text = match[1]?.trim();

  if (!isGroup) {
    return sendGroupOnlyMessage(chatId, msg);
  }

  if (!text) {
    userStates.set(userId, { step: 'awaiting_number' });
    await sendReferenceImage(chatId, "IMG-20260803-WA0033(1)_1785737664697.jpg", "Please provide a phone number with country code.");
    return bot.sendMessage(
      chatId,
      `Pʟᴇᴀsᴇ Pʀᴏᴠɪᴅᴇ ᴀ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ.\n` +
      `Exᴀᴍᴘʟᴇ: /pair +8801791903810\n` +
      `"Iɴᴄʟᴜᴅᴇ ʏᴏᴜʀ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ"`,
      replyOpts(msg)
    );
  }

  let cleanNumber = text.replace(/\D/g, '');

  if (!/^\d{7,15}$/.test(cleanNumber)) {
    await sendReferenceImage(chatId, "IMG-20260803-WA0034_1785737664890.jpg", `Invalid number: ${cleanNumber}`);
    return bot.sendMessage(
      chatId,
      `❌ <b>Iɴᴠᴀʟɪᴅ Fᴏʀᴍᴀᴛ.</b>\n\nExᴀᴍᴘʟᴇ: /pair +8801791903810`,
      replyOpts(msg)
    );
  }

  if (cleanNumber.startsWith('0')) {
    return bot.sendMessage(
      chatId,
      `❌ <b>Dᴏ ɴᴏᴛ sᴛᴀʀᴛ ᴡɪᴛʜ 0.</b>\n\nIɴᴄʟᴜᴅᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ ᴇ.ɢ: 8801xxxxxxxx`,
      replyOpts(msg)
    );
  }

  const countryCode = cleanNumber.slice(0, 3);
  if (["252", "201"].includes(countryCode)) {
    return bot.sendMessage(
      chatId,
      `❌ <b>Nᴜᴍʙᴇʀs ᴡɪᴛʜ ᴛʜɪs ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ ᴀʀᴇ ɴᴏᴛ sᴜᴘᴩᴏʀᴛᴇᴅ.</b>`,
      replyOpts(msg)
    );
  }

  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  if (!(await exists(pairingFolder))) {
    await fs.mkdir(pairingFolder, { recursive: true });
  }

  const files = await fs.readdir(pairingFolder);
  const pairedCount = files.filter(f => f.endsWith('@s.whatsapp.net')).length;

  if (pairedCount >= 1000) {
    return bot.sendMessage(
      chatId,
      `❌ <b>Pᴀɪʀɪɴɢ Lɪᴍɪᴛ Rᴇᴀᴄʜᴇᴅ.</b>\n\nPʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.`,
      replyOpts(msg)
    );
  }

  userStates.delete(userId);

  const flag = getCountryFlag(countryCode);
  const country = getCountryName(countryCode);

  // Capture message_id for use inside async onConnected callback
  const originalMsgId = msg.message_id;

  try {
    const startpairing = require('./pair.js');
    const Xreturn = cleanNumber + "@s.whatsapp.net";

    // Step 1: Requesting pairing message — replies to user's command
    await bot.sendMessage(
      chatId,
      `⌛ <b>Rᴇqᴜᴇsᴛɪɴɢ ᴘᴀɪʀɪɴɢ ғᴏʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ...</b>\n\n` +
      `📱 <b>Nᴜᴍʙᴇʀ:</b> ${cleanNumber}\n` +
      `${flag} ${country} (+${countryCode})\n\n` +
      `🔒 Pʟᴇᴀsᴇ ᴡᴀɪᴛ ᴀ ᴍᴏᴍᴇɴᴛ...`,
      replyOpts(msg)
    );
    await sendReferenceImage(chatId, "IMG-20260803-WA0032_1785737664826.jpg", `Requesting pairing for ${cleanNumber}`);

    // ✅ onConnected — called by pair.js when WhatsApp session is ACTUALLY established
    const notifyKey = `${chatId}_${cleanNumber}`;
    const onConnected = async () => {
      if (notifiedConnections.has(notifyKey)) return;
      notifiedConnections.add(notifyKey);
      await bot.sendMessage(
        chatId,
        `🌹 <b>Bᴏᴛ Cᴏɴɴᴇᴄᴛᴇᴅ!</b>\n\n` +
        `🪄 Tʜɪs ɴᴜᴍʙᴇʀ ɪs ɴᴏᴡ ᴀ ᴄᴏɴɴᴇᴄᴛᴇᴅ!\n\n` +
        `📱 <b>Nᴜᴍʙᴇʀ:</b> +${cleanNumber}\n` +
        `${flag} ${country} (+${countryCode})`,
        {
          reply_to_message_id: originalMsgId,
          parse_mode: 'HTML'
        }
      );
    };

    // Pass onConnected + replyToMessageId to pair.js
    await startpairing(Xreturn, {
      telegramBot: bot,
      telegramChatId: chatId,
      cleanNumber,
      flag,
      country,
      countryCode,
      onConnected,
      replyToMessageId: originalMsgId
    });
    await sleep(4000);

    const pairingFile = path.join(pairingFolder, 'pairing.json');
    const cu = await fs.readFile(pairingFile, 'utf-8');
    const cuObj = JSON.parse(cu);
    delete require.cache[require.resolve('./pair.js')];

    await sendReferenceImage(chatId, "IMG-20260803-WA0035_1785737664966.jpg", `Pairing completed for ${cleanNumber}`);

    // Step 2: Pair Code Ready — replies to user's original command
    await bot.sendMessage(
      chatId,
      `🔐 <b>Pᴀɪʀ Cᴏᴅᴇ Rᴇᴀᴅʏ</b>\n` +
      `📱 <b>Nᴜᴍʙᴇʀ:</b> ${cleanNumber}\n` +
      `🌐 <b>Cᴏᴜɴᴛʀʏ:</b> ${flag} ${country} (+${countryCode})\n\n` +
      `╭──────〔🛡️ Cᴏᴅᴇ 〕──────◆\n` +
      `│ <code>${cuObj.code}</code>\n` +
      `╰──────────────────◆\n\n` +
      `📌 <b>Hᴏᴡ ᴛᴏ ᴜsᴇ:</b>\n` +
      `1. Wʜᴀᴛsᴀᴘᴘ → Sᴇᴛᴛɪɴɢs → Lɪɴᴋᴇᴅ Dᴇᴠɪᴄᴇs\n` +
      `2. Cʟɪᴄᴋ Lɪɴᴋ A Dᴇᴠɪᴄᴇ → Eɴᴛᴇʀ ᴄᴏᴅᴇ\n\n` +
      `⏰ Cᴏᴅᴇ ᴇxᴘɪʀᴇs ɪɴ ~60 Sᴇᴄᴏɴᴅs`,
      {
        parse_mode: 'HTML',
        reply_to_message_id: originalMsgId,
        reply_markup: {
          inline_keyboard: [
            [{ text: `📋 Cᴏᴘʏ: ${cuObj.code}`, callback_data: `copy_code_${cuObj.code}` }]
          ]
        }
      }
    );

  } catch (error) {
    console.error('ᴘᴀɪʀ ᴄᴏᴍᴀɴᴅ ᴇʀᴏʀ:', error);
    await sendReferenceImage(chatId, "IMG-20260803-WA0034_1785737664890.jpg", `Timed out for ${cleanNumber}`);
    bot.sendMessage(
      chatId,
      `😴 【 Tɪᴍᴇᴅ Oᴜᴛ Fᴏʀ Pᴀɪʀɪɴɢ ⏰ Tɪᴍᴇᴅ Oᴜᴛ ⌛ 】 —🌟 Nᴏ Rᴇsᴘᴏɴsᴇ Fʀᴏᴍ Tʜᴇ Tᴀʀɢᴇᴛ 🅽🆄🅼🅱🅴🆁.\n\n` +
      `📱 <b>Nᴜᴍʙᴇʀ:</b> ${cleanNumber}\n\n` +
      `🔄 Sᴇɴᴅ /pair ${cleanNumber} Aɢᴀɪɴ Tᴏ Gᴇᴛ ᴀ Nᴇᴡ Cᴏᴅᴇ. 🕸️\n\n` +
      `ᴀɢᴀɪɴ ᴛᴏ ɢᴇᴛ ᴀ ɴᴇᴡ ᴄᴏᴅᴇ.\n\n` +
      `✔️ Sᴇᴀssɪᴏɴ Cʟᴇᴀʀᴇᴅ, ʏᴏᴜ ᴄᴀɴ ʀᴇqᴜᴇsᴛ ᴀɢᴀɪɴ ɴᴏᴡ📘`,
      replyOpts(msg)
    );
  }
});

// ===================== Callback query (Copy Code button) =====================
bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data;

  if (data && data.startsWith('copy_code_')) {
    const code = data.replace('copy_code_', '');
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `✅ Cᴏᴅᴇ Cᴏᴩɪᴇᴅ: ${code}`,
      show_alert: true
    });
    return;
  }
});

// ===================== Plain message handler =====================
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (msg.chat.type === 'private') return;
  if (!text) return;
  if (text.startsWith('/')) return;

  const userState = userStates.get(userId);
  if (!userState || userState.step !== 'awaiting_number') return;

  const phoneRegex = /^\d{7,15}$/;
  const cleanNumber = text.replace(/\D/g, '');
  if (!phoneRegex.test(cleanNumber)) return;

  userStates.delete(userId);
  bot.sendMessage(
    chatId,
    `Pʟᴇᴀsᴇ ᴜsᴇ /pair &lt;ɴᴜᴍʙᴇʀ&gt; ᴄᴏᴍᴍᴀɴᴅ ɪɴsᴛᴇᴀᴅ`,
    replyOpts(msg)
  );
});

// ===================== /unpair =====================
bot.onText(/\/unpair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1]?.trim();
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (!isGroup) {
    return sendGroupOnlyMessage(chatId, msg);
  }

  try {
    if (!input) {
      return bot.sendMessage(
        chatId,
        `Exᴀᴍᴘʟᴇ: /unpair 8801xxxxxxxxx`,
        replyOpts(msg)
      );
    }
    const cleanInput = input.replace(/\D/g, '');

    if (!/^\d{7,15}$/.test(cleanInput)) {
      return bot.sendMessage(
        chatId,
        `Iɴᴠᴀʟɪᴅ Fᴏʀᴍᴀᴛ. Usᴇ: /unpair 8801xxxxxxxxx`,
        replyOpts(msg)
      );
    }

    const jidSuffix = `${cleanInput}`;
    const pairingPath = path.join(__dirname, 'kingbadboitimewisher', 'pairing');

    if (!(await exists(pairingPath))) {
      return bot.sendMessage(
        chatId,
        `Nᴏ Pᴀɪʀᴇᴅ Dᴇᴠɪᴄᴇs Fᴏᴜɴᴅ.`,
        replyOpts(msg)
      );
    }

    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    const matched = entries.find(entry => entry.isDirectory() && entry.name.endsWith(jidSuffix));

    if (!matched) {
      return bot.sendMessage(
        chatId,
        `Nᴏ Pᴀɪʀᴇᴅ Dᴇᴠɪᴄᴇ Fᴏᴜɴᴅ ғᴏʀ <b>${cleanInput}</b>`,
        replyOpts(msg)
      );
    }

    const targetPath = path.join(pairingPath, matched.name);
    await fs.rm(targetPath, { recursive: true, force: true });

    return bot.sendMessage(
      chatId,
      `✅ Pᴀɪʀᴇᴅ Usᴇʀ <b>${cleanInput}</b> ʜᴀs ʙᴇᴇɴ Dᴇʟᴇᴛᴇᴅ Sᴜᴄᴄᴇssғᴜʟʟʏ`,
      replyOpts(msg)
    );

  } catch (err) {
    console.error('ᴜɴᴘᴀɪʀ ᴇʀᴏʀ:', err);
    bot.sendMessage(
      chatId,
      `Fᴀɪʟᴇᴅ ᴛᴏ Dᴇʟᴇᴛᴇ Pᴀɪʀᴇᴅ Usᴇʀ. Pʟᴇᴀsᴇ Tʀʏ Aɢᴀɪɴ.`,
      replyOpts(msg)
    );
  }
});

bot.on('polling_error', (error) => {
  console.error('ᴘᴏʟɪɴɢ ᴇʀᴏʀ:', error);
});

(async () => {
  await loadAdminIDs();

  const restartCount = parseInt(process.env.RESTART_COUNT || 0);
  console.log(`ʀᴇsᴛᴀʀᴛ #${restartCount + 1}`);
  process.env.RESTART_COUNT = String(restartCount + 1);

  console.log('🤖 Tᴇʟᴇɢʀᴀᴍ Bᴏᴛ ɪs Rᴜɴɴɪɴɢ...');
  console.log('✅ Bᴏᴛ Usᴇʀɴᴀᴍᴇ: @ʙᴏᴛ_ʜᴏsᴛɪɴɢ_ᴠ1_ʙᴏᴛ');
  console.log('✅ Fᴇᴀᴛᴜʀᴇs: /ᴘᴀɪʀ, /ᴜɴᴘᴀɪʀ, /sᴛᴀʀᴛ - Gʀᴏᴜᴘ Oɴʟʏ');
})();

process.on("uncaughtException", (err) => {
  console.error('ᴜɴᴄᴀᴜɢʜᴛ ᴇxᴄᴇᴘᴛɪᴏɴ:', err);
});
process.on("unhandledRejection", (err) => {
  console.error('ᴜɴʜᴀɴᴅʟᴇᴅ ʀᴇᴊᴇᴄᴛɪᴏɴ:', err);
});
process.removeAllListeners("warning");
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('message', (msg) => {
  if (msg === 'shutdown') gracefulShutdown('PM2_SHUTDOWN');
});