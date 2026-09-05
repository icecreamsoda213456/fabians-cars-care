module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'FabiansCarCarePOS',
    appBundleId: 'ph.fabianscarcare.pos',
    win32metadata: {
      CompanyName: "Fabian's Car Care",
      FileDescription: "Fabian's Car Care POS",
      ProductName: "Fabian's Car Care POS",
      InternalName: 'FabiansCarCarePOS',
      OriginalFilename: 'FabiansCarCarePOS.exe',
    },
    ignore: [
      /^\/\.agents(?:\/|$)/,
      /^\/\.git(?:\/|$)/,
      /^\/\.vscode(?:\/|$)/,
      /^\/(?:includes|layouts|libs|uploads)(?:\/|$)/,
      /^\/frontend\/(?:node_modules|src|public)(?:\/|$)/,
      /^\/frontend\/(?:package-lock\.json|package\.json|vite\.config\.js)$/,
      /^\/backend\/(?:node_modules|test)(?:\/|$)/,
      /^\/backend\/\.env(?:\.|$)/,
      /^\/backend\/data\/(?:backups|pre-import-backup)(?:\/|$)/,
      /^\/backend\/data\/.*\.sqlite-(?:shm|wal)$/,
      /^\/backend\/src\/migrate-postgres-to-sqlite\.js$/,
      /^\/(?:.*\.php|inventorydb\.sql|debug\.log|LIVE_SHARE_FRONTEND_SETUP\.md|POSTGRES_REBUILD_SETUP\.md)$/,
      /^\/out(?:\/|$)/,
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'FabiansCarCarePOS',
        authors: "Fabian's Car Care",
        description: "Fabian's Car Care offline POS and inventory system",
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
};
