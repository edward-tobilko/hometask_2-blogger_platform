INSERT INTO blogs (name, description, website_url, created_at)
SELECT md5(i::text), md5(i::text), 'https://seed.org', now() - i * INTERVAL '1 second'
FROM generate_series(1, 1000000) AS i;

-- * Анализ скорости записи с индексом и без:
EXPLAIN ANALYSE
INSERT INTO blogs (name, description, website_url, created_at)
SELECT md5(i::text), md5(i::text), 'https://seed.org', now() - i * INTERVAL '1 second'
FROM generate_series(1, 100000) AS i; -- with GIN index ~ 2105.0ms / without index ~ 744.8ms

ANALYSE blogs;

EXPLAIN ANALYSE
SELECT * FROM blogs WHERE name ILIKE '%9473976%' ORDER BY created_at DESC LIMIT 10; -- ~ 95ms (Parallel Seq Scan on blogs) / ~ 1.5ms (Bitmap Index Scan on IDX_blogs_name_trgm -> Bitmap Heap Scan on blogs);

SELECT count(*) AS blogs_total_count FROM blogs;