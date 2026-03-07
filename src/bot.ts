import express = require("express");
import mod = require("grammy");
import dotenv = require("dotenv");
import dateFns = require("date-fns");
dotenv.config();

const { Bot } = require("grammy");

// --- IDs and Members ---
const wayToWisdomGroupID = "-1001506949302";
const dedicatedAccountabilityGroupID = "-1003577560502";

const groups = [dedicatedAccountabilityGroupID];

const members = {
  raji: "1064047434",
  orca: "1205841297",
  orca2: "7566813106",
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

// --- Choose message dynamically ---
function chooseMessage(mentions: string) {
  const now = new Date();
  const defaultMessage = `⏰ Hey ${mentions}\n\nIt's time to tell what you did today towards your goals! ✨\n\nWhat did you get done today? What are your goals for tomorrow?\nAnything else you must share?`;

  if (isJanuaryFirst(now)) {
    const lastYear = Number(dateFns.format(now, "yyyy")) - 1;
    const currentYear = dateFns.format(now, "yyyy");
    return `🎉 Happy New Year ${currentYear}, ${mentions}!\n\nLet's reflect on the past year.\n\nWhat were your biggest wins last year? Were you able to achieve your new year's resolutions of ${lastYear}?\nHow do you feel about your progress?\n\nWhat are your goals for this year?\nAnything else you want to share?`;
  } else if (dateFns.isFirstDayOfMonth(now)) {
    return `📅 It's the first day of the month, ${mentions}!\n\nTime for a monthly reflection.\n\nWhat were your wins last month?\nWhat are your goals for this month?\nHow do you feel about your progress?\n\nAnything else you'd like to share?`;
  } else if (dateFns.isSunday(now)) {
    return `📅 End of the week, ${mentions}!\n\nTime for a quick weekly reflection.\n\nWhat did you get done today?\nHow do you feel about your progress towards your goals this week?\n\nAnything else you want to share?`;
  } else {
    return defaultMessage;
  }
}
function isJanuaryFirst(date: Date) {
  // JavaScript months are zero-based (0 = January)
  const isMonthJanuary = dateFns.getMonth(date) === 0;
  // Days of the month are one-based (1 = 1st)
  const isDayFirst = dateFns.getDate(date) === 1;

  return isMonthJanuary && isDayFirst;
}

// --- Send Reminder Function ---
async function sendReminder(groupId: string) {
  console.log("🚀 Triggering reminder...");

  const mentions = await getMentions(bot);
  const message = chooseMessage(mentions);

  try {
    await bot.api.sendMessage(groupId, message, {
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
  try {
    await Promise.all(groups.map((groupId) => sendReminder(groupId)));
    res.send("✅ Reminder executed successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to execute reminders");
  }
});

app.get("/test", async (_, res) => {
  try {
    await bot.api.sendMessage(
      members.raji,
      "This is a test message from the bot.",
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
    "✅ Bot launched successfully and waiting for external triggers...",
  );
});
