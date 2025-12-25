// websocket/broadcaster.cjs
// This file does NOT start the server, it only exports the function

let wss = null;

function setServer(server) {
  wss = server;
}

function broadcast(data) {
  if (!wss) return;
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(json);
    }
  });
}

module.exports = { broadcast, setServer };
