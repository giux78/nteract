## The nteract Release Process

This document outlines logistics around how releases are handled in the nteract project, specifically the applications and npm packages within this repository.

## Release Frequency

Production releases of nteract's npm packages, desktop app, and Jupyter extension will happen on a monthly cadence. Dev releases of nteract's npm packages will happen on a weekly basis. This segmentation allows users who are eager to grab the latest changes to do so at the existing pace of the weekly release cadence. Users who want more stable and less frequent releases can opt to consume from the production tag.

## Release Process for Packages (dev)

lerna will be used to publish packages in the dev channel on a weekly cadence. To publish nteract's npm packages to the dev channel, you must complete the following steps.

1. Ensure that you are on the master branch with the latest changes synced.
2. Create a new branch with the `release/yyyymmdd` naming convention.
   - Note: Before continuing, you will need to push this branch to `origin` using `git push origin HEAD`. This is because `lerna` expects the branch to be exist in the remote before it can push tags.
3. Run `yarn clean && yarn && yarn build:all:ci` and validate that the project builds successfully.
   - Validate that `yarn start` successfully launches the desktop app.
4. Run the `npx lerna publish --dist-tag=prerelease` command in the root of the nteract repo.
   - Use the `pre` version tags for each release. These are the version tags that end with `alpha.x`.
5. Follow the prompts to increment the versions of each package as appropriate.
   - Note that lerna will provide an output that lists the newly published versions of each package. Copy this as it will be relevant in later steps.
6. Create a new Markdown file in the `changelogs` directory that captures the changes in this release.
   - The filename for this Markdown file should follow the `YYYY-MM-DD.md` naming convention.
   - The contents of the file should be based on the `changelogs/changelog_template.md` template file.
7. Commit the changes with the new markdown file.
8. Open a PR against master from your `release/yyyymmdd` branch. In the description of the PR, include the versions of the published npm packages that the `lerna publish` command provides.
9. Merge the PR into master.

## Release Process for Packages (production)

The release process for production packages is the same as the release process for dev packages. However, use `npx lerna publish` in Step #4 to publish the packages to the release channel.

### Publishing Updated Documentation

After the release, you'll need to publish the latest version of the documentation sites. To publish the documentation site for the npm packages you will need to do the following.

1. Ensure that you are added to the nteract team on now. You will need permissions in order to deploy the changes.
2. Navigate to the root of the nteract repo directory.
3. Run the `yarn package:docs:deploy` command. This will deploy a new instance of the site.
4. Run the `yarn package:docs:promote` command. This will map the `packages.nteract.io` domain tothe newly deployed instance.

To publish the documentation site for the components, you will need to do the same steps as above. However, use the `yarn docs:deploy` and `yarn docs:promote` command respectively.

You'll also need to publish the monorepo documentation. To do this, you'll need to have the appropriate [mkdocs](https://www.mkdocs.org/) dependencies.

1. Ensure that `mkdocs` is installed by running `pip install mkdocs`.
2. Ensure that the [mkdocs-monorepo-plugin](https://spotify.github.io/mkdocs-monorepo-plugin/) is installed by running `pip install mkdocs-monorepo-plugin`.
3. Finally, ensure that you have the `gitbook` theme for `mkdocs` installed. This is the theme that we use to style mkdocs. You can install it by running `pip install mkdocs-gitbook`.
4. Run `mkdocs build` to generate the documentation site to a new `site` directory.
5. Run `now site/ --target production --name docs` to deploy the documentation directory.

## Release Process for Desktop App

The nteract desktop app is shipped on a monthly cadence. You can ship nteract desktop releases from any operating system, with one notable exception. Due to technical limitations, macOS releases can only be shipped on macOS. On the topic of macOS...

### A special note for macOS

In order to build a signed copy with working auto-update, you will need to join the Apple developer program and get a certificate. The [Electron docs have a document on submitting your app to the app store](https://github.com/electron/electron/blob/master/docs/tutorial/mac-app-store-submission-guide.md), you only have to get through to the certificate step. Note, that the certificate that you will need to download from the Apple Developer Program portal is called the "3rd Party Mac Developer Application" certificate.

### All platform precursor

To be able to publish a release you'll need to generate a GitHub access token by going to <https://github.com/settings/tokens/new>. The access token should have the `repo` scope/permission. Once you have the token, assign it to an environment variable (on macOS/linux):

```bash
export GH_TOKEN="<YOUR_TOKEN_HERE>"
```

If you are on Windows, you can assign it as an environment using the following command in Command Prompt.

```
> setx GH_TOKEN "<YOUR_TOKEN_HERE>"
```

Note that `setx` will apply the environment variable in subsequence Command Prompt sessions.

**Note: Make sure that your remote origin is set as `git@github.com:nteract/nteract.git`.**

1.  Make sure the release is working by running `yarn dist` and testing the built app inside the `./applications/desktop/dist/` folder. You can build for all platforms using `yarn dist:all`.

2.  Double check that publish will really work by running `yarn verifyBeforePublish` first

3.  Run `npx lerna publish` to publish everything, which also runs the verification steps. You will have to pick versions for everything.

4.  Run the following to ship the built desktop app. This will generate the platform-specific assets and create a draft release on GitHub with the assets.

```
yarn ship:desktop
```

5.  From GitHub go to [nteract's releases](https://github.com/nteract/nteract/releases), verify everything works and edit the release notes. The name should follow our [naming guidelines](https://github.com/nteract/naming), namely that we use the last name of the next scientist in the list with an adjective in front.
    Example:

```bash
Last release: Avowed Avogadro
Next Scientist: Babbage
Next release: Babbling Babbage
```

You can pick alliterative adjectives by using the local dictionary and our friend `grep`:

```bash
$ cat /usr/share/dict/words | grep "^babb"
babbitt
babbitter
babblative
babble
babblement
babbler
babblesome
babbling
babblingly
babblish
babblishly
babbly
babby
```

6.  Once you're ready click "Publish release". On macOS and Windows, the update will be automatically downloaded and installed on user's machines.

## Release Process for the nteract Jupyter Extension

To release the nteract Jupyter Extension, you will need to complete the following steps.

1. Navigate to the `applications/jupyter-extension` directory within the nteract repo.
2. Ensure that you are signed into PyPi on your machine and have permissions to publish the `nteract_on_jupyter` package.
3. Run the `yarn build:python` command.
4. Run the `yarn upload:pypi` command.
