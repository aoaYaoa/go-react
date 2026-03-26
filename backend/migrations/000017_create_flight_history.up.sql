CREATE TABLE IF NOT EXISTS flight_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number VARCHAR(20) NOT NULL,
    flight_date DATE NOT NULL,
    aircraft_id UUID REFERENCES aircrafts(id),
    departure_airport VARCHAR(4) NOT NULL,
    arrival_airport VARCHAR(4) NOT NULL,
    scheduled_departure TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    scheduled_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    delay_minutes INTEGER,
    status VARCHAR(20),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_history_flight_number ON flight_history(flight_number);
CREATE INDEX IF NOT EXISTS idx_flight_history_flight_date ON flight_history(flight_date);
CREATE INDEX IF NOT EXISTS idx_flight_history_aircraft_id ON flight_history(aircraft_id);
