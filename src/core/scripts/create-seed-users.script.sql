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

-- * Show random position row from table
WITH ranked AS (
    SELECT
        id,
        login,
        email,
        ctid,      -- системная колонка -> физический адрес версии строки: (номер страницы по 8 КБ, слот на странице);
        row_number() OVER (ORDER BY created_at DESC, id) AS api_position    -- позиция в выдаче GET /sa/users по умолчанию;
    FROM user_accounts
    WHERE deleted_at IS NULL
),
pick AS (
    SELECT id
    FROM user_accounts
    WHERE login LIKE 'seed-login%'
    ORDER BY random()
    LIMIT 1
)
SELECT r.*,
    substring(r.login FROM 11)::int AS seed_i,            -- i из generate_series ('seed-login' = 10 символов);
    ceil(r.api_position / 10.0) AS api_page             -- номер страницы при pageSize = 10;
FROM ranked r
JOIN pick p USING (id);

-- * Почему ctid не годится как идентификатор: из-за MVCC UPDATE не перезаписывает строку на месте, а создаёт новую версию в другом месте, поэтому ctid меняется. Его также меняют VACUUM FULL и CLUSTER:
SELECT ctid, -- (10961,19)
xmin, -- 51307
xmax, -- 0
login FROM user_accounts WHERE login = 'seed-login475779';
UPDATE user_accounts SET email = email WHERE login = 'seed-login475779';
SELECT ctid, -- (23151,28)
xmin, -- 51309
xmax, -- 0
login FROM user_accounts WHERE login = 'seed-login475779';
-- * После UPDATE ctid станет другим (обычно в конце таблицы или на той же странице, если там есть место — это HOT-UPDATE), а xmin получит номер новой транзакции. Это тот же механизм, из-за которого после DELETE и UPDATE нужен VACUUM.

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE recovery_code = '916fab98-2db4-413c-aa6a-201c2e4f8a52' AND deleted_at IS NULL; -- ~ 60ms (Parallel Seq Scan под узлом Gather - это значит, что Postgres читал таблицу несколькими процессами-воркерами) / ~ 0.05ms (Index Scan using - теперь Postgres читает по определенному условию на которое мы навешали индекс(IDX_user_accounts_recovery_code));

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE telegram_confirmation_code = 'aa213dee-6857-4c5c-b1d5-8a70be7b7fde' AND deleted_at IS NULL; -- ~ 55ms / ~ 0.07ms

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE confirmation_code = 'c2fed3c1-500b-47bb-8062-372a58793c28' AND deleted_at IS NULL; -- ~ 60ms / ~ 0.06ms

-- * Анализ на скорость запросса GET по фильтрам (query params) searchEmailTerm / searchLoginTerm
-- 1. селективный прогон (совпадений = 1 count)
EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE (login ILIKE '%765241%' AND deleted_at IS NULL) OR (email ILIKE '%001fa32e%' AND deleted_at IS NULL)
ORDER BY created_at DESC
LIMIT 10; -- ~ 145ms (Parallel Seq Scan + Sort (top-N heapsort)) / ~ 4.2ms (BitmapOr: 2× Bitmap Index Scan GIN -> Bitmap Heap Scan, Recheck Cond);

EXPLAIN ANALYSE
SELECT COUNT(*) FROM user_accounts
WHERE (login ILIKE '%765241%' AND deleted_at IS NULL) OR (email ILIKE '%001fa32e%' AND deleted_at IS NULL); -- ~ 150ms (Parallel Seq Scan + Partial Aggregate) / ~ 4.4ms (BitmapOr: 2× Bitmap Index Scan GIN -> Bitmap Heap Scan, Recheck Cond + Aggregate);

-- 2. средний прогон (совпадений = 11,551 counts)
EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE (login ILIKE '%seed-login76%' AND deleted_at IS NULL) OR (email ILIKE '%001f%' AND deleted_at IS NULL)
ORDER BY created_at DESC
LIMIT 10; -- ~ 155ms (Parallel Seq Scan + Sort (top-N heapsort)) / ~ 23ms (BitmapOr: 2× Bitmap Index Scan GIN -> Bitmap Heap Scan, Recheck Cond);

EXPLAIN ANALYSE
SELECT COUNT(*) FROM user_accounts
WHERE (login ILIKE '%seed-login76%' AND deleted_at IS NULL) OR (email ILIKE '%001f%' AND deleted_at IS NULL); -- ~ 150ms (Parallel Seq Scan + Partial Aggregate) / ~ 17ms (BitmapOr: 2× Bitmap Index Scan GIN -> Bitmap Heap Scan, Recheck Cond);

-- 3. неселективный прогон (совпадений = 1m counts)
SET enable_seqscan = off; -- принудительно отключаем Seq Scan;

EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE (login ILIKE '%seed%' AND deleted_at IS NULL) OR (email ILIKE '%seed%' AND deleted_at IS NULL)
ORDER BY created_at DESC
LIMIT 10; -- ~ 160ms (Parallel Seq Scan + Sort (top-N heapsort)) / ничего не изменилось, потому что PG выбрал Seq Scan, та как он будет быстрее чем чтения через индексы (так как совпадений много, PG решит его лучше через чтения линейно нежели через чиения индекса и построение битовой карты на миллион TID). Если принудительно отключить Seq Scan, то PG использует BitmapOr который будет медленее в 1.5 раза из-за чтения тогоже индекса и битовой карты TID ~ 250ms;

RESET enable_seqscan; -- принудительно включаем Seq Scan;

EXPLAIN ANALYSE
SELECT COUNT(*) FROM user_accounts
WHERE (login ILIKE '%seed%' AND deleted_at IS NULL) OR (email ILIKE '%seed%' AND deleted_at IS NULL); -- ~ 100ms (Parallel Seq Scan + Partial Aggregate) / ничего не изменилось;

-- 4. короткий (< 3) прогон (совпадений = 114,742)
EXPLAIN ANALYSE
SELECT * FROM user_accounts
WHERE (login ILIKE '%ab%' AND deleted_at IS NULL) OR (email ILIKE '%ab%' AND deleted_at IS NULL)
ORDER BY created_at DESC
LIMIT 10; -- ~ 150ms (Parallel Seq Scan + Sort (top-N heapsort)) / ничего не изменилось, потому что pg_trgm (PG триграмма) берет минимум 3 символа -> PG решает использовать Seq Scan;

EXPLAIN ANALYSE
SELECT COUNT(*) AS users_filtered_count FROM user_accounts
WHERE (login ILIKE '%ab%' AND deleted_at IS NULL) OR (email ILIKE '%ab%' AND deleted_at IS NULL); -- ~ 145ms (Parallel Seq Scan + Partial Aggregate) / ничего не изменилось;