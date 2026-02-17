# Dynamic Plugins Directory

This directory is where dynamic plugins are installed for runtime loading.

## Overview

Dynamic plugins allow you to add frontend and backend plugins to your Backstage instance without rebuilding the application. Plugins placed in this directory will be automatically discovered and loaded at startup.

---

## Exporting Plugins as Dynamic

Before installing a plugin dynamically, you need to export it in the appropriate format.

### Backend Plugins

Backend plugins need to be packaged as CommonJS bundles for dynamic loading. For plugins with private dependencies or complex bundling requirements, you can use the `@red-hat-developer-hub/cli` to create a self-contained bundle. The examples below use this CLI approach.

#### Step 1: Export the Plugin

```bash
# Navigate to the plugin directory
cd /path/to/plugins/my-backend-plugin

# Export the plugin for dynamic loading
npx @red-hat-developer-hub/cli plugin export
```

This creates a self-contained package in `dist-dynamic/` with:
- Bundled plugin code (`dist/index.cjs.js`)
- Modified `package.json` with shared backstage dependencies marked as peer dependencies
- Additional private dependencies (if any) embedded in `node_modules/`

#### Step 2: Package the Exported Plugin

```bash
# Create a tarball from the exported plugin
npm pack ./dist-dynamic
# This creates a tarball like: backstage-plugin-my-backend-plugin-dynamic-0.20.5.tgz
```

#### Dependency Handling for Backend Plugins

- **Private dependencies**: The export process embeds private dependencies that are not available in the main application into the plugin's `node_modules/` directory.
  - Use the `--embed-package` argument for each private dependency when exporting the plugin.
    ```bash
    npx @red-hat-developer-hub/cli plugin export --embed-package private-dependency-1 --embed-package private-dependency-2
    ```
- **Shared dependencies**: `@backstage/*` packages and other shared dependencies are marked as peer dependencies and provided by the main application at runtime.

> **Important**: Ensure your plugin's shared dependencies are compatible with the versions provided by the main Backstage application.

### Frontend Plugins

Frontend plugins are built as module federation remote bundles using the Backstage CLI.

#### Build the Plugin

```bash
# Navigate to the plugin directory
cd /path/to/plugins/my-frontend-plugin

# Build as a module federation remote bundle
yarn build --role frontend-dynamic-container
```

This creates a module federation bundle in `dist/` with:
- `mf-manifest.json` - Module federation manifest
- `remoteEntry.js` - Remote entry point for module federation
- Other bundled assets

> **Note**: This only works for plugins with support for the new frontend system.

---

## Expected Plugin Structure

### Minimal Dynamic Plugin Structure

```
dynamic-plugins-root/
├── your-backend-plugin/
|   ├── dist/
|   |   ├── index.cjs.js          # Main entry point
|   |   └── .config-schema.json   # Config schema (optional)
|   ├── embedded/                 # Embedded private dependencies (if any)
|   |   ├── private-module-1/
|   |   │   ├── dist/
|   |   │   |    ├── index.cjs.js
|   |   │   |    └── ...other files...
|   |   |   └── package.json
|   ├── node_modules/
|   ├── yarn.lock                 
|   └── package.json              # Must include 'main' and 'backstage.role'
├── your-frontend-plugin/
|   ├── dist/
|   |   ├── static/
|   |   |    ├── ...static assets...
|   |   ├── mf-manifest.json      # Module federation manifest
|   |   ├── remoteEntry.js        # Module federation entry point
|   |   ├── remoteEntry.js.map
|   |   └── .config-schema.json   # Config schema (optional)
|   └── package.json              # Must include 'backstage.role'
```

### Valid Plugin Roles for Dynamic Loading

The plugin scanner accepts packages with the following `backstage.role` values in `package.json`:

| Role | Platform | Description |
|------|----------|-------------|
| `backend-plugin` | node | A standalone backend plugin |
| `backend-plugin-module` | node | A module that extends a backend plugin |
| `frontend-plugin` | web | A standalone frontend plugin |
| `frontend-plugin-module` | web | A module that extends a frontend plugin |
| `frontend-dynamic-container` | web | A frontend plugin built as a module federation remote |

---

## Installing Dynamic Plugins

### Backend Plugin Installation

Here's a complete example using the Kubernetes backend plugin:

#### Step 1: Export and Package

```bash
cd /path/to/plugins/kubernetes-backend
npx @red-hat-developer-hub/cli plugin export
npm pack ./dist-dynamic
# Creates: backstage-plugin-kubernetes-backend-dynamic-0.20.5.tgz
```

#### Step 2: Install to Dynamic Plugins Directory

```bash
# Create directory for the plugin
mkdir -p ./dynamic-plugins-root/kubernetes-backend

# Extract the tarball
tar -xzf backstage-plugin-kubernetes-backend-dynamic-0.20.5.tgz \
    -C ./dynamic-plugins-root/kubernetes-backend \
    --strip-components=1
```

#### Step 3: Verify the Installation

Your directory structure should look like:

```
dynamic-plugins-root/
└── kubernetes-backend/
    ├── dist/
    │   ├── index.cjs.js
    │   └── ...other files...
    ├── embedded/
    |   ├── backstage-plugin-kubernetes-common/
    |   |   ├── dist/
    |   |   |    ├── index.cjs.js
    |   |   |    └── ...other files...
    |   |   └── package.json
    |   ├── backstage-plugin-kubernetes-node/
    |   |   ├── dist/
    |   |   |    ├── index.cjs.js
    |   |   |    └── ...other files...
    |   |   └── package.json
    ├── node_modules/
    └── package.json
```

#### Step 4: Configure the Plugin

Add any plugin-specific configuration to your `app-config.yaml`. Configuration for dynamic plugins is the same as for static plugins. For example, the Kubernetes backend plugin:

```yaml
kubernetes:
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: http://127.0.0.1:9999
          name: minikube
          authProvider: 'serviceAccount'
          skipTLSVerify: false
          skipMetricsLookup: true
          serviceAccountToken: ${K8S_MINIKUBE_TOKEN}
          dashboardUrl: http://127.0.0.1:64713
```

### Frontend Plugin Installation

#### Step 1: Build the Plugin

```bash
cd /path/to/plugins/kubernetes
yarn build --role frontend-dynamic-container
```

#### Step 2: Copy to Dynamic Plugins Directory

```bash
cp -R /path/to/plugins/kubernetes ./dynamic-plugins-root/
```

#### Step 3: Verify the Installation

Your directory structure should look like:

```
dynamic-plugins-root/
└── kubernetes/
    ├── dist/
    │   ├── mf-manifest.json
    │   ├── remoteEntry.js
    │   └── ...other files...
    └── package.json
```

#### Step 4: Configure the Plugin

Configuration for dynamic frontend plugins is the same as for static plugins. Enable frontend features via the `app.extensions` configuration in your `app-config.yaml`:

```yaml
app:
  extensions:
    - entity-card:kubernetes/cluster-status
    - entity-content:kubernetes/kubernetes
```

### Using Symlinks for Development

During development, you can symlink plugin directories instead of copying:

```bash
ln -s /path/to/your-backend-plugin/dist-dynamic ./dynamic-plugins-root/your-backend-plugin
ln -s /path/to/your-frontend-plugin ./dynamic-plugins-root/your-frontend-plugin
```

The scanner follows symbolic links, making this useful for iterative development.

---

## Configuration

Configure the dynamic plugins directory in `app-config.yaml`:

```yaml
dynamicPlugins:
  # Path to the dynamic plugins directory (relative to backstage root or absolute)
  rootDirectory: dynamic-plugins-root
```

This `dynamic-plugins-root` directory can be mounted via a volume mount when running a pre-built container.

### Starting the Application

After installing and configuring plugins, restart the application:

```bash
yarn start
```

Check the logs for confirmation of loaded plugins:

```
info: Loaded dynamic backend plugin '@backstage/plugin-kubernetes-backend' from 'file:///path/to/dynamic-plugins-root/kubernetes-backend'
```

---

## Troubleshooting

### Plugin Not Detected

- Reload the application since backend route providing frontend features might not be ready yet
- Verify `package.json` exists in the plugin directory
- Check that `main` field points to a valid entry file (for backend plugins)
- Ensure `backstage.role` is set correctly to one of the valid roles

### Plugin Fails Due to Missing Dependencies

- The plugin export process should embed private dependencies not present in the main application
- Shared `@backstage/*` dependencies are provided by the main application and should be installed as peer dependencies when exporting plugins
- Verify version compatibility between plugin dependencies and main application

### Frontend Plugin Not Loading

- Ensure the plugin was built with `--role frontend-dynamic-container`
- Verify `mf-manifest.json` and `remoteEntry.js` exist in the `dist/` folder
- Check that the plugin supports the new frontend system

---

## Resources and Documentation

- [Backstage Dynamic Plugins Documentation](https://github.com/backstage/backstage/blob/master/packages/backend-dynamic-feature-service/README.md)
- [Frontend Dynamic Feature Loader Documentation](https://github.com/backstage/backstage/tree/master/packages/frontend-dynamic-feature-loader)
- [Red Hat Developer Hub CLI Documentation](https://github.com/redhat-developer/rhdh-cli/blob/main/README.md)