const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.ico')
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('closed', () => {
    store.clear();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const pronounceablePairs = ['th', 'ch', 'ph', 'sh', 'br', 'tr', 'dr', 'cr', 'fr', 'gr'];
const vowels = ['a', 'e', 'i', 'o', 'u'];

function generatePronounceable(length) {
  let result = '';
  while (result.length < length) {
    if (Math.random() > 0.5) {
      result += pronounceablePairs[Math.floor(Math.random() * pronounceablePairs.length)];
    } else {
      result += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  return result.slice(0, length);
}

ipcMain.on('generate-password', (event, options) => {
  let password;
  if (options.pronounceable) {
    password = generatePronounceable(options.length);
  } else {
    password = generatePassword(options);
  }
  
  const passwords = store.get('passwords', []);
  store.set('passwords', [...passwords, password]);
  event.reply('password-generated', password);
});

ipcMain.on('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
});

function generatePassword(options) {
  let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercase = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '0123456789';
  let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (options.avoidAmbiguous) {
    uppercase = uppercase.replace(/[O]/g, '');
    lowercase = lowercase.replace(/[l]/g, '');
    numbers = numbers.replace(/[0|1]/g, '');
  }

  let chars = '';
  if (options.hasUpper) chars += uppercase;
  if (options.hasLower) chars += lowercase;
  if (options.hasNumbers) chars += numbers;
  if (options.hasSymbols) chars += symbols;

  if (chars === '') chars = lowercase;

  let password = '';
  if (options.noRepeats) {
    const charArray = chars.split('');
    for (let i = 0; i < Math.min(options.length, charArray.length); i++) {
      const index = Math.floor(Math.random() * charArray.length);
      password += charArray[index];
      charArray.splice(index, 1);
    }
  } else {
    for (let i = 0; i < options.length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return password;
}