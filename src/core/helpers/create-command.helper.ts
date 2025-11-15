// ? command object pattern: using in CQRS (Command Query Responsibility Segregation) event-driven or transactional systems
export const createCommand = <T>(
  payload: T,
  options?: { throwError?: boolean; transaction?: boolean }
) => {
  return {
    meta: {
      throwError: options?.throwError ?? true, // Если что-то пойдет не так — бросить ошибку, а не просто вернуть результат.
      transaction: options?.transaction ?? true, // Команда должна выполняться в пределах транзакции (например, в БД).
    },
    payload, // my data (request)
  };
};

// ? createCommand - утилита для унификации бизнес-команд в системе. Она упаковывает данные (payload - то что приходит с request) со служебными параметрами (meta), которые определяют, как команда должна быть выполнена: в транзакции или нет, с прокидыванием ошибок или тихим фейлом.
