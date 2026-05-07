import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const mongooseModule = MongooseModule.forRootAsync({
  inject: [ConfigService], // говорим, что нам нужен ConfigService (он может валидировать переменные через Joi-схему, и если MONGO_URL пустой, приложение упадёт на старте, а не при первом запросе).

  // * паттерн (хук) который возвращает конфигурационный объект для модуля. Nest вызовет её один раз при старте приложения
  useFactory: (config: ConfigService) => ({
    uri: config.get('MONGO_URL'),
    dbName: config.get('DB_NAME'),
  }),
});
