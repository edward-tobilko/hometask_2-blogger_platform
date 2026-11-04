import { escapeLike } from 'src/core/utils/escape-like.util';

describe('escapeLike', () => {
  it('returns plain text unchanged', () => {
    expect(escapeLike('nest')).toBe('nest'); // plain text — фикс не должен портить обычный поиск (te, nest);
  });

  it('escapes "_" and "%"', () => {
    expect(escapeLike('john_doe')).toBe('john\\_doe'); // "_" и "%" — базовая регрессия: оба шаблонных символа экранируются;
    expect(escapeLike('100%')).toBe('100\\%');
  });

  it('escapes backslash itself', () => {
    expect(escapeLike('a\\b')).toBe('a\\\\b'); // backslash — без него ввод с \ ломает шаблон (%a\%);
  });

  it('escapes every occurrence, not only the first', () => {
    expect(escapeLike('_%_')).toBe('\\_\\%\\_'); // every occurrence — защищает от забытого флага g в регулярке;
  });

  it('escapes backslash only once when combined with "_"', () => {
    expect(escapeLike('\\_')).toBe('\\\\\\_'); // once when combined — защищает от двух replace подряд, которые дают двойное экранирование;
  });
});
