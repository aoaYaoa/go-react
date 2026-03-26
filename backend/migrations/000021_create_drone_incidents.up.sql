CREATE TABLE IF NOT EXISTS drone_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID NOT NULL REFERENCES drones(id),
    mission_id UUID REFERENCES drone_missions(id),
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    altitude DECIMAL(8,2),
    incident_time TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    reported_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drone_incidents_drone_id ON drone_incidents(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_incidents_mission_id ON drone_incidents(mission_id);
CREATE INDEX IF NOT EXISTS idx_drone_incidents_status ON drone_incidents(status);
