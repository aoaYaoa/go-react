CREATE TABLE IF NOT EXISTS aircraft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration TEXT NOT NULL UNIQUE,
    airline_id UUID REFERENCES airlines(id),
    model TEXT,
    manufacturer TEXT,
    serial_number TEXT,
    year_built INTEGER,
    capacity INTEGER,
    max_range INTEGER,
    cruise_speed INTEGER,
    engine_type TEXT,
    engine_count INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aircraft_airline_id ON aircraft(airline_id);
