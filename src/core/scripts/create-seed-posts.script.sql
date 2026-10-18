-- * Сколько постов у каждого блога
SELECT blog_id, blog_name, COUNT(*) AS posts_count
FROM posts
-- WHERE blog_id = 'ae89e137-5df4-4e26-ac72-c1ec455975ad'
GROUP BY blog_id, blog_name;

-- * Скрипт создаёт 2m постов, распределённых по 2000 блогам, по 2000 на каждый.
INSERT INTO posts (title, short_description, content, blog_id, created_at)
SELECT
'seed post ' || i, -- title
'seed description ' || i, -- short_description
'seed content ' || i, -- content
CASE 
    WHEN i % 2000 = 0 THEN 'ae89e137-5df4-4e26-ac72-c1ec455975ad'::uuid -- blog_id
    ELSE md5((i % 2000)::text)::uuid
END,
now() - (i || ' seconds')::INTERVAL -- created_at
FROM generate_series(1, 2000000) as i;

ANALYSE posts;

EXPLAIN ANALYSE
SELECT * FROM posts
WHERE blog_id = '3a835d32-1575-5c43-5ef4-fe9965a3f2a0'
ORDER BY created_at DESC
LIMIT 10; -- ~ 80ms / ~ 0.1ms

SELECT count(*) as posts_count FROM posts; -- 2000015
EXPLAIN ANALYSE SELECT * FROM posts ORDER BY created_at DESC LIMIT 10; -- ~ 180ms, Seq Scan + Sort