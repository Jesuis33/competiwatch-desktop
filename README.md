# Competiwatch Desktop

[![Actions Status](https://github.com/cheshire137/competiwatch-desktop/workflows/Node%20CI/badge.svg)](https://github.com/cheshire137/competiwatch-desktop/actions)

**[Download the app](https://github.com/cheshire137/competiwatch-desktop/releases/latest)** - [see what's new](./CHANGELOG.md)

This is a desktop app for Windows and macOS to track
your competitive match history in Overwatch. I wanted to see
my progress over time, more than what the game or sites like
Overbuff provide. The app lets you see which heroes you're performing
best on, which roles, whether you do better on weekday mornings or
weekend evenings, whether joining voice chat helps your win rate,
that sort of thing.

![Screenshot of match history](https://raw.githubusercontent.com/cheshire137/competiwatch-desktop/main/screenshots/matches-macos-roles.png)

![Screenshot of log match form](https://raw.githubusercontent.com/cheshire137/competiwatch-desktop/main/screenshots/log-match-role-queue.png)

![Screenshot of trends page](https://raw.githubusercontent.com/cheshire137/competiwatch-desktop/main/screenshots/screenshot-trends.png)

![Screenshot of settings page](https://raw.githubusercontent.com/cheshire137/competiwatch-desktop/main/screenshots/screenshot-settings.png)

![Screenshot of accounts page](https://raw.githubusercontent.com/cheshire137/competiwatch-desktop/main/screenshots/accounts-list.png)

See [the changelog](./CHANGELOG.md) for what has changed each version.

## Features

- Track matches across different roles, Battle.net accounts, and competitive seasons
- Log details such as your new SR, which people you played with, whether you were in a 6-stack or solo queuing, what time you played, whether you got Play of the Game, which heroes you played, and what map you played
- Export your match history as a CSV file (Comma-Separated Value)
- Import your match history for past seasons
- View charts summarizing your season
- Log your placement matches and regular season games
- See when you go on win streaks or loss streaks
- Choose between a dark and light theme, or automatic based on time of day
- Works in Windows and macOS

## How to Install

For version 1.9 and later, download the Windows installer from the [latest release](https://github.com/cheshire137/competiwatch-desktop/releases/latest). I've tested this on Windows 7 and Windows 10. Just run the installer and a Competiwatch shortcut will be added to your desktop.

You can also download the non-installer version and unzip the folder wherever you'd like. Run the app via the Competiwatch.exe executable in that folder.

You will probably be prompted by Windows that the app is unrecognized; the message in Windows 10 reads "Windows SmartScreen prevented an unrecognized app from starting." Sorry about that, it's [being worked on](https://github.com/cheshire137/competiwatch-desktop/issues/34). You can choose to run the app anyway (hit "more info" in Windows 10) and it shouldn't prompt you again for that version.

## How to Uninstall

If you installed via the installer in Windows, just use the Control Panel and Add/Remove Programs to uninstall Competiwatch. The shortcut should be removed from your desktop.

If you did not use the installer, you can just delete the folder that has Competiwatch.exe in it, wherever you unzipped that folder.

## How to Develop

This app was built with node version 12.4.0 and npm version 6.9.0. See [the contributing guidelines](./CONTRIBUTING.md).

```bash
npm install
npm run dev
```

The app should launch and also open in your browser. You can close the
browser tab.

### Log Files

While you run the app, Electron logs will end up in the following places:

- on macOS: `~/Library/Logs/Competiwatch/log.log`
- on Windows: `%USERPROFILE%\AppData\Roaming\Competiwatch\log.log`
- on Linux: `~/.config/Competiwatch/log.log`

React logs will show in your terminal. You can run
`tail -f ~/Library/Logs/Competiwatch/log.log` in macOS in a separate
terminal from `npm run dev` to monitor Electron logs while the app is running.

## How to Run Tests

```bash
npm install
npm test
npm run check-format
```

To see test coverage, run `npm test -- --coverage`. A coverage report will
display in your terminal or you can open coverage/lcov-report/index.html in
your browser.

Please run `npm run fix-format` on your files before opening a pull request.
This will format your JavaScript, TypeScript, and JSON.

## How to Build Executables

For macOS, from a Mac run:

```bash
# produce a new directory in dist/ that has a distributable .app file:
npm run electron-build-macos
```

For Windows, from a Windows machine run:

```bash
# produce dist/Competiwatch-win32-x64/ with .exe files:
npm run electron-build-windows

# generate an installer in dist/installers/:
npm run electron-build-windows-installer
```
