import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://127.0.0.1:8000/api/reservations';

  constructor(private http: HttpClient) {}

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  addReservation(reservation: Reservation): Observable<Reservation> {
    // Créer un objet avec les propriétés attendues par le backend
    const reservationData = {
      idVoyage: Number(reservation.idVoyage),
      idUser: Number(reservation.idUser),
      nbPlaceAReserver: Number(reservation.nbPlaceAReserver)
    };

    console.log('Sending reservation data:', reservationData);
    return this.http.post<Reservation>(this.apiUrl, reservationData);
  }

  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    // Créer un objet avec les propriétés attendues par le backend
    const reservationData = {
      idVoyage: Number(reservation.idVoyage),
      idUser: Number(reservation.idUser),
      nbPlaceAReserver: Number(reservation.nbPlaceAReserver)
    };

    console.log('Updating reservation data:', reservationData);
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservationData);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
