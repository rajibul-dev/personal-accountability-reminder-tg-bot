const wayToWisdomGroupID = "-1001506949302";

const rajiID = "1064047434";
const members = {
  raji: rajiID,
  orca: "1205841297",
  sailor: "8058693881",
  nilesh: "2096377389",
  anamika: "869217433",
};

const every11PM = "0 23 * * *"; // At 11:00 PM every day
const testEvery2Seconds = "*/2 * * * * *"; // Every 2 seconds for testing

import mod = require("grammy");
import cron = require("node-cron");

require("dotenv").config();
const { Bot } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN || "");

// --- Utility: dynamically fetch names ---
async function getMentions(bot: mod.Bot) {
  const mentionList = [];

  for (const [key, id] of Object.entries(members)) {
    try {
      const user = await bot.api.getChat(id); // Fetches Telegram profile
      const fullName = `${user.first_name}${
        user.last_name ? " " + user.last_name : ""
      }`;
      mentionList.push(`[${fullName}](tg://user?id=${id})`);
    } catch (err: any) {
      console.error(`Failed to fetch user info for ${id}`, err.message);
      mentionList.push(`[${capitalize(key)}](tg://user?id=${id})`);
    }
  }

  return mentionList.join(", ");
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Cron job: runs every day at 11 PM ---
cron.schedule(every11PM, async () => {
  console.log("Cron job triggered at 11 PM!");

  const mentions = await getMentions(bot);
  const message = `⏰ Hey ${mentions}\n\nIt's time to tell what you did today towards your goals! ✨\n\nWhat did you get done today? What are your goals for tomorrow?\nAnything else you must share?`;

  try {
    // Send to yourself or group
    await bot.api.sendMessage(wayToWisdomGroupID, message, {
      parse_mode: "Markdown",
    });
    console.log("✅ Reminder sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send message:", err);
  }
});

console.log("✅ Bot launched successfully and waiting for cron jobs...");
setInterval(() => {}, 60 * 60 * 1000); // 1 hour interval, keeps process alive quietly
