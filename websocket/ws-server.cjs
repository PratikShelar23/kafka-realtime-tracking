// websocket/ws-server.cjs
const { WebSocketServer } = require('ws');
const { setServer } = require('./broadcaster.cjs');

const PORT = 4000;

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to tracking server' }));
});

// Give the broadcaster access to the server instance
setServer(wss);

module.exports = {}; // we don't export anything from here anymore
