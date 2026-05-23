import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // API routes FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured in Settings > Secrets." });
      }
      
      const chat = ai.chats.create({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: `You are the Xchange Student Assistant, a helpful AI guide for the Xchange EdTech platform.

Platform Overview:
- Xchange is a community-driven skill-swap platform.
- Users trade skills (Knowledge Economy) instead of money.
- Currency: Skill Tokens (XT). 30 XT provided for new users.
- Mechanics: Earn 10 XT for teaching, Spend 10 XT for learning.
- Match Engine: Pair users with compatible "Can Teach" and "Want to Learn" skills.
- Learning Space: Private room with video (Jitsi), chat, and PDF note storage.
- Profile: Students display their major, bio, and skill sets.
- Wallet: Tracks transaction history of skill trades.

Guide the user on how to:
1. Find a match using the Match Engine.
2. Send a swap request with a custom message.
3. Check notifications in the top navbar to accept incoming requests.
4. Join the Learning Space once a match is confirmed.
5. Manage their Skill Tokens in the Wallet.

Keep responses concise, friendly, and student-focused. Use markdown for lists.`,
        },
        history: (history || []).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        }))
      });

      const response = await chat.sendMessage({ message });
      res.json({ response: response.text });
    } catch (error: any) {
      console.error("[API] Chat Error:", error);
      res.status(500).json({ error: "Failed to get AI response", details: error.message });
    }
  });

  app.post("/api/notify-payment", async (req, res) => {
    try {
      const { username, paymentType, confirmation, customChatId } = req.body;
      console.log(`[API] Received notification request for ${username} (${paymentType})`);
      
      const token = process.env.TELEGRAM_BOT_API_KEY;
      const chatId = customChatId || process.env.TELEGRAM_CHAT_ID; 

      if (!token || token === "MY_TELEGRAM_BOT_API_KEY") {
          console.warn("[API] Missing TELEGRAM_BOT_API_KEY");
          return res.status(500).json({ error: "Telegram Bot API key not configured in environment variables." });
      }

      if (!chatId || chatId === "MY_TELEGRAM_CHAT_ID") {
          console.warn("[API] Missing TELEGRAM_CHAT_ID");
          return res.status(500).json({ error: "Telegram Chat ID not configured. Please set TELEGRAM_CHAT_ID." });
      }

      // Format: "#username ,#payment type and need , confirmation"
      const message = `#${username}, #${paymentType} and need, confirmation: ${confirmation}`;
      
      console.log(`[API] Sending Telegram notification to chat ${chatId}...`);
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            chat_id: chatId, 
            text: message,
            disable_web_page_preview: true
          })
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
          data = await response.json();
      } else {
          const text = await response.text();
          console.error("[API] Expected JSON from Telegram but got:", text.slice(0, 100));
          return res.status(500).json({ error: "Telegram API returned unexpected non-JSON response", details: text.slice(0, 200) });
      }
      
      if (!response.ok) {
          console.error("[API] Telegram API Error:", JSON.stringify(data));
          return res.status(response.status).json({ 
            error: "Telegram API error", 
            details: data,
            message: data.description || "Notification failed. Check if Chat ID is valid and the bot is started." 
          });
      }

      console.log("[API] Telegram notification sent successfully");
      res.json(data);
    } catch (e: any) {
        console.error("[API] Global handler error:", e);
        res.status(500).json({ error: "Internal server error", message: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Xchange] App running at http://localhost:${PORT}`);
  });
}

startServer();
