import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreConfig } from 'src/core/core.config';

export const typeOrmModule = TypeOrmModule.forRootAsync({
  inject: [CoreConfig],

  useFactory: (coreConfig: CoreConfig) => {
    return {
      type: 'postgres',
      schema: 'public',
      url: coreConfig.postgresURI,
      autoLoadEntities: true,
      synchronize: true,
    };
  },
});
