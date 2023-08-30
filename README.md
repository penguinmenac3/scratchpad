# Scratchpad

> Hosted on: https://penguinmenac3.github.io/scratchpad/

Manage your notes. The app is a static webpage that can be installed as an app and connects to a WebFS backend or just uses local storage. Your data can be stored locally or on your WebFS Server giving you full control over your data.

## Start APP Development Server

Simply start the lightning dev server using:
```bash
npm run dev
```

## Start WebFS Test Server

Start a PHP server within the `src/WebFS` folder.
```bash
cd src/WebFS
php -S localhost:8080
```

## Build the app for release

Run the build command, add and commit the dist folder and then push this folger to gh-pages.
```bash
npm run build
rm dist/favicon.kra
git add -f dist
git commit -m "Build gh-pages."
git push
git subtree push --prefix dist origin gh-pages
```
