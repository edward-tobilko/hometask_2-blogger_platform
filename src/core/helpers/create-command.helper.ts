import { uuid } from "../infrastructure/crypto/random-uuid.crypto";

interface CommandMeta {
  throwError: boolean;
  transaction: boolean;
  timestamp: number;
  commandId: string;

  userId?: string;
  requestId?: string;
}

export const createCommand = <T>(
  payload: T,
  options?: Partial<CommandMeta>
): { meta: CommandMeta; payload: T } => {
  return {
    meta: {
      throwError: options?.throwError ?? true, // Если что-то пойдет не так — бросить ошибку, а не просто вернуть результат.
      transaction: options?.transaction ?? true, // Команда должна выполняться в пределах транзакции (например, в БД).
      commandId: options?.commandId ?? uuid, // Рандомно-сгенерированный id
      timestamp: options?.timestamp ?? Date.now(), // Время создания

      userId: options?.userId,
      requestId: options?.requestId,
    },

    payload, // my data (request)
  };
};

// ? command object pattern: using in CQRS (Command Query Responsibility Segregation) event-driven or transactional systems
// ? createCommand - утилита для унификации бизнес-команд в системе. Она упаковывает данные (payload - то что приходит с request) со служебными параметрами (meta), которые определяют, как команда должна быть выполнена: в транзакции или нет, с прокидыванием ошибок или тихим фейлом.
// ? <T> - здесь мы будем подставлять наши типы с request-payloads (CreateBlogRequestPayload type).
