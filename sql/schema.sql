-- Create DB
CREATE DATABASE IF NOT EXISTS tracking;
USE tracking;
-- rider_movements: partitioned by day using UNIX timestamp column (seconds)
CREATE TABLE IF NOT EXISTS rider_movements (
id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
orderId VARCHAR(64) NOT NULL,
riderId VARCHAR(64) NOT NULL,
lat DECIMAL(10,6) NOT NULL,
lng DECIMAL(10,6) NOT NULL,
ts BIGINT NOT NULL,
INDEX idx_order_ts (orderId, ts)
) ENGINE=InnoDB;
-- Note: MySQL's native RANGE partitioning works with integer expressions.
-- We'll partition by TO_DAYS(FROM_UNIXTIME(ts)) via ALTER TABLE later.
-- Example adding partitions (do this periodically via script). Replace dates.
-- ALTER TABLE rider_movements
-- PARTITION BY RANGE (TO_DAYS(FROM_UNIXTIME(ts))) (
-- PARTITION p20251101 VALUES LESS THAN (TO_DAYS('2025-11-02')),
-- PARTITION p20251102 VALUES LESS THAN (TO_DAYS('2025-11-03'))
-- );
