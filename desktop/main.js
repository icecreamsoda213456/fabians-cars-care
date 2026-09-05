import {
  app,
  BrowserWindow,
  dialog,
  session,
} from 'electron';
import squirrelStartup from 'electron-squirrel-startup';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

if (squirrelStartup) {
  app.quit();
}

const appUserModelId = 'ph.fabianscarcare.pos';
const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
}

let activeAppUrl = '';
let mainWindow = null;
let serverModule = null;
let shutdownStarted = false;

function ensureLocalJwtSecret() {
  const secretPath = path.join(app.getPath('userData'), '.local-session-secret');
  fs.mkdirSync(path.dirname(secretPath), { recursive: true });

  if (!fs.existsSync(secretPath)) {
    fs.writeFileSync(secretPath, crypto.randomBytes(48).toString('hex'), {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600,
    });
  }

  return fs.readFileSync(secretPath, 'utf8').trim();
}

function resolveDatabasePath() {
  const bundledDatabasePath = path.join(
    app.getAppPath(),
    'backend',
    'data',
    'fabians-pos.sqlite'
  );

  if (!app.isPackaged) {
    return bundledDatabasePath;
  }

  const dataDirectory = path.join(app.getPath('userData'), 'data');
  const localDatabasePath = path.join(dataDirectory, 'fabians-pos.sqlite');
  fs.mkdirSync(dataDirectory, { recursive: true });

  if (!fs.existsSync(localDatabasePath) && fs.existsSync(bundledDatabasePath)) {
    fs.copyFileSync(bundledDatabasePath, localDatabasePath, fs.constants.COPYFILE_EXCL);
  }

  return localDatabasePath;
}

function backupFileName() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');
}

async function createDailyBackup(databasePath) {
  const backupDirectory = path.join(path.dirname(databasePath), 'backups');
  const backupPath = path.join(
    backupDirectory,
    `fabians-pos-${backupFileName()}.sqlite`
  );

  if (!fs.existsSync(backupPath)) {
    await serverModule.backupDatabase(backupPath);
  }

  const backups = fs.readdirSync(backupDirectory)
    .filter((name) => /^fabians-pos-\d{4}-\d{2}-\d{2}\.sqlite$/.test(name))
    .sort()
    .reverse();

  for (const oldBackup of backups.slice(14)) {
    fs.unlinkSync(path.join(backupDirectory, oldBackup));
  }
}

function configureSessionSecurity(appOrigin) {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (!details.url.startsWith(appOrigin)) {
      callback({ responseHeaders: details.responseHeaders });
      return;
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
        ],
      },
    });
  });
}

function secureWindowNavigation(window, appOrigin) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const target = new URL(url);
      if (target.origin !== appOrigin) return { action: 'deny' };

      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 940,
          height: 900,
          minWidth: 620,
          minHeight: 680,
          backgroundColor: '#071b1e',
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      };
    } catch {
      return { action: 'deny' };
    }
  });

  window.webContents.on('will-navigate', (event, url) => {
    try {
      if (new URL(url).origin !== appOrigin) event.preventDefault();
    } catch {
      event.preventDefault();
    }
  });
}

function createMainWindow(appUrl) {
  const appOrigin = new URL(appUrl).origin;
  const window = new BrowserWindow({
    title: "Fabian's Car Care POS",
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    backgroundColor: '#071b1e',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  secureWindowNavigation(window, appOrigin);
  window.once('ready-to-show', () => {
    window.show();
    window.focus();
  });
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null;
  });
  window.loadURL(appUrl);
  return window;
}

async function startDesktopApp() {
  const databasePath = resolveDatabasePath();
  const frontendDistDirectory = path.join(app.getAppPath(), 'frontend', 'dist');

  process.env.APP_ENV = 'production';
  process.env.PORT = '0';
  process.env.SQLITE_DB_PATH = databasePath;
  process.env.FRONTEND_DIST_DIR = frontendDistDirectory;
  process.env.JWT_SECRET = ensureLocalJwtSecret();

  const apiModule = await import('../backend/src/server.js');
  const databaseModule = await import('../backend/src/db.js');
  serverModule = { ...apiModule, ...databaseModule };

  const server = await apiModule.startServer({ listenPort: 0, host: '127.0.0.1' });
  const address = server.address();
  activeAppUrl = `http://127.0.0.1:${address.port}`;
  configureSessionSecurity(activeAppUrl);
  await createDailyBackup(databasePath);
  mainWindow = createMainWindow(activeAppUrl);
}

async function shutdown() {
  if (shutdownStarted) return;
  shutdownStarted = true;
  await serverModule?.stopServer?.();
}

app.setAppUserModelId(appUserModelId);

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

app.whenReady()
  .then(startDesktopApp)
  .catch((error) => {
    console.error(error);
    dialog.showErrorBox(
      "Fabian's Car Care POS could not start",
      `${error.message}\n\nThe existing PostgreSQL database was not changed.`
    );
    app.quit();
  });

app.on('activate', () => {
  if (!mainWindow && activeAppUrl) {
    mainWindow = createMainWindow(activeAppUrl);
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', (event) => {
  if (shutdownStarted) return;
  event.preventDefault();
  shutdown()
    .catch((error) => console.error('Failed to close the local database cleanly', error))
    .finally(() => app.quit());
});
