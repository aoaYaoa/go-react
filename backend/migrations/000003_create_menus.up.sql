CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES menus(id),
    name TEXT NOT NULL,
    path TEXT,
    icon TEXT,
    component TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'menu',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
