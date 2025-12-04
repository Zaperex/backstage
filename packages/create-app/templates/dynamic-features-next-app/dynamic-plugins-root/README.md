# Dynamic Plugins Directory

This directory is where dynamic plugins are installed for runtime loading.

## Overview

Dynamic plugins allow you to add frontend and backend plugins to your Backstage instance without rebuilding the application. Plugins placed in this directory will be automatically discovered and loaded at startup.


## Directory Structure

Each plugin should be in its own subdirectory with the following minimal structure:

```
dynamic-plugins-root/
├── your-frontend-plugin/
│   ├── dist/
│   │   ├── .config-schema.json
│   │   ├── mf-manifest.json
│   │   └── remoteEntry.js
│   └── package.json
├── your-backend-plugin/
│   ├── dist/
│   │   ├── .config-schema.json
│   │   └── index.cjs.js
│   ├── node_modules/
│   │   └── private-module/
│   │       └── index.cjs.js
│   └── package.json
└── README.md
```

## Adding a Dynamic Plugin

### Frontend Plugins

To add a frontend plugin for dynamic loading:

1. Build the plugin as a module federation remote bundle:

   ```bash
   cd /path/to/your-frontend-plugin
   yarn build --role frontend-dynamic-container
   ```

2. Copy the plugin package (including the `dist` folder) to this directory:

   ```bash
   cp -R /path/to/your-frontend-plugin ./dynamic-plugins-root/
   ```

### Backend Plugins

To add a backend plugin for dynamic loading:

1. Package the plugin for dynamic loading (using `@redhat-developer-hub/cli` or similar tooling):

   ```bash
   cd /path/to/your-backend-plugin
   npx @redhat-developer-hub/cli plugin export
   // This creates a self-contained packaged plugin in the `dist-dynamic` sub-folder
   npm pack ./dist-dynamic
   // Creates an archive similar to `your-backend-plugin-0.1.0.tgz`
   ```

2. Extract the packaged dynamic plugin to this directory:

   ```bash

   mkdir -p /path/to/dynamic-plugins-root/your-backend-plugin
   tar -xzf your-backend-plugin-0.1.0.tgz -C ./dynamic-plugins-root/your-backend-plugin --strip-components=1
   ```


## Configuration

The dynamic plugins feature is configured in `app-config.yaml`:

```yaml
dynamicPlugins:
  rootDirectory: dynamic-plugins-root
```