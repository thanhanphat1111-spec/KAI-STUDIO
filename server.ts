import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("contracts.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    contract_value REAL NOT NULL,
    contract_link TEXT NOT NULL,
    otp TEXT,
    status TEXT DEFAULT 'Chờ xác nhận',
    confirmation_time TEXT,
    signature_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/contracts", (req, res) => {
    try {
      const contracts = db.prepare("SELECT * FROM contracts ORDER BY created_at DESC").all();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts", (req, res) => {
    const { customer_name, phone_number, contract_type, contract_value, contract_link } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const info = db.prepare(`
        INSERT INTO contracts (customer_name, phone_number, contract_type, contract_value, contract_link, otp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(customer_name, phone_number, contract_type, contract_value, contract_link, otp);
      
      const contractId = info.lastInsertRowid.toString();
      
      // Use a more robust way to get the base URL
      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const confirmationLink = `${baseUrl.replace(/\/$/, '')}/confirm/${contractId}`;
      
      console.log(`[SMS Simulation] To: ${phone_number}, Message: Ma OTP cua ban la ${otp}. Vui long xac nhan tai: ${confirmationLink}`);
      
      res.json({ 
        id: contractId, 
        otp, 
        confirmationLink,
        message: "Hợp đồng đã được tạo và mã OTP đã được gửi (giả lập)." 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create contract" });
    }
  });

  app.get("/api/contracts/:id", (req, res) => {
    try {
      const contract = db.prepare("SELECT * FROM contracts WHERE id = ?").get(req.params.id);
      if (!contract) return res.status(404).json({ error: "Contract not found" });
      
      // Don't send OTP to client in a real app, but for this demo we might need to check it
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts/:id/verify", (req, res) => {
    const { otp, signature_image } = req.body;
    const { id } = req.params;
    
    try {
      const contract = db.prepare("SELECT otp FROM contracts WHERE id = ?").get(id);
      
      if (!contract) {
        return res.status(404).json({ error: "Hợp đồng không tồn tại" });
      }
      
      if (contract.otp !== otp) {
        return res.status(400).json({ error: "Mã OTP không chính xác" });
      }
      
      const now = new Date().toISOString();
      db.prepare(`
        UPDATE contracts 
        SET status = 'Đã xác nhận', 
            confirmation_time = ?, 
            signature_image = ? 
        WHERE id = ?
      `).run(now, signature_image, id);
      
      res.json({ success: true, message: "Xác nhận hợp đồng thành công!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Xác nhận thất bại" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Catch-all route for SPA in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
