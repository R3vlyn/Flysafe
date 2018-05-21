import { ElectronService } from './../../providers/electron.service';
import { Component, OnInit } from '@angular/core';
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

  constructor(private _electronService: ElectronService) {

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

    this._electronService.ipcRenderer.on('log', function(e, data) {
      console.log('Server log:' + data);
    });
  }

  ConnectProducer() {
    console.log('Connecting producer to ' + this.queuename);

    this._electronService.ipcRenderer.send('connectproducer', this.queuename);
  }

  ConnectConsumer() {
    console.log('Connecting consumer to ' + this.queuename);

    this._electronService.ipcRenderer.send('connectconsumer', this.queuename);
  }
}
