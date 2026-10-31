-- * Show how many seed-users we have (must be 100 000 or more)
SELECT count(*) FROM user_accounts WHERE login LIKE 'seed-login%';

-- * Create 100 000 likes for post
INSERT INTO post_likes (post_id, status, user_id, added_at)
SELECT 
'd5249d9a-c644-42e9-9a9f-dd972713d7be'::uuid,                   -- один и тот же пост для всех 100k строк;
CASE
    WHEN ua.rn % 5 = 0 THEN 'Dislike'::post_likes_status_enum   -- каждый 5-й — Dislike (20%) / тип post_likes_status_enum смотреть в Baseline.ts:32 миграцию;
    ELSE 'Like'::post_likes_status_enum                         -- остальные — Like (80%)
END,
ua.id,                                                          -- настоящий id юзера -> JOIN в newestLikes найдёт его;
now() - (ua.rn || ' seconds')::INTERVAL                         -- у каждого лайка своё время: 1s, 2s, 3s... назад;
FROM (
    SELECT id, ROW_NUMBER() OVER() AS rn                        -- нумеруем строки 1..100000 (нумерует как есть, порядок неважен);
    FROM user_accounts WHERE login LIKE 'seed-login%' LIMIT 100000
) ua; -- подзапрос работает как generate_series, но вместо голых чисел даёт настоящих юзеров с номером rn;

ANALYSE post_likes; -- обновить статистику, иначе планировщик будет считать, что таблица почти пустая;

-- * Check likes ~ 80 000 / dislikes ~ 20 000
SELECT status, count(*) FROM post_likes WHERE post_id = 'd5249d9a-c644-42e9-9a9f-dd972713d7be' GROUP BY status;

-- * Analyze
EXPLAIN ANALYSE
SELECT pl.added_at, pl.user_id, ua.login
FROM post_likes pl
LEFT JOIN user_accounts ua ON ua.id = pl.user_id
WHERE pl.post_id = 'd5249d9a-c644-42e9-9a9f-dd972713d7be' AND pl.status = 'Like'
ORDER BY pl.added_at DESC
LIMIT 3; -- ~ 22ms (Parallel Seq Scan + Sort method) / ~ 0.1ms (Index Scan Backward using "IDX_post_likes_post_id_added_at_like");