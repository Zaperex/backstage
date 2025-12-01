import { createApp } from '@backstage/frontend-defaults';
import { dynamicFrontendFeaturesLoader } from '@backstage/frontend-dynamic-feature-loader';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';

export default createApp({
  features: [
    catalogPlugin,
    navModule,
    // Load dynamic frontend plugins from the backend dynamic features service
    dynamicFrontendFeaturesLoader(),
  ],
});
