import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { CompileSummaryKind } from '@angular/compiler';
import { Consumer } from './rabbitmodules/consumer';
import { Connector } from './rabbitmodules/connector';
import { Producer } from './rabbitmodules/producer';

const {ipcMain} = require('electron');
const producers: Producer[] = [];
const consumers: Consumer[] = [];
let subscriptionchannels: any[] = [];
const exchanges: any[] = [];
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
    webPreferences: {
      webSecurity: false
    },
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  // if (serve) {
    console.log('localhost load');
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL('http://localhost:4201');
  // } else {
  //   console.log('File load');
  //   win.loadURL(url.format({
  //     pathname: path.join(__dirname, 'dist/index.html'),
  //     protocol: 'file:',
  //     slashes: true
  //   }));
  // }

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
        event.sender.send('queueconnected', {queuename: queuename, type: 'consumer' });
        consumer.consume(messageReceived);
      }).catch(function(result) {
        console.log('consumer not connected due to: ' +  result);
        event.sender.send('consumerstate', 'disconnected');
      });
    }
  });

  ipcMain.on('exchangemessage', (event, arg) => {
    sendr = event.sender;
    const exchangename = arg.exchange;
    const message = arg.message;
    const routingkey = arg.routingkey.toLowerCase();
    const exchange = exchanges.filter(element =>  element.exchange === exchangename)[0];
    if (exchange && exchange !== undefined && exchange !== null) {
    exchange.channel.publish(exchangename, routingkey, new Buffer(JSON.stringify(message)));
    sendr.send('messageExchanged', {exchange: exchange.exchange, routingkey: routingkey, message: message});
    } else {
      connector.connection.createChannel(function(err, ch) {
        ch.assertExchange(exchangename, 'topic', {durable: false});
        exchanges.push({exchange: exchangename, channel: ch});
        sendr.send('exchangecreated', {exchange: exchangename});
        ch.publish(exchangename, routingkey, new Buffer(JSON.stringify(message)));
        sendr.send('messageExchanged', {exchange: exchangename, routingkey: routingkey, message: message});
      });
    }
  });

  ipcMain.on('createexchange', (event, arg) => {
    sendr = event.sender;
    const exchange = arg.exchange;
    connector.connection.createChannel(function(err, ch) {
      ch.assertExchange(exchange, 'topic', {durable: false});
      exchanges.push({exchange: exchange, channel: ch});
      sendr.send('exchangecreated', {exchange: exchange});
    });
  });

  ipcMain.on('subscribeexchange', (event, arg) => {
    const exchange = arg.exchange;
    const routingkey = arg.routingkey;
    connector.connection.createChannel(function(err, ch) {
      ch.assertExchange(exchange, 'topic', {durable: false});
      ch.assertQueue('', {exclusive: true}, function(err, q) {
        ch.bindQueue(q.queue, exchange, routingkey);
        ch.consume(q.queue, function(msg) {
          sendr.send('exchangemessagereveived', {exchange: exchange, routingkey: routingkey, message: msg.content.toString()});
        }, {noAck: true});
      });
    });
  });

  ipcMain.on('setsubscriptions', (event, arg) => {
    subscriptionchannels.forEach((channel) => {
      channel.close();
    });
    subscriptionchannels = [];
    const settings = arg.settings;
    Object.keys(settings.notification).forEach(function(key, index) {
      if (settings.notification[key] === true) {
        subscriptionchannels.push(connector.connection.createChannel(function(err, ch) {
          ch.assertExchange('notification', 'topic', {durable: false});
          ch.assertQueue('', {exclusive: true}, function(err, q) {
            ch.bindQueue(q.queue, 'notification', `notification.${key.toLowerCase()}.*`);
            ch.consume(q.queue, function(msg) {
              sendr.send('exchangemessagereveived', {
                exchange: 'notification',
                routingkey: 'notification.' + key.toLowerCase(),
                message: msg.content.toString()}); }, {noAck: true});
          });
        }));
      }
    });
    Object.keys(settings.conclusion).forEach(function(key, index) {
      if (settings.conclusion[key] === true) {
        subscriptionchannels.push(connector.connection.createChannel(function(err, ch) {
          ch.assertExchange('conclusion', 'topic', {durable: false});
          ch.assertQueue('', {exclusive: true}, function(err, q) {
            ch.bindQueue(q.queue, 'conclusion', `conclusion.${key.toLowerCase()}.*`);
            ch.consume(q.queue, function(msg) {
              sendr.send('exchangemessagereveived', {
                exchange: 'conclusion',
                routingkey: 'conclusion.' + key.toLowerCase(),
                message: msg.content.toString()}); }, {noAck: true});
          });
        }));
      }
    });
  });


  ipcMain.on('sendmessage', (event, arg) => {
    sendr = event.sender;
    const queuename = arg.queuename;
    const message = arg.message;
    console.log('Send message request received, to queue: ' + queuename + ', content: ' + message);
    let producer = producers.filter(element =>  element.queue === arg.queuename)[0];
    if (producer !== undefined && producer !== null) {
      producer.publish(arg.message);
    } else {
      producer = new Producer(connector.connection, arg.queuename);
      producer.connect().then(function(connected) {
        console.log('producer connected');
        event.sender.send('queueconnected', {queuename: arg.queuename, type: 'producer' });
        JSON.stringify(arg.message);
        producer.publish(JSON.stringify(arg.message));
      }).catch(function(result) {
        console.log('producer not connected due to: ' +  result);
        event.sender.send('queuedisconnected', {queuename: arg.queuename, type: 'producer' });
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
      const producer = new Producer(connector.connection, queuename);
      producer.connect().then(function(connected) {
        console.log('producer connected');
        event.sender.send('queueconnected', {queuename: queuename, type: 'producer' });
      }).catch(function(result) {
        console.log('producer not connected due to: ' +  result);
        event.sender.send('producerstate', 'disconnected');
      });
    }
  });

} catch (e) {

}

function messageReceived(queue, msg) {
  sendr.send('messagereceived', {queuename: queue, message: msg });
}
