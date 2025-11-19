codearena-cli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/codearena-cli.svg)](https://npmjs.org/package/codearena-cli)
[![Downloads/week](https://img.shields.io/npm/dw/codearena-cli.svg)](https://npmjs.org/package/codearena-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g codearena-cli
$ codearena-cli COMMAND
running command...
$ codearena-cli (--version)
codearena-cli/0.0.0 darwin-arm64 node-v22.11.0
$ codearena-cli --help [COMMAND]
USAGE
  $ codearena-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`codearena-cli hello PERSON`](#codearena-cli-hello-person)
* [`codearena-cli hello world`](#codearena-cli-hello-world)
* [`codearena-cli help [COMMAND]`](#codearena-cli-help-command)
* [`codearena-cli plugins`](#codearena-cli-plugins)
* [`codearena-cli plugins add PLUGIN`](#codearena-cli-plugins-add-plugin)
* [`codearena-cli plugins:inspect PLUGIN...`](#codearena-cli-pluginsinspect-plugin)
* [`codearena-cli plugins install PLUGIN`](#codearena-cli-plugins-install-plugin)
* [`codearena-cli plugins link PATH`](#codearena-cli-plugins-link-path)
* [`codearena-cli plugins remove [PLUGIN]`](#codearena-cli-plugins-remove-plugin)
* [`codearena-cli plugins reset`](#codearena-cli-plugins-reset)
* [`codearena-cli plugins uninstall [PLUGIN]`](#codearena-cli-plugins-uninstall-plugin)
* [`codearena-cli plugins unlink [PLUGIN]`](#codearena-cli-plugins-unlink-plugin)
* [`codearena-cli plugins update`](#codearena-cli-plugins-update)

## `codearena-cli hello PERSON`

Say hello

```
USAGE
  $ codearena-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ codearena-cli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/JustForFUn/codearena-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `codearena-cli hello world`

Say hello world

```
USAGE
  $ codearena-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ codearena-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/JustForFUn/codearena-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `codearena-cli help [COMMAND]`

Display help for codearena-cli.

```
USAGE
  $ codearena-cli help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for codearena-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/commands/help.ts)_

## `codearena-cli plugins`

List installed plugins.

```
USAGE
  $ codearena-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ codearena-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/index.ts)_

## `codearena-cli plugins add PLUGIN`

Installs a plugin into codearena-cli.

```
USAGE
  $ codearena-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into codearena-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the CODEARENA_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the CODEARENA_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ codearena-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ codearena-cli plugins add myplugin

  Install a plugin from a github url.

    $ codearena-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ codearena-cli plugins add someuser/someplugin
```

## `codearena-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ codearena-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ codearena-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/inspect.ts)_

## `codearena-cli plugins install PLUGIN`

Installs a plugin into codearena-cli.

```
USAGE
  $ codearena-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into codearena-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the CODEARENA_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the CODEARENA_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ codearena-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ codearena-cli plugins install myplugin

  Install a plugin from a github url.

    $ codearena-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ codearena-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/install.ts)_

## `codearena-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ codearena-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ codearena-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/link.ts)_

## `codearena-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ codearena-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codearena-cli plugins unlink
  $ codearena-cli plugins remove

EXAMPLES
  $ codearena-cli plugins remove myplugin
```

## `codearena-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ codearena-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/reset.ts)_

## `codearena-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ codearena-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codearena-cli plugins unlink
  $ codearena-cli plugins remove

EXAMPLES
  $ codearena-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/uninstall.ts)_

## `codearena-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ codearena-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codearena-cli plugins unlink
  $ codearena-cli plugins remove

EXAMPLES
  $ codearena-cli plugins unlink myplugin
```

## `codearena-cli plugins update`

Update installed plugins.

```
USAGE
  $ codearena-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/update.ts)_
<!-- commandsstop -->
