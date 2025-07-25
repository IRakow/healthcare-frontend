alter table employers
add column logo_url text,
add column favicon_url text,
add column primary_color text default '#3B82F6',
add column voice_profile text default 'Rachel',
add column tagline text;