# release-script
Release script to automatically increment version numbers and push git tags. The features include:
* Bump the version in `package.json` (and `package-lock.json`)
* Update the changelog headline with the new version and release date whenever a release is made
* Add the changelog to the release commit and create a tag for it.
* **ioBroker only**:
    * Bump the version in `io-package.json`
    * Update the `news` in `io-package.json` and auto-translate the changelog to the other languages
    * Remove old `news` in order to stay under the limit of 20 entries.

Together with the corresponding **Github Actions** workflow (more on that below) this enables auto-publishing on `npm` and `Github Releases` if the build was successful.

## Installation
1. Add this module to your `devDependencies`:
    ```bash
    npm i -D @alcalzone/release-script
    ```

2. Add a new `npm` script in `package.json`:
    ```json
    "scripts": {
        ... other scripts ...
        "release": "release-script"
    }
    ```

3. Add a placeholder to `README.md` (for your own convenience)
    ```md
    ## Changelog
    <!--
    	Placeholder for the next version (at the beginning of the line):
    	### **WORK IN PROGRESS**
    -->
    ```

    or `CHANGELOG.md` if you prefer to have a separate changelog (notice that there is one less `#`):
    ```md
    # Changelog
    <!--
    	Placeholder for the next version (at the beginning of the line):
    	## **WORK IN PROGRESS**
    -->
    ```

4. If necessary (e.g. for custom versioning steps) use a [config file](#configuration-with-a-config-file)

## Usage
In order to use this script, you need to maintain the changelog in either `README.md` or `CHANGELOG.md`, because every release must have a changelog. To let the script know which changes are new, use the placeholder:
```md
# Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ## **WORK IN PROGRESS**
-->

## **WORK IN PROGRESS**
* Did some changes
* Did some more changes

## v0.0.1 (2020-01-01)
Initial release
```

### Separate changelog for old entries

If you are using `README.md`, the script can automatically move old changelog entries to `CHANGELOG_OLD.md` if that exists. The most recent 5 entries are kept in `README.md`. To use this feature, simply create a `CHANGELOG_OLD.md` and give it a headline you like, e.g.
```md
# Older changes
```

### Add free text in the changelog entry headline
Starting with `v1.8.0`, you can add free text after the placeholder:
```md
## **WORK IN PROGRESS** - 2020 Doomsday release
```
will be turned into
```md
## 1.2.3 (2020-02-02) - 2020 Doomsday release
```
for example.

### Command line

Once you are ready to release the changes, commit everything so the working tree is clean. Also make sure that you are on the `master` branch. Now you can create a release by executing:
```
npm run release [<releaseType> [<postfix>]] [-- [--dry] [--all] [--no-workflow-check]]
```
You can choose between the following release types:
The available release types are:

| Release type | Description / when to use | Example |
|---|---|---|
| `major` | Breaking changes are introduced. This may include new features and bugfixes. | `0.9.8` -> `1.0.0` |
| `premajor` | Like `major`, but to provide test versions before the final release. **WARNING:** Using this multiple times increases the major version each time. | `0.9.8` -> `1.0.0-0` -> `2.0.0-0` |
| `minor` | A new feature was added **without** breaking things. This may include bugfixes. | `0.9.8` -> `0.10.0` |
| `preminor` | Like `minor`, but to provide test versions before the final release. **WARNING:** Using this multiple times increases the minor version each time. | `0.9.8` -> `0.10.0-0` -> `0.11.0-0` |
| `patch` | A bug was fixed without adding new functionality. | `0.9.8` -> `0.9.9` |
| `prepatch` | Like `patch`, but to provide test versions before the final release. **WARNING:** Using this multiple times increases the patch version each time. | `0.9.8` -> `0.9.9-0` -> `0.9.10-0` |
| `prerelease` | Increases only the prerelease suffix. If the current version is not a prerelease, this behaves like `prepatch`. You might want to use this to create multiple test versions (e.g. multiple `premajor` versions) | `0.9.8` -> `0.9.9-0` -> `0.9.9-1` |

For the `pre*` release types, you can optioinally provide a custom postfix, e.g. `beta`. For example, `npm run release prepatch beta` would result in the following bump: `0.9.8 -> 0.9.9-beta.0`.

### Test run

The release script makes it possible to test the command before actually changing anything. To do so, use the `--dry` argument. Take care to include the first set of hyphens (`-- --dry`) in the command or **it won't be a dry run**. Here's an example of a dry run that tells you what it would do and that it would fail due to uncommitted changes:  
![dry run](./docs/dryrun.png)

### Include other changes in the release commit
Although the release commit should only include the changes relevant to the version increase, sometimes it makes sense to include other changes in the release commit. For this purpose, you can use the `--all` option, e.g.:
```bash
npm run release patch -- --all
```

### Skip the release workflow check
The release script tries to find common errors in the Github Actions release workflow file. If the check results in a false positive, you can disable this check with the `--no-workflow-check` option.

```bash
npm run release patch -- --no-workflow-check
```

This can also be configured with `noWorkflowCheck: true` in the config file.

### Using a different remote than `origin`
If the remote you want to push to is not called `origin`, you can use the `r` flag to specify a different one (after the double dashes!)  
Make sure to use the complete remote branch name:

```bash
npm run release patch -- -r upstream/master
```

### lerna mode
If you are managing a monorepo with lerna, two additional options are available starting with v1.6.0. `--lerna` puts the release-script into lerna mode, which offloads all version increases to lerna. `--lerna-check` runs some checks regarding the changelog and then exits before doing any actual work. `--lerna-check` implies `--lerna`. 
For lerna mode to work, you need to configure lerna as follows
```jsonc
// lerna.json
{
	"version": "1.2.3", // must be fixed versioning, independent does not work!
	"command": {
		"version": {
			"amend": true // required, otherwise release-script cannot put the changelog into the commit body
		}
	}
}
```
and use the following package scripts:
```jsonc
// package.json
{
  // ...
  "scripts": {
    // ...
    "release": "lerna version",
    "preversion": "release-script --lerna-check",
    "version": "release-script --lerna",
    "postversion": "git push && git push --tags"
  }
}
```

### Configuration with a config file
Instead of manually providing all options, you can configure the release process with a configuration file. By default, the script looks for a `.releaseconfig.json` in the current working directory. To change the filename, you can use the `-c` flag (after the double dashes!), e.g. `release-script -- -c my-super-duper-config.json`.

If an option is configured in this file, it will have precedence over CLI arguments. Here's a list of the supported options (they are all optional):
```jsonc
{
  "all": true, // Always include all changes in the release commit
  "lerna": true, // Enable lerna mode
  // Run custom scripts as part of the release process
  "scripts": {
    "beforePush": "npm run build", // runs after bumping the versions etc. but before pushing to git
  }
}
```

To execute multiple commands in sequence, you can also use an array of strings:
```jsonc
{
  "scripts": {
    "beforePush": [
      "echo 'this script is so cool'",
      "npm run build",
    ]
  }
}
```

## Workflow file for automatic release
When using Github Actions, you can enable automatic release on `npm` and `Github Releases` after a tagged build was successful. To do so, include the following job in your workflow definition file (e.g. `.github/workflows/test-and-release.yml`) and configure it to depend on the build jobs (here, they are called `unit-tests`).
The workflow must be configured to run when tags are pushed.

Furthermore, you need to create a token in your npm account and add it to your repository secrets with the name `NPM_TOKEN`.
```yml
# Run this workflow on all pushes and pull requests
# as well as tags with a semantic version
on:
  push:
    # Configure your tested branches here, I like to check all of them. You can leave this out if you only want to deploy
    branches:
      - "*"
    # You MUST limit tags to ones that are compatible with the version scheme this script uses. DO NOT include any others or they will be released aswell
    tags:
      # normal versions
      - "v[0-9]+.[0-9]+.[0-9]+"
      # pre-releases
      - "v[0-9]+.[0-9]+.[0-9]+-**"
  # This runs the workflow for all pull requests. You can leave this out if you only want to deploy
  pull_request: {}

jobs:
#
# ... your other jobs go here ...
#

  # Deploys the final package to NPM and Github Actions
  deploy:
    # Trigger this step only when a commit on master is tagged with a version number
    if: |
      contains(github.event.head_commit.message, '[skip ci]') == false &&
      github.event_name == 'push' &&
      startsWith(github.ref, 'refs/tags/v')

    # Define which jobst must succeed before the release
    needs: [unit-tests]

    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x]

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}

    - name: Extract the version and commit body from the tag
      id: extract_release
      # The body may be multiline, therefore we need to escape some characters
      run: |
        VERSION="${{ github.ref }}"
        VERSION=${VERSION##*/v}
        echo "::set-output name=VERSION::$VERSION"
        BODY=$(git show -s --format=%b)
        BODY="${BODY//'%'/'%25'}"
        BODY="${BODY//$'\n'/'%0A'}"
        BODY="${BODY//$'\r'/'%0D'}"
        echo "::set-output name=BODY::$BODY"

    # If you are using TypeScript, additional build steps might be necessary
    # Run them here, e.g.:
    # - name: Install dependencies
    #   run: npm ci
    # - name: Create a clean build
    #   run: npx gulp build

    - name: Publish package to npm
      run: |
        npm config set //registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}
        npm whoami
        npm publish

    - name: Create Github Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release v${{ steps.extract_release.outputs.VERSION }}
        draft: false
        # Prerelease versions create prereleases on Github
        prerelease: ${{ contains(steps.extract_release.outputs.VERSION, '-') }}
        body: ${{ steps.extract_release.outputs.BODY }}
```

## License
MIT License

Copyright (c) 2019-2020 AlCalzone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
