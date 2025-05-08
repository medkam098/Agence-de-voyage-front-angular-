import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListeVoyageComponent } from './components/liste-voyage/liste-voyage.component';
import { ListeReservationComponent } from './components/liste-reservation/liste-reservation.component';
import { ListeDestinationComponent } from './components/liste-destination/liste-destination.component';
import { ListeUserComponent } from './components/liste-user/liste-user.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DestinationViewComponent } from './destination-view/destination-view.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { HomeClientComponent } from './components/home-client/home-client.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { RoleGuard } from 'src/services/role.guard';
import { AuthGuard } from 'src/services/auth.guard';

const routes: Routes = [
  // Routes d'authentification (accessibles sans être connecté)
  
  { path: 'register', component: RegisterComponent },
  { path: '', component: LoginComponent },
  // Routes CLIENT
  {
    path: 'home',
    component: HomeClientComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'destinations',
    component: DestinationViewComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'cruises',
    component: DestinationViewComponent, // Réutilisation du même composant pour l'instant
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'my-bookings',
    component: MyBookingsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['user'] }
  },

  // Routes ADMIN
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/voyages',
    component: ListeVoyageComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/reservations',
    component: ListeReservationComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/destinations',
    component: ListeDestinationComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/users',
    component: ListeUserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },

  // Redirections
  { path: 'admin', redirectTo: '/admin/dashboard', pathMatch: 'full' },

  // Ancienne route (pour compatibilité)
  {
    path: 'destinations_view',
    redirectTo: '/destinations',
    pathMatch: 'full'
  },

  // Redirection par défaut
  { path: '**', redirectTo: '', pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
