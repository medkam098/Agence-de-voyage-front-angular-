import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListeVoyageComponent } from './components/liste-voyage/liste-voyage.component';
import { ListeReservationComponent } from './components/liste-reservation/liste-reservation.component';
import { ListeDestinationComponent } from './components/liste-destination/liste-destination.component';
import { ListeUserComponent } from './components/liste-user/liste-user.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DestinationViewComponent } from './destination-view/destination-view.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { DestinationModalComponent } from './components/modals/destination-modal/destination-modal.component';
import { VoyageModalComponent } from './components/modals/voyage-modal/voyage-modal.component';
import { ReservationModalComponent } from './components/modals/reservation-modal/reservation-modal.component';
import { UserModalComponent } from './components/modals/user-modal/user-modal.component';
import { ConfirmDialogComponent } from './components/modals/confirm-dialog/confirm-dialog.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { NavbarClientComponent } from './components/navbar-client/navbar-client.component';
import { HomeClientComponent } from './components/home-client/home-client.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';

@NgModule({
  declarations: [
    AppComponent,
    ListeVoyageComponent,
    ListeReservationComponent,
    ListeDestinationComponent,
    ListeUserComponent,
    LoginComponent,
    RegisterComponent,
    DestinationViewComponent,
    AdminNavbarComponent,
    FooterComponent,
    DestinationModalComponent,
    VoyageModalComponent,
    ReservationModalComponent,
    UserModalComponent,
    ConfirmDialogComponent,
    AdminDashboardComponent,
    SidebarComponent,
    HeaderComponent,
    NavbarClientComponent,
    HomeClientComponent,
    MyBookingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    // Material Modules
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
