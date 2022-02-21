/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, Menu, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
const exec = require('child_process').exec;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    // autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.setFeedURL(
      'http://172.16.60.200/IFAssets/autoUpdater/IFNode/latest/'
    );
    autoUpdater.on('error', function (error) {
      console.log('error');
    });
    autoUpdater.on('checking-for-update', function (message) {
      console.log('checking');
    });
    autoUpdater.on('update-available', function (message) {
      console.log('available');
    });
    autoUpdater.on('update-not-available', function (message) {
      console.log('not available');
    });
    autoUpdater.on('update-downloaded', function (event) {
      console.log('Downloaded');
    });
    setInterval(() => {
      console.log('checking');
      autoUpdater.checkForUpdates();
    }, 60000);
  }
}

let mainWindow: BrowserWindow | null = null;
let tray = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
    // frame: false,
  });

  if (process.argv.length >= 2 && process.argv[1] == '-dev') {
    mainWindow.webContents.toggleDevTools();
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);
app.whenReady().then(() => {
  tray = new Tray('assets/icon.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('InteractionFree Node');
  tray.setContextMenu(contextMenu);
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('ready', () => {
  const exePath = app.getPath('exe');
  const isInDev = exePath.endsWith('electron.exe');
  const extRoot = isInDev
    ? path.dirname(path.dirname(path.dirname(path.dirname(exePath))))
    : path.join(path.dirname(exePath), 'resources');
  const appDataPath = app.getPath('appData');

  const pythonExe = path.join(extRoot, 'runtime/python/python.exe');
  const pythonScripts = path.join(extRoot, 'scripts');
  // const IFNodeScript = path.join(pythonScripts, 'IFNode.py');
  const IFNodeScript = 'IFNode.py';

  const updateRootURL = 'http://172.16.60.200/IFAssets/IFNodeApplications/';
  const localRootPath = path.join(
    appDataPath,
    'InteractionFreeNode/applications/'
  );

  const workerProcess = exec(pythonExe + ' ' + IFNodeScript, {
    cwd: pythonScripts,
  });
  workerProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
  workerProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  workerProcess.on('close', function (code) {
    console.log('out code：' + code);
  });
  workerProcess.stdin.write(updateRootURL + '\n' + localRootPath + '\n');
});
