import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsdialogComponent } from './mapsdialog.component';

describe('MapsdialogComponent', () => {
  let component: MapsdialogComponent;
  let fixture: ComponentFixture<MapsdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapsdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
