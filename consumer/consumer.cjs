const pkg = require('@confluentinc/kafka-javascript');
const { Kafka } = pkg.KafkaJS;
const mysql = require('mysql2/promise');

// consumer/consumer.cjs
const { broadcast } = require('../websocket/broadcaster.cjs'); // ← now safe!

// ... rest of your consumer code stays exactly the same
const kafka = new Kafka({
  kafkaJS: {
    clientId: 'tracking-consumer',
    brokers: ['localhost:9092'],
  },
});

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tracking',
});

const TOPIC = 'rider-location';

async function start() {
  const consumer = kafka.consumer({
    kafkaJS: {
      groupId: 'tracking-group',
    },
  });

  console.log('Connecting Kafka consumer...');
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC });

  console.log('Consumer connected. Waiting for messages...');

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value.toString();
      console.log('Received:', raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error('Invalid JSON:', raw);
        return;
      }

      // 1. Save to DB
      try {
        await db.query(
          `INSERT INTO rider_movements (orderId, riderId, lat, lng, ts, status)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.orderId,
            data.riderId,
            data.lat,
            data.lng,
            data.ts,
            data.status || 'En-route', // ← saves the status!
          ]
        );
      } catch (dbErr) {
        console.error('DB insert failed:', dbErr);
      }

      // 2. Broadcast to all WebSocket clients (this is the key part!)
      broadcast({
        type: 'location',
        data,
      });
      console.log(`Broadcasted → ${data.orderId} | ${data.status || 'En-route'}`);
    },
  });
}

start().catch((err) => {
  console.error('Consumer crashed:', err);
  process.exit(1);
});
