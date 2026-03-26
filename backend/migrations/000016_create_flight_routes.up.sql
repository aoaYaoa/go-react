CREATE TABLE IF NOT EXISTS flight_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    waypoint_name VARCHAR(50),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    altitude INTEGER,
    sequence INTEGER NOT NULL,
    estimated_time TIMESTAMPTZ,
    actual_time TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_flight_routes_flight_id ON flight_routes(flight_id);
