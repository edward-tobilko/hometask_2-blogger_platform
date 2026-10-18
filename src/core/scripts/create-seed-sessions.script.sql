INSERT INTO security_devices_session (ip, title, last_active_date, device_id, user_id, expires_at)
SELECT
gen_random_uuid(),
'seed device',
now(),
gen_random_uuid(),
CASE 
    WHEN i % 200000 = 0 THEN '47acea1a-e395-4e42-97d4-165d81093090'::uuid -- пользователь: 5 сессий;
    ELSE md5((i % 200000)::text)::uuid -- ещё 199 999 пользователей по 5 сессий;
END,
now() + ((i / 200000) - 1) * INTERVAL '1 day' -- у каждого юзера: 1 сессия истекла, 4 живые;
FROM generate_series(1, 1000000) as i;


ANALYSE security_devices_session;


EXPLAIN ANALYSE
SELECT * FROM security_devices_session
WHERE user_id = '47acea1a-e395-4e42-97d4-165d81093090'
AND expires_at > now(); -- ~ 50ms / ~ 0.08ms



SELECT user_id, COUNT(*) AS sessions_count FROM security_devices_session GROUP BY user_id ORDER BY sessions_count DESC LIMIT 10;

SELECT COUNT(*) AS sessions_count FROM security_devices_session;
SELECT * FROM security_devices_session WHERE user_id = '47acea1a-e395-4e42-97d4-165d81093090';