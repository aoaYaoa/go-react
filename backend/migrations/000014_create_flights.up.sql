CREATE TABLE IF NOT EXISTS flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number TEXT NOT NULL,
    airline_id UUID REFERENCES airlines(id),
    aircraft_id UUID REFERENCES aircrafts(id),
    departure_id UUID REFERENCES airports(id),
    arrival_id UUID REFERENCES airports(id),
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    gate TEXT,
    terminal TEXT,
    altitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    speed DOUBLE PRECISION NOT NULL DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_airline_id ON flights(airline_id);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft_id ON flights(aircraft_id);
