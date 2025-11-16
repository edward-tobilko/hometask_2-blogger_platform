// ? FieldsOnly - гарантирует, что в dto только поля, без методов.
export type FieldsOnly<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

// ? keyof T — перебирает все ключи типа T.
// ? as T[K] extends Function ? never : K — условное переименование ключа: если тип свойства T[K] — функция (extends Function), то ключ мапится в never → исключается а иначе оставляем ключ K как есть.
// ? : T[K] — тип значения сохраняется без изменений для тех ключей, которые прошли фильтр.
