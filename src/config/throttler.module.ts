import { ThrottlerModule } from '@nestjs/throttler';

import { CoreConfig } from 'src/core/core.config';
import { CoreModule } from 'src/core/core.module';

export const throttlerModule = ThrottlerModule.forRootAsync({
  imports: [CoreModule],
  inject: [CoreConfig],

  useFactory: (coreConfig: CoreConfig) => {
    const isDisabled = coreConfig.isRateLimitDisabled === true;

    return [
      {
        ttl: coreConfig.ttlRateLimit,
        limit: isDisabled ? 10000 : coreConfig.countRateLimit,
      },
    ];
  },
});
