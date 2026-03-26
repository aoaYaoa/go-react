CREATE TABLE IF NOT EXISTS drones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    operator_id UUID REFERENCES operators(id),
    model TEXT,
    manufacturer TEXT,
    max_altitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_speed DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_range DOUBLE PRECISION NOT NULL DEFAULT 0,
    battery_life INTEGER NOT NULL DEFAULT 0,
    weight DOUBLE PRECISION NOT NULL DEFAULT 0,
    camera_model TEXT,
    status TEXT NOT NULL DEFAULT 'idle',
    last_latitude DOUBLE PRECISION,
    last_longitude DOUBLE PRECISION,
    last_altitude DOUBLE PRECISION,
    last_update_time TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drones_operator_id ON drones(operator_id);
