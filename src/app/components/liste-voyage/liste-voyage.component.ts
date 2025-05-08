import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VoyageService } from 'src/services/voyage.service';
import { DestinationService } from 'src/services/destination.service';
import { Router } from '@angular/router';
import { Voyage } from 'src/models/voyage';
import { Destination } from 'src/models/destination';
import { VoyageModalComponent } from '../modals/voyage-modal/voyage-modal.component';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-liste-voyage',
  templateUrl: './liste-voyage.component.html',
  styleUrls: ['./liste-voyage.component.css']
})
export class ListeVoyageComponent implements OnInit {
  voyages: Voyage[] = [];
  destinations: Destination[] = [];
  filteredVoyages: Voyage[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;

  // Filter properties
  selectedDeparture: string = '';
  selectedDestination: string = '';
  availableDepartures: string[] = [];

  constructor(
    private voyageService: VoyageService,
    private destinationService: DestinationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.isLoading = true;
    this.destinationService.getDestinations().subscribe((destinations) => {
      this.destinations = destinations;
      this.loadVoyages();
    });
  }

  loadVoyages(): void {
    this.voyageService.getVoyages().subscribe((voyages) => {
      this.voyages = voyages.map((voyage) => ({
        ...voyage,
        destinationNom: this.getDestinationName(voyage.destination_id)
      }));
      this.filteredVoyages = this.voyages;

      // Extract unique departures for filter
      this.availableDepartures = [...new Set(voyages.map(v => v.depart))].sort();

      this.isLoading = false;
    });
  }

  getDestinationName(destinationId: number): string {
    const destination = this.destinations.find((d) => d.id === destinationId);
    return destination ? destination.nom : 'Inconnu';
  }

  filterVoyages() {
    const query = this.normalizeString(this.searchQuery);
    const keywords = query.split(/\s+/).filter(k => k.length > 0); // Découpe par espace et filtre les chaînes vides

    this.filteredVoyages = this.voyages.filter(voyage => {
      // Text search
      const combinedFields = [
        voyage.datevoyage,
        voyage.nbplacetotal,
        voyage.prixplace,
        voyage.depart,
        voyage.destinationNom
      ]
        .map(value => this.normalizeValue(value))
        .join(' ');

      // Check if all keywords are present in the combined fields
      const matchesKeywords = keywords.length === 0 || keywords.every(word => combinedFields.includes(word));

      // Filter by departure
      const matchesDeparture = !this.selectedDeparture || voyage.depart === this.selectedDeparture;

      // Filter by destination
      const matchesDestination = !this.selectedDestination ||
                               voyage.destination_id === parseInt(this.selectedDestination);

      // Return true only if all conditions are met
      return matchesKeywords && matchesDeparture && matchesDestination;
    });
  }

  // Method to handle filter changes
  onFilterChange(): void {
    this.filterVoyages();
  }

  normalizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    return this.normalizeString(String(value));
  }

  normalizeString(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')              // Supprime les accents
      .replace(/[\u0300-\u036f]/g, '') // Supprime les caractères accentués restants
      .trim();
  }


  openAddModal(): void {
    const dialogRef = this.dialog.open(VoyageModalComponent, {
      width: '500px',
      data: { voyage: null, isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Voyage added, updating list:', result);
        // Rafraîchir la liste complète
        this.loadVoyages();
      }
    });
  }

  openEditModal(voyage: Voyage): void {
    const dialogRef = this.dialog.open(VoyageModalComponent, {
      width: '500px',
      data: { voyage: voyage, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Voyage updated, updating list:', result);
        // Rafraîchir la liste complète
        this.loadVoyages();
      }
    });
  }

  deleteVoyage(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Voulez-vous vraiment supprimer ce voyage ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voyageService.deleteVoyage(id).subscribe(() => {
          this.voyages = this.voyages.filter(v => v.id !== id);
          this.filterVoyages();
        });
      }
    });
  }


}
