import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/notify-payment", async (req, res) => {
    const { username, paymentType, confirmation } = req.body;
    // Fallback to the key provided in the chat if env var is missing
    const token = process.env.TELEGRAM_BOT_API_KEY || "8944918252:AAEQ4w7RIqvskanYEyenT3c-np9PABsWOco";
    // Target chat ID
    const chatId = "8921392544"; 

    if (!token || token === "MY_TELEGRAM_BOT_API_KEY") {
        return res.status(500).json({ error: "Telegram Bot API key not configured" });
    }

    // Format: "#username ,#payment type and need , confirmation"
    const message = `#${username}, #${paymentType} and need, confirmation: ${confirmation}`;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: message,
              disable_web_page_preview: true
            })
        });
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Telegram API Error:", data);
            return res.status(400).json({ 
              error: "Telegram API error", 
              details: data,
              message: "The chat ID might be invalid or the bot hasn't been started by this user." 
            });
        }
        res.json(data);
    } catch (e) {
        console.error("Fetch error:", e);
        res.status(500).json({ error: "Server error sending message" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
