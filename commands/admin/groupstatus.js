const crypto = require('crypto');
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

// Single default color for text statuses (purple)
const PURPLE_COLOR = '#9C27B0';

module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus', 'grpstatus'],
  description: 'রিপ্লাই করা মিডিয়া বা টেক্সট গ্রুপ স্ট্যাটাস হিসেবে পোস্ট করা',
  usage: '.groupstatus [ক্যাপশন] (ইমেজ/ভিডিও/অডিওতে রিপ্লাই দিন) অথবা.groupstatus আপনার টেক্সট',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;

      // Only inside groups
      if (!extra.isGroup) {
        return extra.reply('👥 *এই কমান্ড শুধুমাত্র গ্রুপেই ব্যবহার করা যাবে।*');
      }

      const caption = (args.join(' ') || '').trim();

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted =!!ctxInfo?.quotedMessage;

      // CASE 1: No quoted message -> treat as TEXT group status
      if (!hasQuoted) {
        if (!caption) {
          return extra.reply(
            '📝 *গ্রুপ স্ট্যাটাস ব্যবহার*\n\n' +
            '• *ইমেজ/ভিডিও/অডিওতে রিপ্লাই দিয়ে:*\n' +
            ' `.groupstatus [ঐচ্ছিক ক্যাপশন]`\n' +
            '• *শুধু টেক্সট স্ট্যাটাস দিতে:*\n' +
            ' `.groupstatus আপনার টেক্সট এখানে`\n\n' +
            '*টেক্সট স্ট্যাটাস ডিফল্ট বেগুনি ব্যাকগ্রাউন্ডে পোস্ট হবে।*'
          );
        }

        await extra.reply('⏳ *টেক্সট গ্রুপ স্ট্যাটাস পোস্ট করা হচ্ছে...*');

        try {
          await groupStatus(sock, from, {
            text: caption,
            backgroundColor: PURPLE_COLOR,
          });
          return extra.reply('✅ *টেক্সট গ্রুপ স্ট্যাটাস পোস্ট করা হয়েছে!*');
        } catch (e) {
          console.error('groupstatus text error:', e);
          return extra.reply('❌ *টেক্সট গ্রুপ স্ট্যাটাস পোস্ট করা যায়নি:* ' + (e.message || e));
        }
      }

      // CASE 2: Quoted media -> image/video/audio group status
      const targetMessage = {
        key: {
          remoteJid: from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };

      const mtype = Object.keys(targetMessage.message)[0] || '';

      const downloadBuf = async () => {
        const qmsg = targetMessage.message;
        if (/image/i.test(mtype)) return await downloadMedia(qmsg, 'image');
        if (/video/i.test(mtype)) return await downloadMedia(qmsg, 'video');
        if (/audio/i.test(mtype)) return await downloadMedia(qmsg, 'audio');
        if (/sticker/i.test(mtype)) return await downloadMedia(qmsg, 'sticker');
        return null;
      };

      // IMAGE (also handles stickers)
      if (/image|sticker/i.test(mtype)) {
        await extra.reply('⏳ *ইমেজ গ্রুপ স্ট্যাটাস পোস্ট করা হচ্ছে...*');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('❌ *ইমেজ ডাউনলোড করা যায়নি*');
        }
        if (!buf) return extra.reply('❌ *ইমেজ ডাউনলোড করা সম্ভব হয়নি*');

        try {
          await groupStatus(sock, from, {
            image: buf,
            caption: caption || '',
          });
          return extra.reply('✅ *ইমেজ গ্রুপ স্ট্যাটাস পোস্ট করা হয়েছে!*');
        } catch (e) {
          console.error('groupstatus image error:', e);
          return extra.reply('❌ *ইমেজ গ্রুপ স্ট্যাটাস পোস্ট করা যায়নি:* ' + (e.message || e));
        }
      }

      // VIDEO
      if (/video/i.test(mtype)) {
        await extra.reply('⏳ *ভিডিও গ্রুপ স্ট্যাটাস পোস্ট করা হচ্ছে...*');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('❌ *ভিডিও ডাউনলোড করা যায়নি*');
        }
        if (!buf) return extra.reply('❌ *ভিডিও ডাউনলোড করা সম্ভব হয়নি*');

        try {
          await groupStatus(sock, from, {
            video: buf,
            caption: caption || '',
          });
          return extra.reply('✅ *ভিডিও গ্রুপ স্ট্যাটাস পোস্ট করা হয়েছে!*');
        } catch (e) {
          console.error('groupstatus video error:', e);
          return extra.reply('❌ *ভিডিও গ্রুপ স্ট্যাটাস পোস্ট করা যায়নি:* ' + (e.message || e));
        }
      }

      // AUDIO (voice-style group status)
      if (/audio/i.test(mtype)) {
        await extra.reply('⏳ *অডিও গ্রুপ স্ট্যাটাস পোস্ট করা হচ্ছে...*');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('❌ *অডিও ডাউনলোড করা যায়নি*');
        }
        if (!buf) return extra.reply('❌ *অডিও ডাউনলোড করা সম্ভব হয়নি*');

        let vn;
        try {
          vn = await toVN(buf);
        } catch {
          vn = buf;
        }

        let waveform;
        try {
          waveform = await generateWaveform(buf);
        } catch {
          waveform = undefined;
        }

        try {
          await groupStatus(sock, from, {
            audio: vn,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform,
          });
          return extra.reply('✅ *অডিও গ্রুপ স্ট্যাটাস পোস্ট করা হয়েছে!*');
        } catch (e) {
          console.error('groupstatus audio error:', e);
          return extra.reply('❌ *অডিও গ্রুপ স্ট্যাটাস পোস্ট করা যায়নি:* ' + (e.message || e));
        }
      }

      return extra.reply('❌ *সাপোর্টেড মিডিয়া না! ইমেজ, ভিডিও অথবা অডিওতে রিপ্লাই দিন।*');
    } catch (e) {
      console.error('groupstatus command error (outer):', e);
      return extra.reply('❌ *এরর:* ' + (e.message || e));
    }
  },
};

// ---- Helpers ----

async function downloadMedia(msg, type) {
  const mediaMsg = msg[`${type}Message`] || msg;
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function groupStatus(sock, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;

  const inside = await generateWAMessageContent(content, {
    upload: sock.waUploadToServer,
    backgroundColor: backgroundColor || PURPLE_COLOR,
  });

  const secret = crypto.randomBytes(32);

  const msg = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret: secret },
      groupStatusMessageV2: {
        message: {
         ...inside,
          messageContextInfo: { messageSecret: secret },
        },
      },
    },
    {}
  );

  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  return msg;
}

function toVN(buffer) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    const output = new PassThrough();
    const chunks = [];

    input.end(buffer);

    ffmpeg(input)
     .noVideo()
     .audioCodec('libopus')
     .format('ogg')
     .audioChannels(1)
     .audioFrequency(48000)
     .on('error', reject)
     .on('end', () => resolve(Buffer.concat(chunks)))
     .pipe(output);

    output.on('data', (c) => chunks.push(c));
  });
}

function generateWaveform(buffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    input.end(buffer);

    const chunks = [];

    ffmpeg(input)
     .audioChannels(1)
     .audioFrequency(16000)
     .format('s16le')
     .on('error', reject)
     .on('end', () => {
        const raw = Buffer.concat(chunks);
        const samples = raw.length / 2;
        const amps = [];

        for (let i = 0; i < samples; i++) {
          amps.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
        }

        const size = Math.floor(amps.length / bars);
        if (size === 0) return resolve(undefined);

        const avg = Array.from({ length: bars }, (_, i) =>
          amps
           .slice(i * size, (i + 1) * size)
           .reduce((a, b) => a + b, 0) / size
        );

        const max = Math.max(...avg);
        if (max === 0) return resolve(undefined);

        resolve(
          Buffer.from(
            avg.map((v) => Math.floor((v / max) * 100))
          ).toString('base64')
        );
      })
     .pipe()
     .on('data', (c) => chunks.push(c));
  });
}