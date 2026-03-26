CREATE TABLE IF NOT EXISTS drone_flight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID NOT NULL REFERENCES drones(id),
    mission_id UUID REFERENCES drone_missions(id),
    flight_start TIMESTAMPTZ NOT NULL,
    flight_end TIMESTAMPTZ,
    duration_seconds INTEGER,
    distance_meters DECIMAL(10,2),
    max_altitude DECIMAL(8,2),
    max_speed DECIMAL(6,2),
    start_battery INTEGER,
    end_battery INTEGER,
    battery_consumed INTEGER,
    average_speed INTEGER,
    events JSONB,
    warnings JSONB,
    errors JSONB,
    flight_quality_score INTEGER,
    pilot_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drone_flight_logs_drone_id ON drone_flight_logs(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_flight_logs_mission_id ON drone_flight_logs(mission_id);
