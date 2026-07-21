# Dynamic Plugins Directory

This directory is where dynamic plugins are installed for runtime loading.

## Overview

Dynamic plugins allow you to add frontend and backend plugins to your Backstage instance without rebuilding the application. Plugins placed in this directory will be automatically discovered and loaded at startup.

## Bundling Plugins for Dynamic Loading

Both backend and frontend plugins are bundled using the same CLI command. From a plugin's package directory:

```bash
yarn backstage-cli package bundle --output-destination /path/to/dynamic-plugins-root
```

The `--output-destination` flag tells the command to place the bundle directly into the dynamic plugins root directory, in a subdirectory named after the plugin package (e.g. `dynamic-plugins-root/backstage-plugin-catalog-backend/`). Without this flag, the bundle is created in a `bundle/` subdirectory inside the plugin's own package directory and you would need to move it into `dynamic-plugins-root/` yourself.

For full command options (including `--clean`, `--no-build`, `--pre-packed-dir` for batch bundling, and more), see the [`package bundle` CLI reference](https://backstage.io/docs/tooling/cli/commands#package-bundle).

For details on how backend dynamic plugins are loaded, packaging approaches, and architecture, see the [`@backstage/backend-dynamic-feature-service` README](https://github.com/backstage/backstage/blob/master/packages/backend-dynamic-feature-service/README.md).

For details on how frontend dynamic plugins are loaded via module federation, see the [`@backstage/frontend-dynamic-feature-loader` README](https://github.com/backstage/backstage/blob/master/packages/frontend-dynamic-feature-loader/README.md).

## Verifying a Bundle

After bundling, your plugin directory should contain the following structure depending on the plugin type.

**Backend plugin** (e.g. `backstage-plugin-catalog-backend/`):

```
backstage-plugin-catalog-backend/
├── dist/
│   ├── index.cjs.js
│   └── .config-schema.json   # Config schema (when applicable)
├── node_modules/              # All production dependencies
├── package.json               # Must have "main" and "backstage.role"
└── ...
```

**Frontend plugin** (e.g. `backstage-plugin-catalog/`):

```
backstage-plugin-catalog/
├── dist/
│   ├── remoteEntry.js         # Module federation entry point
│   └── .config-schema.json   # Config schema (when applicable)
└── package.json               # Must have "backstage.role"
```

Key things to check:

- `package.json` has a `backstage.role` field set to `backend-plugin`, `backend-plugin-module`, `frontend-plugin`, or `frontend-plugin-module`
- Backend plugins have a `main` field in `package.json` pointing to a valid entry file, and a `node_modules/` directory with dependencies
- Frontend plugins have `dist/remoteEntry.js`

After starting the application, check the logs for confirmation:

```
info: Loaded dynamic backend plugin '@backstage/plugin-catalog-backend' from 'file:///path/to/dynamic-plugins-root/backstage-plugin-catalog-backend'
```

## Configuration

Configure the dynamic plugins directory in `app-config.yaml`:

```yaml
dynamicPlugins:
  rootDirectory: dynamic-plugins-root
```

Plugin-specific configuration (e.g. for kubernetes, techdocs, etc.) goes in the standard `app-config.yaml` sections, the same as for statically installed plugins.

## Troubleshooting

### Plugin Not Detected

- Reload the application since the backend route providing frontend features might not be ready yet
- Verify `package.json` exists in the plugin directory
- Check that `main` field points to a valid entry file (for backend plugins)
- Ensure `backstage.role` is set to a valid role (`backend-plugin`, `backend-plugin-module`, `frontend-plugin`, or `frontend-plugin-module`)

### Plugin Fails to Load

- Ensure the plugin was bundled with `backstage-cli package bundle`
- Check logs for dependency resolution errors
- Verify version compatibility between plugin dependencies and the main Backstage application

### Frontend Plugin Not Loading

- Verify `remoteEntry.js` exists in the plugin's `dist/` folder
- Check that the plugin supports the new frontend system
- Ensure the backend is running (it serves frontend plugin assets via module federation)

## Resources

- [Backstage Dynamic Plugins Documentation](https://github.com/backstage/backstage/blob/master/packages/backend-dynamic-feature-service/README.md)
- [Frontend Dynamic Feature Loader Documentation](https://github.com/backstage/backstage/tree/master/packages/frontend-dynamic-feature-loader)
- [`package bundle` CLI reference](https://backstage.io/docs/tooling/cli/commands#package-bundle)
