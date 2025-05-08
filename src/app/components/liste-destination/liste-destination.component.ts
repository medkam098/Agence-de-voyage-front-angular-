import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DestinationService } from 'src/services/destination.service';
import { VoyageService } from 'src/services/voyage.service';
import { Destination } from 'src/models/destination';
import { Voyage } from 'src/models/voyage';
import { DestinationModalComponent } from '../modals/destination-modal/destination-modal.component';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-liste-destination',
  templateUrl: './liste-destination.component.html',
  styleUrls: ['./liste-destination.component.css']
})
export class ListeDestinationComponent implements OnInit {
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;

  // Filter property
  selectedName: string = '';

  constructor(
    private destinationService: DestinationService,
    private voyageService: VoyageService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.isLoading = true;
    this.destinationService.getDestinations().subscribe((data) => {
      this.destinations = data;
      this.filteredDestinations = data;
      this.isLoading = false;
    });
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(DestinationModalComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajouter la nouvelle destination à la liste
        this.destinations.push(result);
        this.filterDestinations();
      }
    });
  }

  openEditModal(destination: Destination): void {
    const dialogRef = this.dialog.open(DestinationModalComponent, {
      width: '500px',
      data: destination
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Mettre à jour la destination dans la liste
        const index = this.destinations.findIndex(d => d.id === result.id);
        if (index !== -1) {
          this.destinations[index] = result;
          this.filterDestinations();
        }
      }
    });
  }

  deleteDestination(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette destination?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.destinationService.deleteDestination(id).subscribe(() => {
          this.destinations = this.destinations.filter(dest => dest.id !== id);
          this.filterDestinations();
        });
      }
    });
  }
  filterDestinations() {
    const query = this.searchQuery.toLowerCase().trim();
    const terms = query.split(/\s+/).filter(term => term.length > 0); // sépare par les espaces multiples

    this.filteredDestinations = this.destinations.filter(destination => {
      // Text search
      const destinationString = Object.values(destination)
        .map(val => val?.toString().toLowerCase())
        .join(' '); // concatène tous les attributs dans une seule chaîne

      const matchesTerms = terms.length === 0 || terms.every(term => destinationString.includes(term));

      // Name filter
      const matchesName = !this.selectedName ||
                         destination.nom.toLowerCase().includes(this.selectedName.toLowerCase());

      return matchesTerms && matchesName;
    });
  }

  // Method to handle filter changes
  onFilterChange(): void {
    this.filterDestinations();
  }

  viewVoyages(destinationId: number): void {
    // Récupérer les voyages pour cette destination
    this.voyageService.getVoyages().subscribe(voyages => {
      // Filtrer les voyages pour cette destination
      const destinationVoyages = voyages.filter(voyage => voyage.destination_id === destinationId);

      // Récupérer le nom de la destination
      const destination = this.destinations.find(d => d.id === destinationId);
      const destinationName = destination ? destination.nom : 'Destination inconnue';

      // Afficher un dialogue avec les voyages
      this.dialog.open(ConfirmDialogComponent, {
        width: '600px',
        data: {
          title: `Voyages pour ${destinationName}`,
          message: this.formatVoyagesMessage(destinationVoyages),
          isHtml: true,
          showCancel: false
        }
      });
    });
  }

  formatVoyagesMessage(voyages: Voyage[]): string {
    if (voyages.length === 0) {
      return '<p>Aucun voyage n\'est disponible pour cette destination.</p>';
    }

    let message = '<div class="voyages-list">';
    message += '<table style="width:100%; border-collapse: collapse;">';
    message += '<tr style="background-color: #f2f2f2;">';
    message += '<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date</th>';
    message += '<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Départ</th>';
    message += '<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Prix</th>';
    message += '<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Places</th>';
    message += '</tr>';

    voyages.forEach(voyage => {
      message += '<tr style="border: 1px solid #ddd;">';
      message += `<td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${voyage.datevoyage}</td>`;
      message += `<td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${voyage.depart}</td>`;
      message += `<td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${voyage.prixplace} €</td>`;
      message += `<td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${voyage.nbplacetotal}</td>`;
      message += '</tr>';
    });

    message += '</table>';
    message += '</div>';
    return message;
  }


}
