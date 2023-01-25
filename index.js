const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const telegram = require("./api/telegram");
app.use("/api/telegram", telegram);

require("dotenv").config();
const token = process.env.tt;
const bot = new TelegramBot(token);

const app = express();

let gameOn = false;
let currentWord = null;
let words = ["a", "b", "c", "d", "e"];
let lastWinnerId;
const opts = {
	//OPTION BUTTONS
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: "kelimeyi göster",
					callback_data: "show_word",
				},
				{
					text: "pas geç",
					callback_data: "pass",
				},
			],
			[
				{
					text: "Oyunu bitir",
					callback_data: "end_game",
				},
			],
		],
	},
};

// SETUP THE WEBHOOK
app.post("https://telegrambot-rose.vercel.app/api/telegram", (req, res) => {
	bot.processUpdate(req.body);
	res.sendStatus(200);
});

bot.setWebHook("https://telegrambot-rose.vercel.app/api/telegram", {});

bot.onText(/\/start@game_tabu_bot/, (msg) => {
	// Send message with inline keyboard
	lastWinnerId = msg.from.id;
	const chatId = msg.chat.id;
	gameOn = true;
	currentWord = words[Math.floor(Math.random() * words.length)];
	bot.sendMessage(chatId, "Kelime oyunu başladı!", opts);
});

bot.on("callback_query", (callback) => {
	const callbackData = callback.data;
	const user = callback.from;
	const chatId = callback.message.chat.id; // Add this line to define chatId
	if (callbackData === "show_word") {
		if (user.id === lastWinnerId) {
			bot.answerCallbackQuery(callback.id, {
				text: "Kelime: " + currentWord,
				show_alert: true,
			});
		} else {
			bot.answerCallbackQuery(callback.id, {
				text: "Senin sıran değil",
				show_alert: true,
			});
		}
	}
	if (callbackData === "pass") {
		if (user.id === lastWinnerId) {
			bot.sendMessage(chatId, "Kelime pas geçildi");
			currentWord = words[Math.floor(Math.random() * words.length)];
			bot.answerCallbackQuery(callback.id, {
				text: "Yeni kelime: " + currentWord,
				show_alert: true,
			});
		} else {
			bot.answerCallbackQuery(callback.id, {
				text: "Yalnızca sunan kişi pas geçebilir!",
				show_alert: true,
			});
		}
	}
	if (callbackData === "end_game") {
		if (user.id === lastWinnerId) {
			gameOn = false;
			bot.sendMessage(chatId, "Kelime oyunu durduruldu.");
			bot.answerCallbackQuery(callback.id, {
				text: "Oyun sonlandırıldı",
				show_alert: true,
			});
		}
	}
});

bot.on("message", (msg) => {
	if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
		const chatId = msg.chat.id;
		if (gameOn) {
			if (
				msg.text.toLowerCase().includes(currentWord.toLowerCase()) &&
				msg.from.id != lastWinnerId
			) {
				let userName;
				if (msg.from.username) {
					userName = "@" + msg.from.username;
				} else {
					userName = msg.from.first_name;
				}

				bot.sendMessage(
					chatId,
					`${userName}  kelimeyi buldu!\nKelime ${currentWord} idi.\nSıra sende anlat bakalım!`,
					opts
				);
				currentWord = words[Math.floor(Math.random() * words.length)];
				lastWinnerId = msg.from.id;
			}
		}
	}
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server is running");
});
