INSERT INTO quiz_questions (body, correct_answers, published, created_at, updated_at)
SELECT
'Question ' || i,
jsonb_build_array('answer ' || i, i::text),
false,
now() - i * INTERVAL '1 second',
now() - i * INTERVAL '1 second'
FROM generate_series(1, 100) AS i;

SELECT count(*) FROM quiz_questions;
SELECT body, correct_answers, created_at FROM quiz_questions ORDER BY created_at DESC LIMIT 5;