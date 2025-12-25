# Real-Time Rider Tracking System – Technical Architecture

```ascii
                                                ┌─────────────────────────────────────┐
                                                │ KAFKA (Central Message Backbone)    │
                                                │     Topic: rider-location           │
                                                └─────────────────────────────────────┘
                                                    ┌──────────────┬────────────────┐
                                                    │ Partition 0  │ Partition 1    │
                                                    │ (Replicated across brokers)   │
                                                    └──────────────┬────────────────┘
                                                                   ▼
┌─────────────────┐                         ┌─────────────────────────────────────┐
│    Producer     │  Every 2 sec            │           Kafka Cluster             │
│   (Node.js)     │  publishes JSON         │  High availability, fault-tolerant  │
│ Simulates rider ├────────────────────────►│  Retention: 7 days (configurable)   │
│   journey       │ {orderId, lat, lng,     └─────────────────────┬───────────────┘
└───────┬─────────┘  status, ts}                                  ▲
        │                                                         │
        ▼                                                         │
┌─────────────────┐   JSON messages                               │
│   Consumer      │◄──────────────────────────────────────────────┘
│   (Node.js)     │   Real-time consume from Kafka
│                 ├──────────────────────────────┐
│ 1. Save to      │                              │
│    MySQL        │                              │
│ 2. Broadcast    │                              ▼
└───────┬─────────┘                      ┌──────────────┐
        │                                │ WebSocket    │
        │                                │ Server       │
        │                                │ ws://:4000   │
        ▼                                └──────┬───────┘
┌─────────────────┐                             │
│   Browser       │◄───── WebSocket ────────────┘
│ (index.html)    │       Live updates
│ Live Map +      │       All clients receive same data instantly
│ Status Bar      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   MySQL         │
│   Database      │
│ Table:          │
│ rider_movements │
│ + partitions    │
└─────────────────┘

                Data Lifecycle Management
                ───────────────────────────────
                Old data purged monthly via partitions:
                ALTER TABLE rider_movements
                DROP PARTITION p20251001;
                (Instant delete – zero table lock)
```
