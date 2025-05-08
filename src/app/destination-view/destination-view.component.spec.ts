import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationViewComponent } from './destination-view.component';

describe('DestinationViewComponent', () => {
  let component: DestinationViewComponent;
  let fixture: ComponentFixture<DestinationViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DestinationViewComponent]
    });
    fixture = TestBed.createComponent(DestinationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
