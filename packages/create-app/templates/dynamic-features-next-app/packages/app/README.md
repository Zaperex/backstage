# example-dynamic-frontend

This package is an EXAMPLE of a Backstage frontend with module federation support.

The main purpose of this package is to provide a test bed for Backstage plugins
using the new frontend system. Feel free to experiment locally or within your fork by
adding features and module federation bundles to this frontend, to try things out.

## Development

To run the example frontend, first go to the project root and run

```bash
yarn install
```

You should only need to do this once.

After that, go to the `packages/app` directory and run

```bash
yarn start
```

The frontend starts up on port 3000 per default.
For more information on setting up the new frontend system, see the [Backstage documentation](https://backstage.io/docs/frontend-system/).

## Adding frontend features with module federation

This frontend also supports loading plugins dynamically at runtime using module federation. Frontend plugins can be built as module federation remote bundles and placed in the `dynamic-plugins-root` directory to be automatically discovered and loaded.

To use dynamic plugins, you will need to ensure the backend is running alongside the frontend since it scans the `dynamic-plugins-root` directory for available plugins, exposes their metadata through an API endpoint, and serves the plugin bundles (module federation assets) that the frontend loads at runtime.
You should run `yarn start` from the project root to start both the backend and frontend together instead.

For detailed instructions on building, installing, and configuring dynamic frontend plugins, see the [Dynamic Plugins README](../../dynamic-plugins-root/README.md).

## Documentation

- [Backstage documentation](https://backstage.io/docs/frontend-system/)
- [Backend dynamic feature service](https://github.com/backstage/backstage/blob/master/packages/backend-dynamic-feature-service/README.md)
- [Frontend dynamic feature loader](https://github.com/backstage/backstage/blob/master/packages/frontend-dynamic-feature-loader/README.md)
