import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';

// Variables to hold state globally in the server process
let waSocket: any = null;
let currentQr: string | null = null;
let isConnected = false;
let isConnecting = false;

async function clearAuthDir() {
  try {
    if (fs.existsSync('baileys_auth_info')) {
      fs.rmSync('baileys_auth_info', { recursive: true, force: true });
    }
  } catch (err) {
    console.error('Failed to clear auth dir', err);
  }
}

async function connectToWhatsApp() {
  if (isConnected || isConnecting) return;
  isConnecting = true;
  currentQr = null;
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      currentQr = await QRCode.toDataURL(qr);
    }
    if (connection === 'close') {
      isConnected = false;
      isConnecting = false;
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        currentQr = null;
        waSocket = null;
        await clearAuthDir();
      }
    } else if (connection === 'open') {
      isConnected = true;
      isConnecting = false;
      currentQr = null;
    }
  });

  sock.ev.on('creds.update', saveCreds);
  waSocket = sock;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '50mb' }));

  app.get('/api/wa/status', (req, res) => {
    res.json({ connected: isConnected, qr: currentQr, connecting: isConnecting });
  });

  app.post('/api/wa/connect', async (req, res) => {
    if (!waSocket || (!isConnected && !isConnecting)) {
      await connectToWhatsApp();
    }
    res.json({ success: true });
  });

  app.post('/api/wa/logout', async (req, res) => {
    if (waSocket) {
      try {
        await waSocket.logout();
      } catch (err) {
        console.error('Logout error', err);
      }
      waSocket = null;
      isConnected = false;
      isConnecting = false;
      currentQr = null;
      await clearAuthDir();
    }
    res.json({ success: true });
  });

  // format for whatsapp
  const formatPhone = (phone: string) => {
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '62' + p.substring(1);
    return `${p}@s.whatsapp.net`;
  };

  app.post('/api/wa/send', async (req, res) => {
    if (!isConnected || !waSocket) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }
    
    try {
      const { number, message, pdfBase64, filename } = req.body;
      const targetJid = formatPhone(number);
      
      const buffer = Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64');
      
      const msg = await waSocket.sendMessage(targetJid, {
        document: buffer,
        mimetype: 'application/pdf',
        fileName: filename,
        caption: message
      });
      
      res.json({ success: true, messageId: msg?.key?.id });
    } catch (err: any) {
      console.error('WA Send Error:', err);
      res.status(500).json({ error: err.message });
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
