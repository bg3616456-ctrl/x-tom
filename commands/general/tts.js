/**
 * TTS - Text to Speech Command
 */

const APIs = require('../../utils/api');

module.exports = {
  name: 'tts',
  aliases: ['speak', 'say'],
  category: 'general',
  description: 'লেখাকে ভয়েসে কনভার্ট করুন',
  usage: '.tts <text>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = args.join(' ');

      if (!text) {
        return extra.reply('লেখা দিন ভয়েস বানানোর জন্য।\nউদাহরণ: .tts কেমন আছেন আপনি');
      }

      const audioUrl = await APIs.textToSpeech(text);

      // Download audio as buffer
      const axios = require('axios');
      const audioResponse = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const audioBuffer = Buffer.from(audioResponse.data);

      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mp3',
        ptt: true // Play as voice message
      }, { quoted: msg });

    } catch (error) {
      console.error('TTS command error:', error);
      await extra.reply(`❌ ভয়েস বানাতে সমস্যা: ${error.message}`);
    }
  }
};