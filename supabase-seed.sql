-- Seed Categories
INSERT INTO public.categories (name) VALUES 
('Action'), ('Drama'), ('Comedy'), ('Documentary'), ('Adventure'), ('Thriller'), ('Sci-Fi'), ('Fantasy')
ON CONFLICT (name) DO NOTHING;

-- Seed Videos (Using deterministic UUIDs for safe re-runs or just default random ones)
-- We'll just let Supabase generate UUIDs, but to match the dummyData we need to insert the data.
-- Since title is not UNIQUE, we will truncate and re-insert or just insert if empty to be safe on re-runs.
-- We will insert only if the table is empty to maintain idempotency and prevent duplicates.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.videos LIMIT 1) THEN
        INSERT INTO public.videos (title, description, thumbnail, category, year, duration, type, video_url, published) VALUES
        ('The Last Horizon', 'A cinematic journey beyond the edge of the known world, exploring themes of isolation and discovery in the deep reaches of space.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', 'Sci-Fi', 2026, '2h 08m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Midnight City', 'In a neon-lit metropolis, a rogue detective uncovers a conspiracy that goes all the way to the top.', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200&auto=format&fit=crop', 'Thriller', 2025, '1h 55m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Beyond The Sea', 'An oceanographer makes a startling discovery in the Marianas Trench that challenges everything we know about evolution.', 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1200&auto=format&fit=crop', 'Documentary', 2024, '1h 40m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Hidden Truth', 'A journalist risks everything to expose a cover-up involving the highest levels of government.', 'https://images.unsplash.com/photo-1584041703666-51b73e51f845?q=80&w=1200&auto=format&fit=crop', 'Drama', 2023, '2h 15m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('The Runner', 'In a dystopian future, a courier must deliver a package across a desolate wasteland while being hunted.', 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=1200&auto=format&fit=crop', 'Action', 2025, '2h 00m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Afterlight', 'When the sun inexplicably fades, a group of survivors seeks out a legendary sanctuary.', 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=1200&auto=format&fit=crop', 'Sci-Fi', 2024, '1h 50m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Night Drive', 'A taxi driver''s life is turned upside down when he picks up a mysterious passenger on the run.', 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1200&auto=format&fit=crop', 'Thriller', 2023, '1h 45m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Wild Earth', 'Explore the untouched beauty of the planet''s most remote locations.', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop', 'Documentary', 2026, '1h 30m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('The Signal - Episode 1', 'An amateur astronomer intercepts a signal that shouldn''t exist, changing his life forever.', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1200&auto=format&fit=crop', 'Sci-Fi', 2025, '45m', 'episode', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Open Water', 'A deep sea diving expedition goes terribly wrong when the crew loses contact with the surface.', 'https://images.unsplash.com/photo-1488188840666-e2308741a62f?q=80&w=1200&auto=format&fit=crop', 'Thriller', 2022, '1h 35m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Zero Hour', 'A ticking clock, a hijacked train, and one man who can stop it all.', 'https://images.unsplash.com/photo-1541888001-0985c78912e5?q=80&w=1200&auto=format&fit=crop', 'Action', 2024, '2h 10m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Lost Kingdom', 'Archaeologists unearth a forgotten city in the Amazon, awakening an ancient curse.', 'https://images.unsplash.com/photo-1447015237013-0e80b2786dea?q=80&w=1200&auto=format&fit=crop', 'Adventure', 2023, '2h 05m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('The Signal - Episode 2', 'The government gets involved, and the origin of the signal is traced to an unexpected location.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', 'Sci-Fi', 2025, '48m', 'episode', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('The Signal - Episode 3', 'A decryption breakthrough reveals a message that threatens humanity''s place in the universe.', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop', 'Sci-Fi', 2025, '52m', 'episode', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Desert Winds', 'A tale of survival and revenge set against the harsh backdrop of the Sahara.', 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop', 'Drama', 2021, '2h 20m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Neon Nights', 'A visual journey through the bustling streets of Tokyo after dark.', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop', 'Documentary', 2026, '1h 15m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('The Illusionist', 'A street magician accidentally performs real magic, attracting the wrong kind of attention.', 'https://images.unsplash.com/photo-1502693895315-773df404c278?q=80&w=1200&auto=format&fit=crop', 'Fantasy', 2024, '1h 58m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Codebreaker', 'A biography of a genius mathematician who cracked the uncrackable code during WWII.', 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=1200&auto=format&fit=crop', 'Drama', 2023, '2h 12m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('Avalanche', 'A group of skiers must survive the elements after a massive avalanche traps them on the mountain.', 'https://images.unsplash.com/photo-1463130456064-07147e45dd77?q=80&w=1200&auto=format&fit=crop', 'Action', 2025, '1h 48m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true),
        ('The Laughing Man', 'A struggling comedian finds success when he starts telling the truth, no matter who it hurts.', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1200&auto=format&fit=crop', 'Comedy', 2022, '1h 35m', 'movie', 'https://www.w3schools.com/html/mov_bbb.mp4', true);
    END IF;
END $$;
