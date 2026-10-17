
-- * Скрипт создаёт 1m  комментариев, распределённых по 1000 постам, по 1000 на каждый.
INSERT INTO comments (post_id, content, created_at, user_id, user_login)
SELECT
CASE 
    WHEN i % 1000 = 0 THEN '184293d6-d421-41dd-99ef-04b1c83181ba'::uuid -- post_id = ~1000 комментариев
    ELSE md5((i % 1000)::text)::uuid -- ещё 999 «постов» по ~1000
END,
'seed comment ' || i, -- content
now() - (i || ' seconds')::INTERVAL, -- created_at
gen_random_uuid(), -- user_id
'seed_user' -- user_login
FROM generate_series(1, 1000000) as i;

-- * Request speed analyse
ANALYSE comments; -- count = 2m, обновить статистику планировщика после сида

EXPLAIN ANALYSE SELECT * FROM comments
WHERE post_id = '184293d6-d421-41dd-99ef-04b1c83181ba' AND is_banned = false
ORDER BY created_at DESC
LIMIT 10; -- average request speed without post_id_index = 64ms / with post_id_index = 6ms

-- * Сколько комментариев у каждого поста
SELECT post_id, COUNT(*) AS comments_count
FROM comments
GROUP BY post_id
ORDER BY comments_count DESC
LIMIT 10;

-- * Выборка
SELECT * FROM comments WHERE user_login = 'sam';
SELECT COUNT(*) AS comments_count FROM comments; -- count comments = 2000007, speed = 70ms