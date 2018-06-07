import { ElectronService } from './../../providers/electron.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatInput, MatDialog } from '@angular/material';
import { v4 as uuid } from 'uuid';
import { ProfileDialogComponent } from '../../profile-dialog/profile-dialog.component';
import { MapsdialogComponent } from '../../mapsdialog/mapsdialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  q_planeupdates: String = 'PlaneUpdates';
  newMessage: any = {};
  altitude: 5000;
  queuename: string;
  producerstate: string;
  consumerstate: string;
  consumingqueues: string[] = [];
  producingqueues: string[] = [];
  receivedPlaneData: any[] = [];
  sentDataIDs: string[] = [];
  lastmessageresult: any;
  planename: String = '';
  creatingMessage: Boolean = false;
  messagelocation: any = {lng: '', lat: ''};

  constructor(public dialog: MatDialog, private _electronService: ElectronService, private ref: ChangeDetectorRef) {

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
  }

  HandlePlaneData(data) {
    // const ownNotification =  (this.sentDataIDs.indexOf(data.id) > -1);
    // if (!ownNotification) {
      data.date = new Date(data.date);
      this.receivedPlaneData.push(data);
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
}
