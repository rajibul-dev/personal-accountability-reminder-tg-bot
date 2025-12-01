import express = require("express");
import mod = require("grammy");
import dotenv = require("dotenv");
dotenv.config();

const { Bot } = require("grammy");

// --- IDs and Members ---
const wayToWisdomGroupID = "-1001506949302";

const members = {
  raji: "1064047434",
  orca: "1205841297",
  SV: "7259733372",
  nilesh: "2096377389",
  anamika: "869217433",
  sailor: "8058693881",
  manoj: "1139130113",
};

// --- Initialize Bot ---
const bot = new Bot(process.env.BOT_TOKEN || "");

// --- Utility: fetch member names dynamically ---
async function getMentions(bot: mod.Bot) {
  const mentionList: string[] = [];

  for (const [key, id] of Object.entries(members)) {
    try {
      const user = await bot.api.getChat(id);
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

// --- Send Reminder Function ---
async function sendReminder() {
  console.log("🚀 Triggering reminder...");

  const mentions = await getMentions(bot);
  const message = `⏰ Hey ${mentions}\n\nIt's time to tell what you did today towards your goals! ✨\n\nWhat did you get done today? What are your goals for tomorrow?\nAnything else you must share?`;

  try {
    await bot.api.sendMessage(wayToWisdomGroupID, message, {
      parse_mode: "Markdown",
    });
    console.log("✅ Reminder sent successfully!");
  } catch (err: any) {
    console.error("❌ Failed to send message:", err.message);
  }
}

// --- Express Web Server ---
const app = express();

app.get("/", (_, res) => {
  res.send("✅ Telegram Accountability Bot is running!");
});

// trigger endpoint (for cron-job.org)
app.get("/run", async (_, res) => {
  await sendReminder();
  res.send("✅ Reminder executed successfully!");
});

app.get("/test", async (_, res) => {
  try {
    await bot.api.sendMessage(
      members.raji,
      "This is a test message from the bot."
    );
    res.send("✅ Test message sent to Raji.");
  } catch (err: any) {
    console.error("❌ Failed to send test message:", err.message);
    res.status(500).send("❌ Failed to send test message.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(
    "✅ Bot launched successfully and waiting for external triggers..."
  );
});
