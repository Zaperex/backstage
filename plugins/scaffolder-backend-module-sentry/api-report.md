## API Report File for "@backstage/plugin-scaffolder-backend-module-sentry"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { BackendFeatureCompat } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { JsonObject } from '@backstage/types';
import { TemplateAction } from '@backstage/plugin-scaffolder-node';

// @public
export function createSentryCreateProjectAction(options: {
  config: Config;
}): TemplateAction<
  {
    organizationSlug: string;
    teamSlug: string;
    name: string;
    slug?: string | undefined;
    authToken?: string | undefined;
  },
  JsonObject
>;

// @public
const sentryModule: BackendFeatureCompat;
export default sentryModule;

// (No @packageDocumentation comment for this package)
```
