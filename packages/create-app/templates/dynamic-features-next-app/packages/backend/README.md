# example-dynamic-backend

This package is an EXAMPLE of a Backstage backend with dynamic plugins support.

The main purpose of this package is to provide a test bed for Backstage plugins
that have a backend part. Feel free to experiment locally or within your fork by
adding dependencies and routes to this backend, to try things out.

Our goal is to eventually amend the create-app flow of the CLI, such that a
production ready version of a backend skeleton is made alongside the frontend
app. Until then, feel free to experiment here!

## Development

To run the example backend, first go to the project root and run

```bash
yarn install
```

You should only need to do this once.

After that, go to the `packages/backend` directory and run

```bash
yarn start
```

If you want to override any configuration locally, for example adding any secrets,
you can do so in `app-config.local.yaml`.

The backend starts up on port 7007 per default.

## Populating The Catalog

If you want to use the catalog functionality, you need to add so called
locations to the backend. These are places where the backend can find some
entity descriptor data to consume and serve. For more information, see
[Software Catalog Overview - Adding Components to the Catalog](https://backstage.io/docs/features/software-catalog/#adding-components-to-the-catalog).

To get started quickly, this template already includes some statically configured example locations
in `app-config.yaml` under `catalog.locations`. You can remove and replace these locations as you
like, and also override them for local development in `app-config.local.yaml`.

## Authentication

We chose [Passport](http://www.passportjs.org/) as authentication platform due
to its comprehensive set of supported authentication
[strategies](http://www.passportjs.org/packages/).

Read more about the
[auth-backend](https://github.com/backstage/backstage/blob/master/plugins/auth-backend/README.md)
and
[how to add a new provider](https://github.com/backstage/backstage/blob/master/docs/auth/add-auth-provider.md)


## Dynamic Plugins Overview

This backend is configured with the `@backstage/backend-dynamic-feature-service` which enables loading backend and frontend plugins dynamically at runtime without rebuilding the application.

### How It Works

At startup, the dynamic plugin manager scans the configured root directory (`dynamicPlugins.rootDirectory` in `app-config.yaml`) for plugin packages.
Valid plugins are then loaded dynamically and their features are exposed to the Backstage backend.

### How Plugins Are Detected

The plugin scanner looks for subdirectories in the `dynamicPlugins.rootDirectory` directory. For each subdirectory, it:

1. **Reads `package.json`** - Each plugin directory must contain a valid `package.json`
2. **Validates required fields**:
   - `main` - Entry point for the plugin (e.g., `dist/index.cjs.js`)
   - `backstage.role` - Must be a valid plugin role (see below)
3. **Checks the platform** - Backend plugins (`node` platform) are loaded by the Node.js runtime, while frontend plugins (`web` platform) are served via module federation

### Valid Plugin Roles for Dynamic Loading

The scanner accepts packages with the following roles:

| Role | Platform | Description |
|------|----------|-------------|
| `backend-plugin` | node | A standalone backend plugin |
| `backend-plugin-module` | node | A module that extends a backend plugin |
| `frontend-plugin` | web | A standalone frontend plugin |
| `frontend-plugin-module` | web | A module that extends a frontend plugin |
| `frontend-dynamic-container` | web | A frontend plugin built as a module federation remote |

## Installing a Backend Plugin Dynamically

Here's a step-by-step guide to installing the Kubernetes backend plugin dynamically:

#### Step 1: Export the Plugin for Dynamic Loading

Use the `@redhat-developer-hub/cli` to package the plugin:

```bash
# Navigate to the plugin directory
cd /path/to/plugins/kubernetes-backend

# Export a CLI that packages the plugin for dynamic loading
npx @red-hat-developer-hub/cli plugin export
```

This creates a self-contained package in `dist-dynamic/` with:
- Bundled plugin code (`dist/index.cjs.js`)
- Modified `package.json` with shared dependencies
- Any embedded private dependencies

#### Step 2: Package the Exported Plugin

```bash
# Create a tarball from the exported plugin
npm pack ./dist-dynamic
# This creates a tarball like: backstage-plugin-kubernetes-backend-dynamic-0.20.5.tgz
```

#### Step 3: Install to Dynamic Plugins Directory

```bash
# Create directory for the plugin
mkdir -p ./dynamic-plugins-root/kubernetes-backend

# Extract the tarball
tar -xzf backstage-plugin-kubernetes-backend-dynamic-0.20.0.tgz \
    -C ./dynamic-plugins-root/kubernetes-backend \
    --strip-components=1
```

#### Step 4: Verify the Installation

Your directory structure should look like:

```
dynamic-plugins-root/
└── kubernetes-backend/
    ├── dist/
    │   ├── index.cjs.js
    │   ├── ...other files...
    │   └── configSchema.json (optional)
    ├── node_modules/        (contains optional embedded dependencies)
    └── package.json
```

#### Step 5: Configure the Plugin (if required)

Add any necessary configuration to `app-config.yaml`:

```yaml
kubernetes:
  # see https://backstage.io/docs/features/kubernetes/configuration for kubernetes configuration options
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

#### Step 6: Restart the Backend

The plugin will be automatically detected and loaded on startup:

```bash
yarn start
```

Check the logs for confirmation:

```
info: Loaded dynamic backend plugin '@example/backstage-plugin-kubernetes-backend' from 'file:///path/to/dynamic-plugins-root/kubernetes-backend'
```

### Using Symlinks for Development

During development, you can symlink plugin directories instead of copying:

```bash
# Create a symlink to your local plugin
ln -s /path/to/your-plugin/dist-dynamic ./dynamic-plugins-root/your-plugin
```

The scanner follows symbolic links, making this useful for iterative development.

## Configuration

### Basic Configuration

In `app-config.yaml`:

```yaml
dynamicPlugins:
  # Path to the dynamic plugins directory (relative to backstage root or absolute)
  rootDirectory: dynamic-plugins-root
```

## Dynamic Plugins Troubleshooting

### Plugin not detected
- Verify `package.json` exists in the plugin directory
- Check that `main` field points to a valid entry file
- Ensure `backstage.role` is set correctly

### Plugin Fails due to missing dependencies
- The plugin export process should embed private dependencies not present in the main application.
- Shared `@backstage/*` dependencies are provided by the main application and should be installed as peer dependencies when exporting the plugins as dynamic plugins.


## Documentation

- [Backstage Readme](https://github.com/backstage/backstage/blob/master/README.md)
- [Backstage Documentation](https://backstage.io/docs)
- [Backend Dynamic Feature Service](https://github.com/backstage/backstage/blob/master/packages/backend-dynamic-feature-service/README.md)
