import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { CompileSummaryKind } from '@angular/compiler';
import { Consumer } from './rabbitmodules/consumer';
import { Connector } from './rabbitmodules/connector';
import { Producer } from './rabbitmodules/producer';

const {ipcMain} = require('electron');
let win, serve , sendr;
const connector = new Connector('localhost');
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

try {
  require('dotenv').config();
} catch {
  console.log('asar');
}


function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('ping', (event, arg) => {
    console.log(arg); // prints "ping"
    event.sender.send('pong', 'pong');
  });


  ipcMain.on('connectconsumer', (event, arg) => {
    sendr = event.sender;
    console.log('Going to connect consumer');
    event.sender.send('log', 'connectconsumer received with arg:' + arg);

    const queuename = arg;
    if (connector.connected) {
      console.log('rabbitmq connection open');
      const consumer = new Consumer(connector.connection, queuename);
      consumer.connect().then(function(connected) {
        console.log('consumer connected');
        event.sender.send('consumerstate', 'connected');
      }).catch(function(result) {
        console.log('consumer not connected due to: ' +  result);
        event.sender.send('consumerstate', 'disconnected');
      });
    }
  });

  ipcMain.on('connectproducer', (event, arg) => {
    sendr = event.sender;
    console.log('Going to connect producer');
    const queuename = arg;
    event.sender.send('log', 'connectproducer received with arg:' + arg);
    if (connector.connected) {
      console.log('rabbitmq connection open');
      const producer = new Producer(connector.connection, 'queuename');
      producer.connect().then(function(connected) {
        console.log('producer connected');
        event.sender.send('producerstate', 'connected');
      }).catch(function(result) {
        console.log('producer not connected due to: ' +  result);
        event.sender.send('producerstate', 'disconnected');
      });
    }
  });
  // ipcMain.on('ping', (event, arg) => {
  //   console.log(arg); // prints "ping"
  //   event.returnValue = 'pong';
  // });

} catch (e) {
  // Catch Error
  // throw e;
}
