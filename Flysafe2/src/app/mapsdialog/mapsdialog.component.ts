import { MatDialogRef } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { AgmCoreModule, MouseEvent } from '@agm/core';

@Component({
  selector: 'app-mapsdialog',
  templateUrl: './mapsdialog.component.html',
  styleUrls: ['./mapsdialog.component.scss']
})
export class MapsdialogComponent implements OnInit {
  lat = 51.673858;
  lng = 7.815982;
  location: any = null;
  markers: Marker[] = [];
  locationselected: Boolean = false;


  constructor(public dialogRef: MatDialogRef<MapsdialogComponent>) { }

  ngOnInit() {
  }

  MapClicked($event: MouseEvent) {
    this.locationselected = true;
    this.markers = [];
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true
    });
  }

  SubmitLocation() {
    if(this.locationselected) {
      this.dialogRef.close(this.markers[0]);
    } else {
      alert('Select a location first');
    }
  }

  closeDialog(name) {
    if (name !== undefined  && name !== null && name !== '') {
      this.location = false;
    this.dialogRef.close(name);
    } else {
      this.location = true;
    }
  }
}

// just an interface for type safety.
interface Marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
