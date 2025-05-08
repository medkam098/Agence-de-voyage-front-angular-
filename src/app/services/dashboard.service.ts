import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { VoyageService } from 'src/services/voyage.service';
import { UserService } from 'src/services/user.service';
import { ReservationService } from 'src/services/reservation.service';
import { DestinationService } from 'src/services/destination.service';
import { Voyage } from 'src/models/voyage';
import { User } from 'src/models/user';
import { Reservation } from 'src/models/reservation';
import { Destination } from 'src/models/destination';

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  bookings: number;
  bookingsChange: number;
  totalVoyages: number;
  voyagesChange: number;
  totalDestinations: number;
  destinationsChange: number;
  recentBookings: any[];
  popularDestinations: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private voyageService: VoyageService,
    private userService: UserService,
    private reservationService: ReservationService,
    private destinationService: DestinationService
  ) { }

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin([
      this.voyageService.getVoyages(),
      this.userService.getUsers(),
      this.reservationService.getReservations(),
      this.destinationService.getDestinations()
    ]).pipe(
      map(([voyages, users, reservations, destinations]) => {
        // Stocker les destinations dans le cache pour une utilisation ultérieure
        this.cachedDestinations = destinations;

        // Calculer le revenu total (prix * places réservées pour chaque réservation)
        const totalRevenue = this.calculateTotalRevenue(voyages, reservations);

        // Nombre de réservations
        const bookings = reservations.length;



        // Réservations récentes
        const recentBookings = this.getRecentBookings(reservations, voyages, users);

        // Destinations populaires
        const popularDestinations = this.getPopularDestinations(reservations, voyages, destinations);

        // Nombre total de voyages
        const totalVoyages = voyages.length;

        // Nombre total de destinations
        const totalDestinations = destinations.length;

        return {
          totalRevenue,
          revenueChange: 20.1, // Valeurs fictives pour la démonstration
          bookings,
          bookingsChange: 10.5, // Valeur fictive
          totalVoyages,
          voyagesChange: 5.3, // Valeur fictive
          totalDestinations,
          destinationsChange: 0, // Valeur fictive
          recentBookings,
          popularDestinations
        };
      })
    );
  }

  private calculateTotalRevenue(voyages: Voyage[], reservations: Reservation[]): number {
    let total = 0;
    reservations.forEach(reservation => {
      const voyage = voyages.find(v => v.id === reservation.idVoyage);
      if (voyage) {
        total += voyage.prixplace * reservation.nbPlaceAReserver;
      }
    });
    return total;
  }



  private getRecentBookings(reservations: Reservation[], voyages: Voyage[], users: User[]): any[] {
    // Trier les réservations par date (supposons qu'il y a un champ date)
    const sortedReservations = [...reservations].sort((a, b) => b.id - a.id);

    // Prendre les 5 dernières réservations
    return sortedReservations.slice(0, 5).map(reservation => {
      const voyage = voyages.find(v => v.id === reservation.idVoyage);
      const user = users.find(u => u.id === reservation.idUser);

      // Trouver la destination associée au voyage
      let destinationName = 'Unknown';
      if (voyage && voyage.destination_id) {
        const destination = this.findDestinationById(voyage.destination_id);
        if (destination) {
          destinationName = destination.nom;
        }
      }

      return {
        id: reservation.id,
        customer: user ? user.name : 'Inconnu',
        voyage: voyage ? voyage.depart + ' - ' + destinationName : 'Inconnu',
        seats: reservation.nbPlaceAReserver,
        date: new Date().toISOString().split('T')[0], // Date fictive
        amount: voyage ? voyage.prixplace * reservation.nbPlaceAReserver : 0
      };
    });
  }

  // Variable pour stocker les destinations
  private cachedDestinations: Destination[] = [];

  // Méthode pour trouver une destination par son ID
  private findDestinationById(destinationId: number): Destination | undefined {
    // Utiliser le cache de destinations
    return this.cachedDestinations.find(d => d.id === destinationId);
  }

  private getPopularDestinations(reservations: Reservation[], voyages: Voyage[], destinations: Destination[]): any[] {
    // Compter les réservations par destination
    const destinationCounts: {[key: number]: number} = {};

    reservations.forEach(reservation => {
      const voyage = voyages.find(v => v.id === reservation.idVoyage);
      if (voyage && voyage.destination_id) {
        if (destinationCounts[voyage.destination_id]) {
          destinationCounts[voyage.destination_id] += reservation.nbPlaceAReserver;
        } else {
          destinationCounts[voyage.destination_id] = reservation.nbPlaceAReserver;
        }
      }
    });

    // Convertir en tableau et trier
    const destinationCountsArray = Object.entries(destinationCounts).map(([destId, count]) => {
      const destination = destinations.find(d => d.id === parseInt(destId));
      return {
        id: parseInt(destId),
        name: destination ? destination.nom : 'Inconnu',
        count,
        percentage: 0 // À calculer
      };
    }).sort((a, b) => b.count - a.count);

    // Calculer le total pour les pourcentages
    const totalCount = destinationCountsArray.reduce((sum, item) => sum + item.count, 0);

    // Calculer les pourcentages
    destinationCountsArray.forEach(item => {
      item.percentage = Math.round((item.count / totalCount) * 100);
    });

    return destinationCountsArray.slice(0, 3); // Top 3 destinations
  }
}
