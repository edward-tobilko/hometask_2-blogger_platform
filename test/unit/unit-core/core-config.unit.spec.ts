import { CoreConfig, Environments } from 'src/core/core.config';

// * Вспомогательная функция: дефолтные валидные значения + возможность переопределить любое поле.
function makeConfigService(overrides: Record<string, string | undefined> = {}) {
  const defaults: Record<string, string> = {
    PORT: '3000',
    MONGO_URI: 'mongodb://localhost:27017/test',
    NODE_ENV: 'development',
    IS_SWAGGER_ENABLED: 'true',
    INCLUDE_TESTING_MODULE: 'false',
    SEND_INTERNAL_SERVER_ERROR_DETAILS: 'false',
  };

  return {
    get: (key: string) => (key in overrides ? overrides[key] : defaults[key]), // Оператор in возвращает true если свойство существует, даже если его значение undefined. То есть key in overrides позволяет явно переопределить поле значением undefined, чтобы симулировать отсутствующую env-переменную.
  };
}

describe('Unit test for CoreConfig', () => {
  describe('Valid config', () => {
    let config: CoreConfig;

    beforeEach(() => {
      config = new CoreConfig(makeConfigService() as any);
    });

    it('should be created without errors', () => {
      expect(() => new CoreConfig(makeConfigService() as any)).not.toThrow();
    });

    it('port should be a number', () => {
      expect(typeof config.port).toBe('number');
      expect(config.port).toBe(3000);
    });

    it('env should match Environments enum', () => {
      expect(config.env).toBe(Environments.DEVELOPMENT);
    });

    it('isSwaggerEnabled should be boolean true', () => {
      expect(config.isSwaggerEnabled).toBe(true);
    });

    it('includeTestingModule should be boolean false', () => {
      expect(config.includeTestingModule).toBe(false);
    });

    it('sendInternalServerErrorDetails should be boolean false', () => {
      expect(config.sendInternalServerErrorDetails).toBe(false);
    });
  });

  describe('Invalid config', () => {
    it('should throw if PORT is missing', () => {
      expect(
        () => new CoreConfig(makeConfigService({ PORT: undefined }) as any), // overrides = { PORT: undefined } - 'PORT' in overrides -> true -> вернёт undefined -> тестируем отсутствие
      ).toThrow('PORT');
    });

    it('should throw if PORT is not a number', () => {
      expect(
        () => new CoreConfig(makeConfigService({ PORT: 'abc' }) as any),
      ).toThrow('PORT');
    });

    it('should throw if MONGO_URI is empty', () => {
      expect(
        () => new CoreConfig(makeConfigService({ MONGO_URI: '' }) as any),
      ).toThrow('MONGO_URI');
    });

    it('should throw if MONGO_URI is missing', () => {
      expect(
        () =>
          new CoreConfig(makeConfigService({ MONGO_URI: undefined }) as any),
      ).toThrow('MONGO_URI');
    });

    it('should throw if NODE_ENV is invalid', () => {
      expect(
        () => new CoreConfig(makeConfigService({ NODE_ENV: 'invalid' }) as any),
      ).toThrow();
    });

    it('should throw if IS_SWAGGER_ENABLED has unknown value', () => {
      expect(
        () =>
          new CoreConfig(
            makeConfigService({ IS_SWAGGER_ENABLED: 'yes' }) as any,
          ),
      ).toThrow();
    });

    it('should throw if INCLUDE_TESTING_MODULE has unknown value', () => {
      expect(
        () =>
          new CoreConfig(
            makeConfigService({ INCLUDE_TESTING_MODULE: 'on' }) as any,
          ),
      ).toThrow();
    });

    it('should throw if SEND_INTERNAL_SERVER_ERROR_DETAILS is missing (null result)', () => {
      expect(
        () =>
          new CoreConfig(
            makeConfigService({
              SEND_INTERNAL_SERVER_ERROR_DETAILS: undefined,
            }) as any,
          ),
      ).toThrow();
    });
  });

  describe('Convert to boolean', () => {
    const cases: Array<[string, boolean]> = [
      ['true', true],
      ['1', true],
      ['enabled', true],
      ['false', false],
      ['0', false],
      ['disabled', false],
    ];

    it.each(cases)(
      'IS_SWAGGER_ENABLED="%s" should produce %s',
      (value, expected) => {
        const config = new CoreConfig(
          makeConfigService({ IS_SWAGGER_ENABLED: value }) as any,
        );

        expect(config.isSwaggerEnabled).toBe(expected);
      },
    );

    it('should trim whitespace before converting ("  true  " → true)', () => {
      const config = new CoreConfig(
        makeConfigService({ IS_SWAGGER_ENABLED: '  true  ' }) as any,
      );

      expect(config.isSwaggerEnabled).toBe(true);
    });
  });
});

// ? CoreConfig в тестах - это просто объект с методом get. Никакого NestJS DI не нужно, поэтому мок делается через обычный объект { get: (key) => ... }. Это и есть unit-test — тестируем логику класса в полной изоляции.
