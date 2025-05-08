import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeReservationComponent } from './liste-reservation.component';

describe('ListeReservationComponent', () => {
  let component: ListeReservationComponent;
  let fixture: ComponentFixture<ListeReservationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeReservationComponent]
    });
    fixture = TestBed.createComponent(ListeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
