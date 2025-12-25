// producer/producer.cjs
const pkg = require('@confluentinc/kafka-javascript');
const { Kafka } = pkg.KafkaJS;

const kafka = new Kafka({
  kafkaJS: {
    clientId: 'pune-rider-producer',
    brokers: ['localhost:9092'],
  },
});

const producer = kafka.producer({
  kafkaJS: { allowAutoTopicCreation: true },
});

const TOPIC = 'rider-location';

// Full Swargate → Hinjewadi Phase 3 route
const PUNE_ROUTE = [
  [18.5018, 73.863],
  [18.507, 73.861],
  [18.5105, 73.859],
  [18.516, 73.856],
  [18.52, 73.853],
  [18.528, 73.849],
  [18.534, 73.845],
  [18.54, 73.838],
  [18.55, 73.832],
  [18.558, 73.826],
  [18.565, 73.82],
  [18.57, 73.815],
  [18.575, 73.808],
  [18.58, 73.798],
  [18.585, 73.788],
  [18.59, 73.78],
  [18.595, 73.775],
  [18.6, 73.77],
  [18.605, 73.765],
  [18.61, 73.76],
  [18.615, 73.755],
  [18.619, 73.75],
  [18.622, 73.745],
  [18.625, 73.74],
  [18.628, 73.735],
  [18.63, 73.73],
  [18.632, 73.725],
  [18.634, 73.72],
  [18.636, 73.715],
  [18.638, 73.71],
  [18.64, 73.705],
  [18.642, 73.7],
  [18.644, 73.695],
  [18.646, 73.69],
  [18.648, 73.685],
  [18.65, 73.68],
  [18.652, 73.675],
  [18.654, 73.67],
  [18.656, 73.665],
  [18.658, 73.66],
  [18.66, 73.655],
  [18.662, 73.65],
  [18.664, 73.645],
  [18.666, 73.64],
  [18.668, 73.635],
  [18.67, 73.63],
  [18.672, 73.625],
  [18.674, 73.62],
  [18.676, 73.615],
  [18.678, 73.61],
  [18.68, 73.605],
  [18.682, 73.6],
  [18.684, 73.595],
  [18.686, 73.59],
  [18.688, 73.585],
  [18.69, 73.58],
  [18.692, 73.575],
  [18.694, 73.57],
  [18.696, 73.565],
  [18.698, 73.56],
  [18.7, 73.555],
  [18.702, 73.55],
  [18.704, 73.545], // Final destination
];

const orderId = 'PUNE-001';
const riderId = 'RIDER-42';

async function send(data) {
  await producer.send({
    topic: TOPIC,
    messages: [{ value: JSON.stringify(data) }],
  });
  console.log(
    `Sent [${(data.status || 'En-route').padEnd(13)}] → ${orderId} | ${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`
  );
}

async function runDelivery() {
  console.log('\nStarting ONE-TIME delivery simulation');
  console.log('Order:', orderId, '| Rider:', riderId);
  console.log('From: Swargate → To: Hinjewadi Phase 3\n');

  // 1. Order Placed
  await send({ orderId, riderId, lat: 18.5018, lng: 73.863, ts: Date.now(), status: 'Order Placed' });

  // 2. Picked Up (after 3 sec)
  await new Promise((r) => setTimeout(r, 3000));
  await send({ orderId, riderId, lat: 18.5018, lng: 73.863, ts: Date.now(), status: 'Picked Up' });

  // 3. Start moving
  await new Promise((r) => setTimeout(r, 3000)); // wait another 3 sec

  for (let i = 0; i < PUNE_ROUTE.length; i++) {
    const [lat, lng] = PUNE_ROUTE[i];
    const progress = i / PUNE_ROUTE.length;

    let status = 'En-route';
    if (progress < 0.3) status = 'Picked Up';
    else if (progress < 0.7) status = 'En-route';
    else status = 'Arriving Soon';

    await send({ orderId, riderId, lat, lng, ts: Date.now(), status });
    await new Promise((r) => setTimeout(r, 2000)); // 2 sec per point
  }

  // 4. Final Delivered
  await send({
    orderId,
    riderId,
    lat: 18.704,
    lng: 73.545,
    ts: Date.now(),
    status: 'Delivered',
  });

  console.log('\nDELIVERY COMPLETED SUCCESSFULLY!');
  console.log('Rider has delivered the order at Hinjewadi Phase 3');
  console.log('Producer will now stop. (No restart)\n');

  await producer.disconnect();
  process.exit(0); // cleanly exit
}

// Start
(async () => {
  await producer.connect();
  await runDelivery();
})();
