CREATE TABLE IF NOT EXISTS flight_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    altitude INTEGER,
    speed INTEGER,
    heading INTEGER,
    vertical_speed INTEGER,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_positions_flight_id ON flight_positions(flight_id);
CREATE INDEX IF NOT EXISTS idx_flight_positions_timestamp ON flight_positions(timestamp);
