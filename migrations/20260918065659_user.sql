CREATE TABLE users (
    sub TEXT NOT NULL,
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    locale TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);