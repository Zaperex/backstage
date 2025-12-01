# Dynamic Plugins Directory

This directory is where dynamic plugins are installed for runtime loading.

## Overview

Dynamic plugins allow you to add frontend and backend plugins to your Backstage instance without rebuilding the application. Plugins placed in this directory will be automatically discovered and loaded at startup.

## Adding a Dynamic Plugin

### Frontend Plugins

To add a frontend plugin for dynamic loading:

1. Build the plugin with the `frontend-dynamic-container` role:

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

1. Build the plugin with dynamic export support (using `@redhat-developer-hub/cli` or similar tooling):

   ```bash
   cd /path/to/your-backend-plugin
   yarn export-dynamic-plugin
   ```

2. Copy the plugin package to this directory:

   ```bash
   cp -R /path/to/your-backend-plugin ./dynamic-plugins-root/
   ```

## Directory Structure

Each plugin should be in its own subdirectory with the following structure:

```
dynamic-plugins-root/
├── your-frontend-plugin/
│   ├── dist/
│   │   ├── manifest.json
│   │   └── remoteEntry.js
│   └── package.json
├── your-backend-plugin/
│   ├── dist/
│   │   └── index.cjs.js
│   └── package.json
└── README.md
```

## Configuration

The dynamic plugins feature is configured in `app-config.yaml`:

```yaml
dynamicPlugins:
  rootDirectory: dynamic-plugins-root
```