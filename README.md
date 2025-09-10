# Open Git Graph

Open Git Graph is a open source extension for vscode-like IDEs. Its main purpose
is to display a graph of git history. It is inspired by [vscode-git-graph](https://github.com/mhutchie/vscode-git-graph),
but everything was rewritten from ground up to avoid licensing issues.

> [!WARNING]
> This extension is still in early development. Bugs and missing features are to
> be expected.

## Features

- View git history
- View commit details and file changes
- View uncommitted changes
- Switch current branch

## Planned features

- Git actions
  - Fetch
  - Merge current branch
  - Reset current branch
  - Rebase current branch
  - Add/Remove tags
  - Cherry pick commit
  - Revert commits
- Filter displayed branches

## Build from source

Because this extension is still in early development, it is not published
anywhere. Until it is published it needs to be builded and installed from source.
To build it checkout this repository and run following commands:

```
pnpm i
pnpm clean-build
```

This should create a `.vsix` file in `build` directory. To install it run
`Extensions: Install from VSIX...` command in VS Code and select the file.
