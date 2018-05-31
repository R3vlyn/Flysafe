import { ElectronService } from './../../providers/electron.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatInput } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  queuename: string;
  producerstate: string;
  consumerstate: string;
  consumingqueues: string[] = [];
  producingqueues: string[] = [];
  lastmessageresult: any;

  constructor(private _electronService: ElectronService, private ref: ChangeDetectorRef) {

  }

  ngOnInit() {
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
      console.log('message received:' + data);
      self.lastmessageresult = data;
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
}
