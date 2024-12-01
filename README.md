# Scratchpad

> Hosted on: https://penguinmenac3.github.io/scratchpad/

Manage your notes. The app is a static webpage that can be installed as an app.
It uses local storage inside the browser to autosave your data and allows exporting and importing to and from scratchpad csv files.
This way, data never leaves your control!

## Usage

To include the code in your project and adapt it to your needs, simply add the lib submodule as a submodule to your project, just like it has been done here.
We opted to not distribute the code as a full node library, so that it is compatible with any build system as long as you use typescript.

To run the code open it in a devcontainer (vscode) and run `npm run dev` or `npm run build`. If you entounter an error or do not use devcontainers, run `npm install` manually.

## Contribute

1. Clone the repository (with `--recursive`).
1. Install docker or podman.
2. Install the devcontainer vscode extension.
3. Open the workspace in a container in vscode.
4. Add your changes.
5. Submit a pull request.

### Git support in container

To support git in the container, you must have a ssh-agent setup to share your keys with the container.

```bash
ssh-add $HOME/.ssh/<your private key>
```

On windows there are usually some additional steps required.
You have to update your ssh if it is outdated.
And add ssh-agent to your services so it runs in the background.
After you did that the ssh-add commant should have no errors and your container should see the keys.

```powershell
# Check SSH version
ssh -V  # if >=8.9 you are fine, otherwise install beta

# Install the beta openssh (until)
winget install "OpenSSH Beta"

# If ssh-add errors, run this in an ADMIN powershell
Set-Service ssh-agent -StartupType Automatic
Start-Service ssh-agent
Get-Service ssh-agent
```

I would recommend a reboot after the setup to make sure the new versions are used.

## Build the app for release

Run the build command, add and commit the dist folder and then push this folger to gh-pages.
```bash
npm run build
rm dist/favicon.xcf
git add -f dist
git commit -m "Build gh-pages."
git push
git subtree push --prefix dist origin gh-pages
```
