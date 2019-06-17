# Slye
Slye is a desktop application which helps users to create 3D presentations.
| ![](./screenshots/1.png | width=100) | ![](./screenshots/2.png | width=100) | ![](./screenshots/3.png | width=100) |
| ![](./screenshots/4.png | width=100) | ![](./screenshots/5.png | width=100) | ![](./screenshots/6.png | width=100) |

## Directory structure
There are 3 main units in this project, `core`, `frontend` and `electron`.

Although we are using electron, we are not using node integration in our
frontend for security purposes and also we hope that one day we might be
able to use the exact code to target for web browser.

### `core`
This directory contains all the abstractions and the internal API to deal with a
Slye presentation and modules.

### `frontend`
User interface built using `React`, we are using Electron's IPC to communicate
between frontend and the electron land (A.K.A server) at the moment.

## `electron`
Codes for the main process.

## Contributions
Once you've cloned the repository locally you can start hacking.
```
git clone https://github.com/qti3e/Slye.git
cd Slye
yarn
yarn dev
```

## Producing a release version
```
# To build for linux
npx gulp release:linux64
# To build for windows
npx gulp release:win32
```
