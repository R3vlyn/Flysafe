import { ElectronService } from './../../providers/electron.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatInput, MatDialog, MatSnackBar } from '@angular/material';
import { v4 as uuid } from 'uuid';
import { ProfileDialogComponent } from '../../profile-dialog/profile-dialog.component';
import { MapsdialogComponent } from '../../mapsdialog/mapsdialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  start = true;
  exchangenamenotification = 'notification';
  exchangenameconclusion = 'conclusion';
  q_planeupdates: String = 'PlaneUpdates';
  newMessage: any = {};
  altitude: 5000;
  queuename: string;
  producerstate: string;
  consumerstate: string;
  consumingqueues: string[] = [];
  producingqueues: string[] = [];
  receivedPlaneData: any[] = [];
  savedPlaneData: any[] = [];
  sentDataIDs: string[] = [];
  lastmessageresult: any;
  planename: String = '';
  settingschanged: Boolean = false;
  creatingMessage: Boolean = false;
  messagelocation: any = {lng: '', lat: ''};
  settingstemporary: any = {
    notification: {
      heat: true,
      storm: true,
      wind: true,
      frost: true,
      other: true
    },
    conclusion: {
      heat: true,
      storm: true,
      wind: true,
      frost: true,
      other: true
    }
  };
  settingssaved: any = {
    notification: {
      heat: true,
      storm: true,
      wind: true,
      frost: true,
      other: true
    },
    conclusion: {
      heat: true,
      storm: true,
      wind: true,
      frost: true,
      other: true
    }
  };

  constructor(public dialog: MatDialog, private _electronService: ElectronService,
    private ref: ChangeDetectorRef, public snackBar: MatSnackBar) {

  }

  ngOnInit() {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.planename = result;
    });

    this.ConnectConsumer(this.q_planeupdates);
    this.ConnectProducer(this.q_planeupdates);

    this._electronService.ipcRenderer.on('pong', function(e, data) {
      console.log('data : ' + data);
    });
    const self = this;
    this._electronService.ipcRenderer.on('producerstate', function(e, data) {
      console.log('Producerstate received:' + data);
      self.producerstate = data;
    });

    this._electronService.ipcRenderer.on('consumerstate', function(e, data) {
      console.log('Consumerstate received:' + data);
      self.consumerstate = data;
    });

    this._electronService.ipcRenderer.on('messagereceived', function(e, data) {
      const planemessage = JSON.parse(data.message.content.toString());
      // const message = new TextDecoder('utf-8').decode(data.message.content);
      if (data.queuename === self.q_planeupdates) {
        console.log('Plane-Data received:' + planemessage);
        self.HandlePlaneData(planemessage);
      }
      self.ref.detectChanges();
    });

    this._electronService.ipcRenderer.on('queueconnected', function(e, data) {
      console.log('Connection made:' + data);
      if (data.type === 'producer') {
        self.producerstate = 'connected';
        self.producingqueues.push(data.queuename);
        self.ref.detectChanges();
      } else {
        self.consumerstate = 'connected';
        self.consumingqueues.push(data.queuename);
        self.ref.detectChanges();
      }
    });
    this._electronService.ipcRenderer.on('log', function(e, data) {
      console.log('Server log:' + data);
    });

    // exchange- subscribtion
    this._electronService.ipcRenderer.on('exchangecreated', function(e, data) {
      console.log(data.exchange);
    });

    this._electronService.ipcRenderer.on('exchangemessagereveived', function(e, data) {
      console.log(`Message received: ${data.exchange}, ${data.routingkey}, ${data.message}`);
      self.HandlePlaneData(JSON.parse(data.message));
      self.ref.detectChanges();
    });

    this._electronService.ipcRenderer.on('messageExchanged', function(e, data) {
      console.log(`Message send: ${data.exchange}, ${data.routingkey}, ${data.message}`);
    });

  }

  HandlePlaneData(data) {
    // const ownNotification =  (this.sentDataIDs.indexOf(data.id) > -1);
    // if (!ownNotification) {
      data.date = new Date(data.date);
      this.receivedPlaneData.push(data);
      this.receivedPlaneData.sort(function(a, b) {
        return b.date - a.date;
      });
      this.openSnackBar('New message reveived', 'OK');

    // }
  }

  ConnectProducer(queuename) {
    console.log('Connecting producer to ' + queuename);

    this._electronService.ipcRenderer.send('connectproducer', queuename);
  }

  ConnectConsumer(queuename) {
    console.log('Connecting consumer to ' + queuename);

    this._electronService.ipcRenderer.send('connectconsumer', queuename);
  }

  sendMessage(selectedqueue, message) {
    this._electronService.ipcRenderer.send('sendmessage', {queuename: selectedqueue, message: message});
  }

  sendNotification(data) {
    const id = uuid();
    this.sentDataIDs.push(id);
    data.id = id;
    this.sendMessage('planedata', data);
  }

  PickLocation() {
    const mapsDialogRef = this.dialog.open(MapsdialogComponent, {
      height: '400px',
      width: '600px',
    });

    mapsDialogRef.afterClosed().subscribe(marker => {
      console.log('The mapsdialog was closed');
      this.newMessage.lat = marker.lat;
      this.newMessage.lng = marker.lng;
      const location = {lat: marker.lat, lng: marker.lng};
      this.messagelocation = location;
    });
  }

  CreateMessage() {
    const mapsDialogRef = this.dialog.open(MapsdialogComponent, {
      height: '400px',
      width: '600px',
    });

    mapsDialogRef.afterClosed().subscribe(marker => {
      console.log('The mapsdialog was closed');
      this.newMessage.lat = marker.lat;
      this.newMessage.lng = marker.lng;
      const location = {lat: marker.lat, lng: marker.lng};
      this.messagelocation = location;
    });
    this.creatingMessage = true;
  }

  NotifyPlanes() {
    const id = uuid();
    this.sentDataIDs.push(id);
    this.newMessage.id = id;
    this.newMessage.plane = this.planename;
    this.newMessage.date = new Date().getTime();
    this._electronService.ipcRenderer.send('sendmessage', {queuename: this.q_planeupdates, message: this.newMessage});
  }

  CancelMessage() {
    this.creatingMessage = false;
  }

  CreateExchange() {
    this._electronService.ipcRenderer.send('createexchange', {exchange: this.exchangenamenotification});
  }

  SubscribeExchange() {
    this._electronService.ipcRenderer.send('subscribeexchange', {exchange: this.exchangenamenotification, routingkey: 'notification.*.*'});
  }

  ExchangeTestmessage() {

    this._electronService.ipcRenderer.send(
      'exchangemessage', {exchange: this.exchangenamenotification, routingkey: 'notification.wind.critical', message: 'test'});
  }

  ExchangeMessage() {
    const id = uuid();
    this.sentDataIDs.push(id);
    this.newMessage.id = id;
    this.newMessage.plane = this.planename;
    this.newMessage.date = new Date().getTime();
    this._electronService.ipcRenderer.send(
      'exchangemessage', {
        exchange: this.exchangenamenotification,
        routingkey: `notification.${this.newMessage.type}.${this.newMessage.severity}`,
        message: this.newMessage});
    //this.newMessage = {};
    this.creatingMessage = false;
    this.openSnackBar('Message sent!', 'OK');

  }

  SaveSettings() {
    this.settingssaved = JSON.parse(JSON.stringify(this.settingstemporary));
    this.SetSubscriptions();
    this.openSnackBar('Settings saved!', 'Noticed');
  }

  SubmitSubscriptions() {
    this.settingssaved = JSON.parse(JSON.stringify(this.settingstemporary));
    this.SetSubscriptions();
    this.start = false;
    this.openSnackBar('Subscriptions submitted!', 'Noticed');
  }

  SetSubscriptions() {
    this._electronService.ipcRenderer.send('setsubscriptions', {settings: this.settingssaved});
  }

  SettingsChanged(): boolean{
    return JSON.stringify(this.settingstemporary) !== JSON.stringify(this.settingssaved);
  }

  CancelSettingChanges() {
    this.settingstemporary = JSON.parse(JSON.stringify(this.settingssaved));
    this.openSnackBar('Changes reverted!', 'Noticed');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  SaveMessage(message) {
    this.savedPlaneData.push(message);
    this.receivedPlaneData = this.receivedPlaneData.filter(function( obj ) {
      return obj.id !== message.id;
    });
    this.ref.detectChanges();
    this.openSnackBar('Message saved', 'OK');
  }
  DiscardMessage(message) {
    this.receivedPlaneData = this.receivedPlaneData.filter(function( obj ) {
      return obj.id !== message.id;
    });
    this.ref.detectChanges();
  }

  DiscardSavedMessage(message) {
    this.savedPlaneData = this.savedPlaneData.filter(function( obj ) {
      return obj.id !== message.id;
    });
    this.ref.detectChanges();
    this.openSnackBar('Message discarded', 'OK');
  }
}
