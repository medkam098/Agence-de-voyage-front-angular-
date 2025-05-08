import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDestinationComponent } from './liste-destination.component';

describe('ListeDestinationComponent', () => {
  let component: ListeDestinationComponent;
  let fixture: ComponentFixture<ListeDestinationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeDestinationComponent]
    });
    fixture = TestBed.createComponent(ListeDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
