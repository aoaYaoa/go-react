CREATE TABLE IF NOT EXISTS no_fly_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'permanent',
    geometry TEXT,
    min_altitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_altitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    reason TEXT,
    authority TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
