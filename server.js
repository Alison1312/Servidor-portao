// Servir arquivos estáticos
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

let lastStatus = "desconhecido";
let espSocket = null;

// HTTP API
app.get('/', (req, res) => res.send('Servidor do Portão ONLINE'));
app.get('/status', (req, res) => res.json({ status: lastStatus }));
app.post('/comando', (req, res) => {
  const { comando } = req.body;
  if (espSocket && espSocket.readyState === WebSocket.OPEN) {
    espSocket.send(comando);
    res.json({ ok: true, enviado: comando });
  } else {
    res.status(500).json({ ok: false, erro: 'ESP não conectado' });
  }
});

// WebSocket para ESP
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('ESP conectado via WebSocket');
  espSocket = ws;

  ws.on('message', (msg) => {
    console.log('Status do portão:', msg.toString());
    lastStatus = msg.toString();
  });

  ws.on('close', () => {
    console.log('ESP desconectado');
    espSocket = null;
  });
});

server.listen(port, () => {
  console.log(`Servidor escutando em http://localhost:${port}`);
});
