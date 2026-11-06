-- * Сколько постов у каждого блога
SELECT p.blog_id, b.name, COUNT(*) AS posts_count
FROM posts p
JOIN blogs b ON b.id = p.blog_id
GROUP BY p.blog_id, b.name;

-- * Скрипт создаёт 2m постов: 2000 seed-блогов × 1000 постов на каждый.
INSERT INTO posts (title, short_description, content, blog_id, created_at)
SELECT
    'seed-post ' || i, -- title
    'seed-description ' || i, -- short_description
    'seed-content ' || i, -- content
    b.id, -- blog_id (настоящий блог)
    now() - ((b.rn * 1000 + i) || ' seconds')::INTERVAL -- created_at (уникальное время у каждого поста)
FROM (
    SELECT id, ROW_NUMBER() OVER() AS rn
    FROM blogs WHERE website_url = 'https://seed.org' LIMIT 2000
) b -- подзапрос работает как generate_series, но вместо голых чисел даёт настоящие блоги с номером rn;
CROSS JOIN generate_series(1, 1000) AS i; -- CROSS JOIN соединяет каждую строку b с каждым числом i: 2000 × 1000 = 2 000 000 строк. Это тот же generate_series, только теперь вложенный в каждый блог;

ANALYSE posts;

EXPLAIN ANALYSE
SELECT * FROM posts
WHERE blog_id = '815a830e-6226-4b50-a0dc-833552a29640'
ORDER BY created_at DESC
LIMIT 10; -- ~ 80ms / ~ 0.1ms

SELECT count(*) as posts_count FROM posts; -- 2000010
EXPLAIN ANALYSE SELECT * FROM posts ORDER BY created_at DESC LIMIT 10; -- ~ 180ms, Seq Scan + Sort / ~ 0.07ms, Index Scan Backward, no Sort;
