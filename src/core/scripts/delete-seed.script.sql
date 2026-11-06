-- * comments
DELETE FROM comments WHERE user_login = 'seed_user';

-- * posts
SELECT count(*) FROM posts WHERE title LIKE 'seed-post %'; -- контроль ДО удаления: должно быть 2m (without my own created);
DELETE FROM posts WHERE title Like 'seed-post %'; -- удаление только сида;
SELECT count(*) as posts_count FROM posts; -- контроль ПОСЛЕ: должно остаться 15;

-- * post_likes
DELETE FROM post_likes WHERE user_id IN (SELECT id FROM user_accounts WHERE login LIKE 'seed-login%');

-- * security_devices_session
DELETE FROM security_devices_session WHERE title = 'seed device';

-- * user_accounts
DELETE FROM user_accounts WHERE login LIKE 'seed-login%';

-- * blogs
SELECT count(*) AS blogs_count_with_seed FROM blogs WHERE website_url = 'https://seed.org';

DELETE FROM blogs
WHERE id IN (SELECT id FROM blogs WHERE website_url = 'https://seed.org' LIMIT 100000);

DELETE FROM blogs WHERE website_url = 'https://seed.org';

SELECT count(*) AS blogs_total_count FROM blogs;

VACUUM ANALYSE; -- вернуть место на диске + обновить статистику планировщика;