import { ElectronService } from './../../providers/electron.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private _electronService: ElectronService) {

  }

  ngOnInit() {
    this._electronService.ipcRenderer.on('pong', function(e, data) {
      console.log('data : ' + data);
    });
    const self = this;
    this._electronService.ipcRenderer.on('connected', function(e, data) {
      self.handleQueueConnect(data);
    });
  }

  playPingPong() {
    alert('bla');
    this.handleQueueConnect('bla');
    console.log('playpingpong called');
    if (this._electronService.isElectron) {
        this._electronService.ipcRenderer.send('ping', 'pinasdfasdfg');
    }
  }

  connectQueue() {
    this._electronService.ipcRenderer.send('connect');
  }

   handleQueueConnect(data) {
    console.log('connected : ' + data);
  }
}
