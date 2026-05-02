import { Transform, TransformFnParams } from 'class-transformer';

// * трансформация
export const Trim = () => {
  return Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  );
};

// ? unknown честнее всего — мы не знаем, что придёт, если это не строка. Лучше чем any!
