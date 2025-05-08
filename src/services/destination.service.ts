import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from 'src/models/destination';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private apiUrl = 'http://127.0.0.1:8000/api/destinations';

  constructor(private http: HttpClient) {}

  // Récupérer la liste des destinations
  getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.apiUrl);
  }

  // Récupérer une destination par son ID
  getDestination(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.apiUrl}/${id}`);
  }

  // Ajouter une nouvelle destination
  addDestination(destination: Destination): Observable<Destination> {
    return this.http.post<Destination>(this.apiUrl, destination);
  }

  // Mettre à jour une destination existante
  updateDestination(id: number, destination: Destination): Observable<Destination> {
    return this.http.put<Destination>(`${this.apiUrl}/${id}`, destination);
  }

  // Supprimer une destination
  deleteDestination(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
