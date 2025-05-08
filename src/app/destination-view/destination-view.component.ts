import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Destination } from 'src/models/destination';
import { DestinationService } from 'src/services/destination.service';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-destination-view',
  templateUrl: './destination-view.component.html',
  styleUrls: ['./destination-view.component.css']
})
export class DestinationViewComponent implements OnInit {
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  searchQuery: string = '';

  constructor(
    private destinationService: DestinationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.destinationService.getDestinations().subscribe((data) => {
      this.destinations = data;
      this.filteredDestinations = data;
    });

    // Vérifier si l'utilisateur est admin
  }

  filterDestinations() {
    const query = this.searchQuery.toLowerCase().trim();
    const terms = query.split(/\s+/);
    this.filteredDestinations = this.destinations.filter(destination => {
      const combined = Object.values(destination)
        .map(v => v?.toString().toLowerCase())
        .join(' ');
      return terms.every(term => combined.includes(term));
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/details-destination', id]);
  }
}