CREATE TABLE IF NOT EXISTS airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_en TEXT,
    country TEXT,
    logo TEXT,
    website TEXT,
    callsign TEXT,
    type TEXT NOT NULL DEFAULT 'passenger',
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
