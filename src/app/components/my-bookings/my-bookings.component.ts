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

    this.voyageService.getVoyages().subscribe(voyages => {
      this.voyages = voyages;

      this.destinationService.getDestinations().subscribe(destinations => {
        this.destinations = destinations;

        this.reservationService.getReservations().subscribe(reservations => {
          this.reservations = reservations.filter(r => r.idUser === this.currentUser?.id);

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
   * @param voyageDate 
   * @returns 
   */
  canCancelBooking(voyageDate: Date | null): boolean {
    if (!voyageDate) return false;

    const today = new Date();
    const timeDiff = voyageDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff > this.CANCELLATION_THRESHOLD_DAYS;
  }

  /**
   * @param voyageDate 
   * @returns 
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
   * @param voyageDate 
   * @returns 
   */
  getDaysUntilDeparture(voyageDate: Date): number {
    const today = new Date();
    const timeDiff = voyageDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  cancelBooking(id: number): void {
    const booking = this.bookingsWithDetails.find(b => b.id === id);

    if (!booking || !booking.canCancel) {
      alert(`This booking cannot be canceled. Cancellations are only allowed more than ${this.CANCELLATION_THRESHOLD_DAYS} days before departure.`);
      return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.reservationService.deleteReservation(id).subscribe(() => {
        this.bookingsWithDetails = this.bookingsWithDetails.filter(booking => booking.id !== id);
        this.reservations = this.reservations.filter(r => r.id !== id);
      });
    }
  }
}
