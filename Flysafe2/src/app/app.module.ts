import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';
import {NgxElectronModule} from 'ngx-electron';
import {
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatTab,
  MatTabsModule,
  MatFormField,
  MatSelect,
  MatOption,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatListModule,
  MatGridListModule,
  MatInputModule,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatSliderModule,
  MatChipsModule,
  MatCheckboxModule,
  MatSnackBarModule
} from '@angular/material';
import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { MapsdialogComponent } from './mapsdialog/mapsdialog.component';
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    ProfileDialogComponent,
    MapsdialogComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAeVFH-0exqQMKrLXW7QZ9xTCTNM4LqXH8'
    }),
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSliderModule,
    MatDialogModule,
    MatListModule,
    NgxElectronModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatGridListModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    MatChipsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSliderModule,
    MatGridListModule,
    MatFormFieldModule,
    MatListModule,
    MatSelectModule,
    MatOptionModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatTabsModule
  ],
  entryComponents: [ProfileDialogComponent, MapsdialogComponent],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
