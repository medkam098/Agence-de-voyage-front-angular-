import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Voyage } from '../models/voyage';
import { DestinationService } from './destination.service';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = 'http://127.0.0.1:8000/api/voyages';

  constructor(
    private http: HttpClient,
    private destinationService: DestinationService
  ) {}

  getVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.apiUrl).pipe(
      map((voyages) => {
        return voyages.map(voyage => {
          this.destinationService.getDestination(voyage.destination_id).subscribe(destination => {
            voyage.destinationNom = destination.nom; 
          });
          return voyage;
        });
      })
    );
  }

  getVoyageById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.apiUrl}/${id}`);
  }

  addVoyage(voyage: Voyage): Observable<Voyage> {

    let formattedDate = voyage.datevoyage;
    if (voyage.datevoyage) {
      if (typeof voyage.datevoyage === 'string') {
        if (voyage.datevoyage.includes('/')) {
          const parts = voyage.datevoyage.split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        }
      } else {
        try {
          const date = new Date(voyage.datevoyage as any);
          formattedDate = date.toISOString().split('T')[0]; 
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
    }

    const voyageData = {
      destination_id: Number(voyage.destination_id),
      datevoyage: formattedDate,
      nbplacetotal: Number(voyage.nbplacetotal),
      prixplace: Number(voyage.prixplace),
      depart: voyage.depart
    };

    console.log('Sending voyage data:', voyageData);
    return this.http.post<Voyage>(this.apiUrl, voyageData);
  }

  updateVoyage(id: number, voyage: Voyage): Observable<Voyage> {
    
    let formattedDate = voyage.datevoyage;
    if (voyage.datevoyage) {
      if (typeof voyage.datevoyage === 'string') {
        if (voyage.datevoyage.includes('/')) {
          const parts = voyage.datevoyage.split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        }
      } else {
        try {
          const date = new Date(voyage.datevoyage as any);
          formattedDate = date.toISOString().split('T')[0]; 
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
    }

    const voyageData = {
      destination_id: Number(voyage.destination_id),
      datevoyage: formattedDate,
      nbplacetotal: Number(voyage.nbplacetotal),
      prixplace: Number(voyage.prixplace),
      depart: voyage.depart
    };

    console.log('Updating voyage data:', voyageData);
    return this.http.put<Voyage>(`${this.apiUrl}/${id}`, voyageData);
  }

  deleteVoyage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
