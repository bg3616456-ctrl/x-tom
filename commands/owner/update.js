/**
 * Update Command - Fetch latest code via ZIP (Owner Only)
 * Preserves runtime/state dirs: node_modules, session, tmp, temp, database, config.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../../config');

const MAX_REDIRECTS = 5;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
      resolve((stdout || '').toString());
    });
  });
}

async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
    await run(cmd);
    return;
  }
  try {
    await run('command -v unzip');
    await run(`unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  try {
    await run('command -v 7z');
    await run(`7z x -y '${zipPath}' -o'${outDir}'`);
    return;
  } catch {}
  try {
    await run('busybox unzip -h');
    await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  throw new Error('কোনো unzip টুল পাওয়া যায়নি। unzip/7z/busybox ইন্সটল করুন।');
}

function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    try {
      if (visited.has(url) || visited.size > MAX_REDIRECTS) {
        return reject(new Error('অনেক বেশি রিডাইরেক্ট'));
      }
      visited.add(url);

      const client = url.startsWith('https://')? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'ᴛᴏᴍ ᴘʀɪᴍᴇ x-Updater/1.0',
          'Accept': '*/*'
        }
      }, res => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          if (!location) return reject(new Error(`HTTP ${res.statusCode} Location নেই`));
          const nextUrl = new URL(location, url).toString();
          res.resume();
          return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
        }

        if (res.statusCode!== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', err => {
          try { file.close(() => {}); } catch {}
          fs.unlink(dest, () => reject(err));
        });
      });
      req.on('error', err => {
        fs.unlink(dest, () => reject(err));
      });
    } catch (e) {
      reject(e);
    }
  });
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d, ignore, path.join(relative, entry), outList);
    } else {
      fs.copyFileSync(s, d);
      if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
    }
  }
}

async function updateViaZip(zipUrl) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, 'update.zip');
  const extractTo = path.join(tmpDir, 'update_extract');

  await downloadFile(zipUrl, zipPath);

  if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
  await extractZip(zipPath, extractTo);

  const entries = fs.readdirSync(extractTo);
  const rootCandidate = entries.length === 1? path.join(extractTo, entries[0]) : extractTo;
  const srcRoot = fs.existsSync(rootCandidate) && fs.lstatSync(rootCandidate).isDirectory()? rootCandidate : extractTo;

  const ignore = [
    'node_modules',
    '.git',
    'session',
    'tmp',
    'temp',
    'database',
    'config.js'
  ];
  const copied = [];
  copyRecursive(srcRoot, process.cwd(), ignore, '', copied);

  try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(zipPath, { force: true }); } catch {}

  return { copiedFiles: copied };
}

module.exports = {
  name: 'update',
  aliases: ['upgrade', 'আপডেট'],
  category: 'owner',
  description: 'ZIP URL থেকে বট আপডেট করুন (Owner Only)',
  usage: '.update [zip_url]',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const zipUrl = (args[0] || config.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();

    if (!zipUrl) {
      return extra.reply(
        `🔄 *বট আপডেট*\n\n` +
        `❌ *কোনো আপডেট URL পাওয়া যায়নি!*\n\n` +
        `*সেট করুন:* *config.js* এ *updateZipUrl* যোগ করুন\n` +
        `*অথবা সরাসরি দিন:* *.update <zip_url>*\n\n` +
        `*উদাহরণ:* *.update https://github.com/user/repo/archive/main.zip*`
      );
    }

    const loadingMsg = await extra.reply(
      `🔄 *বট আপডেট শুরু হচ্ছে...*\n\n` +
      `*URL:* *${zipUrl}*\n` +
      `*_দয়া করে অপেক্ষা করুন_*`
    );

    try {
      await sock.sendMessage(chatId, { text: '📥 *ফাইল ডাউনলোড হচ্ছে...*', edit: loadingMsg.key });
      const { copiedFiles } = await updateViaZip(zipUrl);

      await sock.sendMessage(chatId, { text: '📦 *ফাইল এক্সট্রাক্ট হচ্ছে...*', edit: loadingMsg.key });

      let summary = '';
      if (copiedFiles.length > 0) {
        summary = `✅ *আপডেট সফল!*\n\n` +
                  `*আপডেট হওয়া ফাইল:* *${copiedFiles.length} টি*\n\n` +
                  `*_নিরাপদ ফোল্ডার:_* *node_modules, session, database, config.js* *স্কিপ করা হয়েছে*\n\n`;
        if (copiedFiles.length <= 10) {
          summary += `*ফাইল লিস্ট:*\n` + copiedFiles.map(f => `• ${f}`).join('\n');
        }
      } else {
        summary = '✅ *আপডেট সম্পন্ন!*\n*কোনো ফাইল পরিবর্তন হয়নি।*';
      }

      await sock.sendMessage(chatId, {
        text: `${summary}\n\n🔁 *বট রিস্টার্ট হচ্ছে...*`,
        edit: loadingMsg.key
      }, { quoted: msg });

      // PM2 restart try
      try {
        await run('pm2 restart all');
        await sock.sendMessage(chatId, { text: '✅ *PM2 দিয়ে বট রিস্টার্ট করা হয়েছে!*' });
        return;
      } catch {}

      setTimeout(() => process.exit(0), 1000);
    } catch (error) {
      console.error('Update failed:', error);
      await sock.sendMessage(chatId, {
        text: `❌ *আপডেট ব্যর্থ!*\n\n*এরর:* ${String(error.message || error)}`,
        edit: loadingMsg.key
      }, { quoted: msg });
    }
  }
};