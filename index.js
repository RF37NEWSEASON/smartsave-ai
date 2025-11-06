// SmartSave.AI - Simple Telegram bot using OpenAI API
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.get("/", (req, res) => res.send("SmartSave.AI is running ✅"));

app.post("/telegram-webhook", async (req, res) => {
  const body = req.body;

  if (!body.message || !body.message.text) return res.sendStatus(200);

  const chatId = body.message.chat.id;
  const text = body.message.text;

  const prompt = `User wrote: "${text}". Return JSON with "type" (expense, income or other), "category" (like food, transport, etc.) and "amount" if possible.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || "I couldn’t process that.";

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `SmartSave.AI result:\n${reply}`,
    }),
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log("✅ SmartSave.AI server running on port 3000"));
