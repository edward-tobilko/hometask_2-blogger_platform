import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateQuestionInputDto } from 'src/modules/quiz-game/questions/api/input-dto/create-question.input-dto';

// * Повторяем то, что делает глобальный ValidationPipe: transform -> validate (stopAtFirstError).
const validateDto = async (correctAnswers: unknown) => {
  const dto = plainToInstance(CreateQuestionInputDto, {
    body: 'How many continents are there ?',
    correctAnswers,
  });

  const errors = await validate(dto, { stopAtFirstError: true });

  return {
    dto,
    constraints: errors[0]?.constraints ?? {},
  };
};

describe('CreateQuestionInputDto — correctAnswers', () => {
  it('rejects non-array with custom message', async () => {
    const { constraints } = await validateDto('6');

    expect(constraints).toEqual({ isArray: 'correctAnswers must be array' });
  });

  it('rejects empty array', async () => {
    const { constraints } = await validateDto([]);

    expect(Object.keys(constraints)).toEqual(['arrayNotEmpty']);
  });

  it('rejects non-string elements', async () => {
    const { constraints } = await validateDto([1, null]);

    expect(Object.keys(constraints)).toEqual(['isString']);
  });

  it('rejects blank element after trim', async () => {
    const { constraints } = await validateDto(['6', '   ']);

    expect(Object.keys(constraints)).toEqual(['isNotEmpty']);
  });

  it('accepts strings and trims each element', async () => {
    const { dto, constraints } = await validateDto([' 6 ', 'six']);

    expect(constraints).toEqual({});
    expect(dto.correctAnswers).toEqual(['6', 'six']);
  });
});
