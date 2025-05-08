import { Component, OnInit } from '@angular/core';
import { Reservation } from 'src/models/reservation';
import { Voyage } from 'src/models/voyage';
import { User } from 'src/models/user';
import { ReservationService } from 'src/services/reservation.service';
import { VoyageService } from 'src/services/voyage.service';
import { AuthService } from 'src/services/auth.service';
import { DestinationService } from 'src/services/destination.service';
import { Destination } from 'src/models/destination';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  reservations: Reservation[] = [];
  voyages: Voyage[] = [];
  destinations: Destination[] = [];
  currentUser: User | null = null;
  isLoading = true;
  bookingsWithDetails: any[] = [];

  // Minimum days before flight date to allow cancellation
  readonly CANCELLATION_THRESHOLD_DAYS = 2;

  constructor(
    private reservationService: ReservationService,
    private voyageService: VoyageService,
    private authService: AuthService,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadData();
  }

  loadData(): void {
    if (!this.currentUser) {
      this.isLoading = false;
      return;
    }

    // Charger les voyages et destinations d'abord
    this.voyageService.getVoyages().subscribe(voyages => {
      this.voyages = voyages;

      this.destinationService.getDestinations().subscribe(destinations => {
        this.destinations = destinations;

        // Puis charger les réservations de l'utilisateur
        this.reservationService.getReservations().subscribe(reservations => {
          // Filtrer les réservations pour n'afficher que celles de l'utilisateur connecté
          this.reservations = reservations.filter(r => r.idUser === this.currentUser?.id);

          // Créer un tableau avec les détails complets pour chaque réservation
          this.bookingsWithDetails = this.reservations.map(reservation => {
            const voyage = this.voyages.find(v => v.id === reservation.idVoyage);
            const destination = voyage ? this.destinations.find(d => d.id === voyage.destination_id) : null;
            const voyageDate = voyage ? new Date(voyage.datevoyage) : null;
            const canCancel = this.canCancelBooking(voyageDate);
            const daysUntilDeparture = voyageDate ? this.getDaysUntilDeparture(voyageDate) : null;
            const cancellationMessage = this.getCancellationMessage(voyageDate);
            const isPastFlight = daysUntilDeparture !== null && daysUntilDeparture <= 0;

            return {
              id: reservation.id,
              voyage: voyage ? voyage.depart : 'Unknown',
              destination: destination ? destination.nom : 'Unknown',
              date: voyage ? voyage.datevoyage : 'Unknown',
              voyageDate: voyageDate,
              seats: reservation.nbPlaceAReserver,
              totalPrice: voyage ? voyage.prixplace * reservation.nbPlaceAReserver : 0,
              canCancel: canCancel,
              daysUntilDeparture: daysUntilDeparture,
              cancellationMessage: cancellationMessage,
              isPastFlight: isPastFlight
            };
          });

          this.isLoading = false;
        });
      });
    });
  }

  /**
   * Check if a booking can be canceled based on the flight date
   * @param voyageDate The date of the voyage
   * @returns true if the booking can be canceled (more than 2 days before flight and not in the past), false otherwise
   */
  canCancelBooking(voyageDate: Date | null): boolean {
    if (!voyageDate) return false;

    const today = new Date();
    const timeDiff = voyageDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Cannot cancel if flight is in the past or within 2 days
    return daysDiff > this.CANCELLATION_THRESHOLD_DAYS;
  }

  /**
   * Get the reason why a booking cannot be canceled
   * @param voyageDate The date of the voyage
   * @returns A string explaining why the booking cannot be canceled
   */
  getCancellationMessage(voyageDate: Date | null): string {
    if (!voyageDate) return "Booking cannot be canceled";

    const today = new Date();
    const timeDiff = voyageDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      return "Cannot cancel past flights";
    } else if (daysDiff <= this.CANCELLATION_THRESHOLD_DAYS) {
      return `Cannot cancel within ${this.CANCELLATION_THRESHOLD_DAYS} days of departure`;
    }

    return "";
  }

  /**
   * Calculate the number of days until departure
   * @param voyageDate The date of the voyage
   * @returns The number of days until departure
   */
  getDaysUntilDeparture(voyageDate: Date): number {
    const today = new Date();
    const timeDiff = voyageDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  cancelBooking(id: number): void {
    // Find the booking
    const booking = this.bookingsWithDetails.find(b => b.id === id);

    // Check if booking can be canceled
    if (!booking || !booking.canCancel) {
      alert(`This booking cannot be canceled. Cancellations are only allowed more than ${this.CANCELLATION_THRESHOLD_DAYS} days before departure.`);
      return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.reservationService.deleteReservation(id).subscribe(() => {
        // Supprimer la réservation de la liste
        this.bookingsWithDetails = this.bookingsWithDetails.filter(booking => booking.id !== id);
        this.reservations = this.reservations.filter(r => r.id !== id);
      });
    }
  }
}
