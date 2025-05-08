import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoyageModalComponent } from './voyage-modal.component';

describe('VoyageModalComponent', () => {
  let component: VoyageModalComponent;
  let fixture: ComponentFixture<VoyageModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VoyageModalComponent]
    });
    fixture = TestBed.createComponent(VoyageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
