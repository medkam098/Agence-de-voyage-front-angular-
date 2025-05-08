import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Voyage } from 'src/models/voyage';
import { Destination } from 'src/models/destination';
import { Reservation } from 'src/models/reservation';
import { VoyageService } from 'src/services/voyage.service';
import { DestinationService } from 'src/services/destination.service';
import { ReservationService } from 'src/services/reservation.service';
import { AuthService } from 'src/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-client',
  templateUrl: './home-client.component.html',
  styleUrls: ['./home-client.component.css']
})
export class HomeClientComponent implements OnInit {
  voyages: Voyage[] = [];
  destinations: Destination[] = [];
  upcomingVoyages: Voyage[] = [];
  popularDestinations: Destination[] = [];
  isLoading = true;
  Math = Math; // Make Math available in the template

  // Search properties
  searchQuery: string = '';
  searchDeparture: string = '';
  searchDestinationId: string = '';
  searchDate: string = '';
  showAdvancedSearch: boolean = false;
  availableDepartures: string[] = [];

  // Search results
  filteredVoyages: Voyage[] = [];
  hasSearchResults: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  // Booking properties
  showBookingModal: boolean = false;
  selectedVoyage: Voyage | null = null;
  bookingSeats: number = 1;
  totalBookingPrice: number = 0;
  bookingError: string = '';

  // Destination images cache
  destinationImagesMap: Map<number, string> = new Map();
  destinationNamesMap: Map<number, string> = new Map();

  // Reservations cache
  reservations: any[] = [];

  constructor(
    private voyageService: VoyageService,
    private destinationService: DestinationService,
    private router: Router,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Charger les voyages
    this.voyageService.getVoyages().subscribe(voyages => {
      this.voyages = voyages;

      // Extraire les départs uniques pour la recherche
      this.availableDepartures = [...new Set(voyages.map(v => v.depart))].sort();

      // Trier les voyages par date (du plus proche au plus éloigné)
      const sortedVoyages = [...voyages].sort((a, b) => {
        const dateA = new Date(a.datevoyage).getTime();
        const dateB = new Date(b.datevoyage).getTime();
        return dateA - dateB;
      });

      // Filtrer les voyages à venir (date future)
      const now = new Date().getTime();
      const futureVoyages = sortedVoyages.filter(voyage => {
        const voyageDate = new Date(voyage.datevoyage).getTime();
        return voyageDate > now;
      });

      // Sélectionner tous les prochains voyages
      this.upcomingVoyages = futureVoyages;

      // Calculate total pages
      this.calculateTotalPages();

      // Charger les destinations
      this.destinationService.getDestinations().subscribe(destinations => {
        this.destinations = destinations;

        // Créer un cache pour les images et noms des destinations
        destinations.forEach(destination => {
          this.destinationImagesMap.set(destination.id, destination.image || 'assets/images/destination-placeholder.jpg');
          this.destinationNamesMap.set(destination.id, destination.nom);
        });


        // Charger les réservations pour calculer les places restantes
        this.reservationService.getReservations().subscribe(reservations => {
          this.reservations = reservations;
          this.isLoading = false;
        });
      });
    });
  }

  getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, items.length));
  }

  // Méthode pour basculer l'affichage de la recherche avancée
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  // Méthode pour effectuer la recherche
  searchCruises(): void {
    // Obtenir la date actuelle
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filtrer les voyages en fonction des critères de recherche
    this.filteredVoyages = this.voyages.filter(voyage => {
      // Vérifier d'abord si le voyage est dans le futur
      const voyageDate = new Date(voyage.datevoyage);
      voyageDate.setHours(0, 0, 0, 0);
      const isFutureVoyage = voyageDate.getTime() >= now.getTime();

      // Si le voyage n'est pas dans le futur, l'exclure des résultats
      if (!isFutureVoyage) return false;

      let matchesQuery = true;
      let matchesDeparture = true;
      let matchesDestination = true;
      let matchesDate = true;

      // Filtrer par texte de recherche (recherche simple)
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const departLower = voyage.depart.toLowerCase();
        const destinationName = this.getDestinationName(voyage.destination_id).toLowerCase();

        matchesQuery = departLower.includes(query) ||
                       destinationName.includes(query);
      }

      // Filtrer par critères avancés
      if (this.showAdvancedSearch) {
        // Filtrer par port de départ
        if (this.searchDeparture) {
          matchesDeparture = voyage.depart === this.searchDeparture;
        }

        // Filtrer par destination
        if (this.searchDestinationId) {
          matchesDestination = voyage.destination_id === parseInt(this.searchDestinationId);
        }

        // Filtrer par date (supérieure ou égale à la date sélectionnée)
        if (this.searchDate) {
          const searchDate = new Date(this.searchDate);
          // Réinitialiser l'heure à minuit pour une comparaison juste
          searchDate.setHours(0, 0, 0, 0);

          const voyageDate = new Date(voyage.datevoyage);
          // Réinitialiser l'heure à minuit pour une comparaison juste
          voyageDate.setHours(0, 0, 0, 0);

          // Vérifier si la date du voyage est supérieure ou égale à la date de recherche
          matchesDate = voyageDate.getTime() >= searchDate.getTime();
        }
      }

      // Le voyage doit correspondre à tous les critères de recherche
      return matchesQuery && matchesDeparture && matchesDestination && matchesDate;
    });

    // Trier les résultats par date (du plus proche au plus éloigné)
    this.filteredVoyages.sort((a, b) => {
      const dateA = new Date(a.datevoyage).getTime();
      const dateB = new Date(b.datevoyage).getTime();
      return dateA - dateB;
    });

    // Reset pagination to first page when searching
    this.currentPage = 1;

    // Calculate total pages for search results
    this.totalPages = Math.ceil(this.filteredVoyages.length / this.itemsPerPage);

    // Indiquer qu'il y a des résultats de recherche seulement si une recherche a été effectuée
    // et si des résultats ont été trouvés
    const searchPerformed = Boolean(this.searchQuery) ||
                           (this.showAdvancedSearch && (Boolean(this.searchDeparture) || Boolean(this.searchDestinationId) || Boolean(this.searchDate)));

    this.hasSearchResults = searchPerformed && this.filteredVoyages.length > 0;

    // Si une recherche a été effectuée mais aucun résultat n'a été trouvé, afficher un message
    if (searchPerformed && this.filteredVoyages.length === 0) {
      Swal.fire({
        title: "No Results Found",
        text: "No cruises found matching your search criteria.",
        icon: "info",
        draggable: true
      });
    }
  }

  // Get paginated search results
  getPaginatedSearchResults(): Voyage[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredVoyages.slice(startIndex, endIndex);
  }

  // Méthode pour effacer la recherche
  clearSearch(): void {
    this.searchQuery = '';
    this.searchDeparture = '';
    this.searchDestinationId = '';
    this.searchDate = '';
    this.hasSearchResults = false;
    this.currentPage = 1; // Reset to first page
    this.calculateTotalPages(); // Recalculate total pages for upcoming voyages
  }

  // Méthode pour obtenir l'image d'une destination
  getDestinationImage(destinationId: number): string {
    return this.destinationImagesMap.get(destinationId) || 'assets/images/destination-placeholder.jpg';
  }

  // Méthode pour obtenir le nom d'une destination
  getDestinationName(destinationId: number): string {
    return this.destinationNamesMap.get(destinationId) || 'Unknown Destination';
  }

  // Méthode pour calculer le nombre de jours restants
  getDaysUntil(dateStr: string): number {
    const today = new Date();
    const voyageDate = new Date(dateStr);
    const diffTime = voyageDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  // Méthode pour calculer le nombre de places restantes
  getRemainingSeats(voyage: Voyage): number {
    // Calculer le nombre total de places réservées pour ce voyage
    const reservedSeats = this.reservations
      .filter(r => r.idVoyage === voyage.id)
      .reduce((total, reservation) => total + reservation.nbPlaceAReserver, 0);

    // Retourner le nombre de places restantes
    return voyage.nbplacetotal - reservedSeats;
  }

  // Méthode pour ouvrir le modal de réservation
  openBookingModal(voyage: Voyage): void {
    this.selectedVoyage = voyage;
    this.bookingSeats = 1;
    this.updateTotalPrice();
    this.bookingError = '';
    this.showBookingModal = true;
  }

  // Méthode pour fermer le modal de réservation
  closeBookingModal(event: Event): void {
    // Empêcher la propagation de l'événement si on clique sur le modal lui-même
    if (event.target === event.currentTarget) {
      this.showBookingModal = false;
    }
  }

  // Méthode pour mettre à jour le prix total
  updateTotalPrice(): void {
    if (this.selectedVoyage) {
      this.totalBookingPrice = this.selectedVoyage.prixplace * this.bookingSeats;
    }
  }

  // Méthode pour vérifier si la réservation est valide
  isValidBooking(): boolean {
    if (!this.selectedVoyage) return false;

    const remainingSeats = this.getRemainingSeats(this.selectedVoyage);
    return this.bookingSeats > 0 && this.bookingSeats <= remainingSeats;
  }

  // Méthode pour confirmer la réservation
  confirmBooking(): void {
    if (!this.selectedVoyage || !this.isValidBooking()) {
      this.bookingError = 'Invalid booking. Please check the number of seats.';
      return;
    }

    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.bookingError = 'You must be logged in to book a cruise.';
      return;
    }

    // Créer une nouvelle réservation
    const newReservation: Reservation = {
      id: 0, // L'ID sera généré par le backend
      idVoyage: this.selectedVoyage.id,
      idUser: currentUser.id,
      nbPlaceAReserver: this.bookingSeats
    };

    // Envoyer la réservation au serveur
    this.reservationService.addReservation(newReservation).subscribe({
      next: (response) => {
        // Ajouter la nouvelle réservation à la liste des réservations
        this.reservations.push(response);

        // Fermer le modal
        this.showBookingModal = false;

        // Mettre à jour les places restantes dans l'interface
        if (this.selectedVoyage) {
          // Si nous sommes dans les résultats de recherche, mettre à jour le voyage correspondant
          if (this.hasSearchResults) {
            const voyageIndex = this.filteredVoyages.findIndex(v => v.id === this.selectedVoyage?.id);
            if (voyageIndex !== -1) {
              // Forcer la mise à jour de l'affichage en créant une nouvelle référence
              this.filteredVoyages = [...this.filteredVoyages];
            }
          }

          // Mettre à jour dans les voyages à venir
          const upcomingIndex = this.upcomingVoyages.findIndex(v => v.id === this.selectedVoyage?.id);
          if (upcomingIndex !== -1) {
            // Forcer la mise à jour de l'affichage en créant une nouvelle référence
            this.upcomingVoyages = [...this.upcomingVoyages];
          }
        }

        // Afficher un message de confirmation avec SweetAlert2
        Swal.fire({
          title: "Booked Successfully",
          text: `You have reserved ${this.bookingSeats} seats for the cruise from ${this.selectedVoyage?.depart} to ${this.getDestinationName(this.selectedVoyage?.destination_id || 0)}.`,
          icon: "success",
          draggable: true
        }).then((result) => {
          // Rafraîchir la page après avoir cliqué sur OK
          if (result.isConfirmed || result.isDismissed) {
            window.location.reload();
          }
        });
      },
      error: (error) => {
        this.bookingError = 'An error occurred while booking. Please try again.';
        console.error('Booking error:', error);
      }
    });
  }

  viewDestination(id: number): void {
    this.router.navigate(['/destinations'], { queryParams: { id } });
  }

  viewCruise(id: number): void {
    this.router.navigate(['/cruises'], { queryParams: { id } });
  }

  // Pagination methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.upcomingVoyages.length / this.itemsPerPage);
  }

  getPaginatedVoyages(): Voyage[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.upcomingVoyages.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
