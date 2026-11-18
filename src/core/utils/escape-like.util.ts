export const escapeLike = (value: string): string => {
  return value.replace(/[\\%_]/g, '\\$&'); // экранирует \, % и _ обратным слэшем, а Postgres по умолчанию использует именно \ как escape-символ в LIKE;
};
