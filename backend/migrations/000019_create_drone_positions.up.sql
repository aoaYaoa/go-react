CREATE TABLE IF NOT EXISTS drone_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID NOT NULL REFERENCES drones(id),
    mission_id UUID REFERENCES drone_missions(id),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    altitude DECIMAL(8,2),
    speed DECIMAL(6,2),
    heading DECIMAL(5,2),
    battery_level INTEGER,
    signal_strength INTEGER,
    gps_accuracy DECIMAL(5,2),
    flight_mode VARCHAR(20),
    temperature DECIMAL(5,2),
    humidity INTEGER,
    air_pressure DECIMAL(8,2),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drone_positions_drone_id ON drone_positions(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_positions_timestamp ON drone_positions(timestamp);
