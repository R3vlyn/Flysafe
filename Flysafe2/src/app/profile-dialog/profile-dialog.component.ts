import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {
  nullname: Boolean = false;
  constructor(public dialogRef: MatDialogRef<ProfileDialogComponent>) { }

  ngOnInit() {

  }

  closeDialog(name) {
    if (name !== undefined  && name !== null && name !== '') {
      this.nullname = false;
    this.dialogRef.close(name);
    } else {
      this.nullname = true;
    }
  }}
