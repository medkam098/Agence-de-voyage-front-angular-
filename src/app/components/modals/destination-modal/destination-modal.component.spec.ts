import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationModalComponent } from './destination-modal.component';

describe('DestinationModalComponent', () => {
  let component: DestinationModalComponent;
  let fixture: ComponentFixture<DestinationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DestinationModalComponent]
    });
    fixture = TestBed.createComponent(DestinationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
