// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const os = require('os');
const fs = require('node:fs');
const osu = require('node-os-utils');
const { spawn } = require('child_process');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds] });

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000, minWidth: 1000, maxWidth: 2000,
    height: 650, minHeight: 650, maxHeight: 650,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

const log = [];
const originalWrite = process.stdout.write;
process.stdout.write = function(chunk, encoding, callback) {
    log.push(chunk.toString());
    originalWrite.apply(process.stdout, arguments);
    // Burada Electron ana sürecine mesaj göndereceksiniz
    mainWindow.webContents.send('console-output', chunk.toString());
};


ipcMain.on('start-node-app', (event) => {
  // Node.js uygulamanızı başlatma
  childProcess = spawn('node', ['C:\\Users\\scray\\OneDrive\\Masaüstü\\discord-v14\\electron\\electron-Dashboard\\index.js']); // Uygulamanızın yolunu belirtin

  childProcess.stdout.on('data', (data) => {
    const output = data.toString().trim(); // Çıktıyı string'e çevir
    console.log('Node app output:', output); // Konsola yazdır

    // Renderer işlemine çıktıyı gönder
    event.sender.send('update-textarea', output);
  });

  childProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString().trim();
    console.error('Node app error:', errorOutput);
  });

  childProcess.on('close', (code) => {
    console.log(`Node app exited with code ${code}`);
  });
});







  async function findDominantColor(imageUrl) {
    var dominantColor = "35, 30, 53";
  }
  
  function applyDominantColor(color) {
    var dominantDiv = document.getElementById("dominantDiv");
    dominantDiv.style.backgroundColor = "rgb(" + color + ")";
  }

  async function tryLogin(token) {
    try {
      await client.login(token);
      // Giriş başarılı olduysa diğer işlemleri yapabilirsiniz
      client.destroy();
      return array;
    } catch (err) {
      console.error('Token hatalı.');
      return false;
    }
  }

  async function getLogin(token, array) {
    try {
      await client.login(token);
      console.log(`${client.user.username}(${client.user.id}), botuna giriş yapıldı.`);

      let memberCount = 0;
      let avatarURL = `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png?size=512`;
      let dominantColor = "#FFFFFF"; //await findDominantColor(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png`);

      array.push(avatarURL);
      array.push(dominantColor);
      array.push(client.user.username);
      array.push(client.user.tag);
      array.push(client.user.id);
      array.push(memberCount);
      array.push(client.guilds.cache.size);

      console.log(`Erişilen: Sunucu: ${client.guilds.cache.size}, Kullanıcı: ${memberCount}`);


      // Giriş başarılı olduysa diğer işlemleri yapabilirsiniz
      client.destroy();
      return array;
    } catch (err) {
      console.error('Token hatalı veya profil isteminde hata oluştu...');
      console.log(err);
      return false;
    }
  }

  async function getClientId(token) {
    try {
      await client.login(token);
      let clientid = client.user.id;
      client.destroy();
      return clientid.toString();
    } catch (err) {
      console.error('Hata.');
      return false;
    }
  }

  async function changeConfig(token, clientid) {
    const configPath = '../electron-Dashboard/config.json';
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    config.token = token;
    config.clientId = clientid
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    app.relaunch()
    app.exit()
  }

  async function getCPUUsage() {
    try {
      const info = await osu.cpu.usage();
      return info;
    } catch (error) {
      console.error('Error getting CPU usage:', error);
    }
  }


////////////////////////////////////////////////////////////////////////////


  
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  ipcMain.on('closeApp', () => {
    console.log('..Exit..');
    mainWindow.close();
  });

  ipcMain.on('miniApp', async (event, arg) => {
    console.log('..Minimize..');
    event.reply('miniAppReply', 'Ana iş parçacığından gelen yanıt!');
    mainWindow.minimize();
  });

  ipcMain.on('updateSystem', async () => {

    const platform = os.platform();
    const architecture = os.arch();
    const release = os.release();

    const freeMemoryInBytes = os.freemem();
    const totalMemoryInBytes = os.totalmem();
    const usedMemoryInBytes = totalMemoryInBytes - freeMemoryInBytes;
    var percentage_used = (usedMemoryInBytes / totalMemoryInBytes) * 100;

    const totalMemoryInGB = (totalMemoryInBytes / (1024 ** 3)).toFixed(2);
    const freeMemoryInGB = (freeMemoryInBytes / (1024 ** 3)).toFixed(2);

    const configPath = './log.json';
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    config.os = platform + " " + architecture + " " + release;
    config.cpu = (os.cpus()[0].model).trim();
    config.cpu_usage = await getCPUUsage();
    config.ram = totalMemoryInGB;
    config.ram_usage = percentage_used.toFixed(2);

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  });

  ipcMain.on('checkConfig', async (event, data) => {
    console.log('Başlatılıyor...');

    const configPath = '../electron-Dashboard/config.json';
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    let denme = [];
    const login = await getLogin(config.token, denme);
    if(login){
      event.reply('changeProfile', login);
      event.reply('replyConfig', true);
    } else {
      event.reply('replyConfig', false);
    }
  });

  ipcMain.on('openConfig', async (event, data) => {
    require('child_process').exec(`explorer.exe /select,"${path.join(__dirname, '../electron-Dashboard/config.json')}"`);
  });

  ipcMain.on('testToken', async (event, data) => {
    if (data) {
      if (await tryLogin(data)) {
        changeConfig(data, await getClientId(data));
      } else {
        event.reply('refuseToken');
      }
    } else {
      return; // do nothing.
    }
  });


  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
