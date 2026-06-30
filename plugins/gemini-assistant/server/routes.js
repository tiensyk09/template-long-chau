import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, site } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Thiếu tham số message.' });
    }
    if (!site) {
      return res.status(400).json({ error: 'Thiếu tham số site.' });
    }

    // Đọc db.json từ thư mục gốc của central manager
    const dbPath = path.join(process.cwd(), 'db.json');
    const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));

    const installed = (db.installedPlugins || {})[site] || [];
    const pluginRecord = installed.find(p => p.id === 'gemini-assistant');
    if (!pluginRecord) {
      return res.status(404).json({ error: `Plugin chưa được cài đặt trên site ${site}.` });
    }

    const apiKey = pluginRecord.config?.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Chưa cấu hình GEMINI_API_KEY cho site này.' });
    }

    // Gọi API Gemini 2.5 Flash chính thức từ Google
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Lỗi gọi API Gemini.' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được câu trả lời từ AI.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
