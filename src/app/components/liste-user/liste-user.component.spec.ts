import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListeUserComponent } from './liste-user.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ListeUserComponent', () => {
  let component: ListeUserComponent;
  let fixture: ComponentFixture<ListeUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeUserComponent],
      imports: [
        FormsModule,               // 🔥 Nécessaire pour ngModel
        RouterTestingModule,       // 🔁 Pour éviter les erreurs liées à Router
        HttpClientTestingModule    // 🌐 Pour simuler les appels HTTP
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListeUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
