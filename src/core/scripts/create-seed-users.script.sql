-- * Create 1m fake users
INSERT INTO user_accounts (login, email, password_hash, recovery_code, telegram_confirmation_code, confirmation_code)
SELECT
'seed-login' || i,
-- 'seed-email' || i,
md5(i::text) || '@seed.org',
gen_random_uuid(),
CASE
    WHEN i % 10000 = 0 THEN gen_random_uuid() -- default ELSE returns NULL 
END,
CASE
    WHEN i % 5000 = 1 THEN gen_random_uuid()::text
END,
CASE
    WHEN i % 10 <> 0 THEN gen_random_uuid()
END
FROM generate_series(1, 1000000) AS i;

ANALYSE user_accounts; -- ~ 100ms

-- * Fetch counts of total / recovery_code / telegram_confirmation_code / confirmation_code
SELECT
count(*) AS total, -- ожидаем 1m записей
count(recovery_code) AS with_recovery, -- 100 записей
count(telegram_confirmation_code) AS with_telegram, -- 200 записей
count(confirmation_code) AS with_confirm -- 900 000 записей
FROM user_accounts
WHERE login LIKE 'seed-login%';

-- * Show all users with recovery_code
SELECT * FROM user_accounts WHERE recovery_code is not null;

-- * Show all users with telegram_confirmation_code
SELECT * FROM user_accounts WHERE telegram_confirmation_code is not null;

-- * Show all users with confirmation_code
SELECT * FROM user_accounts WHERE confirmation_code is not null;

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE recovery_code = '916fab98-2db4-413c-aa6a-201c2e4f8a52' AND deleted_at IS NULL; -- ~ 60ms (Parallel Seq Scan под узлом Gather - это значит, что Postgres читал таблицу несколькими процессами-воркерами) / ~ 0.05ms (Index Scan using - теперь Postgres читает по определенному условию на которое мы навешали индекс(IDX_user_accounts_recovery_code));

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE telegram_confirmation_code = 'aa213dee-6857-4c5c-b1d5-8a70be7b7fde' AND deleted_at IS NULL; -- ~ 55ms / ~ 0.07ms

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE confirmation_code = 'c2fed3c1-500b-47bb-8062-372a58793c28' AND deleted_at IS NULL; -- ~ 60ms / ~ 0.06ms