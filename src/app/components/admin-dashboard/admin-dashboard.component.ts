import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';
import { VoyageService } from '../../../services/voyage.service';
import { DestinationService } from '../../../services/destination.service';
import { forkJoin } from 'rxjs';

// Enregistrer tous les composants Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  stats: DashboardStats | null = null;
  loading = true;
  activeTab = 'overview';

  @ViewChild('destinationsChart') destinationsChartRef!: ElementRef;
  @ViewChild('voyagesPerDestinationChart') voyagesPerDestinationChartRef!: ElementRef;

  // Données pour les graphiques
  destinationsData: any[] = [];
  voyagesPerDestinationData: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private voyageService: VoyageService,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Les graphiques seront initialisés une fois que les données sont chargées
  }

  loadDashboardData(): void {
    this.loading = true;

    // Charger les données du tableau de bord et les données pour les graphiques supplémentaires
    forkJoin({
      dashboardStats: this.dashboardService.getDashboardStats(),
      destinations: this.destinationService.getDestinations(),
      voyages: this.voyageService.getVoyages()
    }).subscribe({
      next: (results) => {
        this.stats = results.dashboardStats;

        // Préparer les données pour le graphique des voyages par destination
        this.prepareVoyagesPerDestinationData(results.destinations, results.voyages);

        this.loading = false;

        // Initialiser les graphiques après que les données sont chargées
        setTimeout(() => {
          if (this.activeTab === 'analytics') {
            this.initAllCharts();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du tableau de bord', error);
        this.loading = false;
      }
    });
  }

  prepareVoyagesPerDestinationData(destinations: any[], voyages: any[]): void {
    // Créer un objet pour compter les voyages par destination
    const voyagesCount: { [key: string]: number } = {};

    // Initialiser le compteur pour chaque destination
    destinations.forEach(destination => {
      voyagesCount[destination.id] = 0;
    });

    // Compter les voyages pour chaque destination
    voyages.forEach(voyage => {
      if (voyagesCount[voyage.destination_id] !== undefined) {
        voyagesCount[voyage.destination_id]++;
      }
    });

    // Convertir les données pour le graphique
    this.voyagesPerDestinationData = destinations.map(destination => ({
      name: destination.nom,
      count: voyagesCount[destination.id]
    }));
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

    // Initialiser les graphiques si on passe à l'onglet analytics
    if (tab === 'analytics') {
      setTimeout(() => {
        this.initAllCharts();
      }, 100);
    }
  }

  initAllCharts(): void {
    this.initDestinationsChart();
    this.initVoyagesPerDestinationChart();
  }

  initDestinationsChart(): void {
    if (!this.stats || !this.destinationsChartRef) return;

    const ctx = this.destinationsChartRef.nativeElement.getContext('2d');

    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.stats.popularDestinations.map(d => d.name),
          datasets: [{
            data: this.stats.popularDestinations.map(d => d.percentage),
            backgroundColor: [
              'rgba(25, 118, 210, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: false
            }
          }
        }
      });
    }
  }

  initVoyagesPerDestinationChart(): void {
    if (!this.voyagesPerDestinationData.length || !this.voyagesPerDestinationChartRef) return;

    const ctx = this.voyagesPerDestinationChartRef.nativeElement.getContext('2d');

    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.voyagesPerDestinationData.map(d => d.name),
          datasets: [{
            label: 'Number of Cruises',
            data: this.voyagesPerDestinationData.map(d => d.count),
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
            borderColor: 'rgba(25, 118, 210, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: false
            }
          }
        }
      });
    }
  }



  getStatusClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getStatusIcon(value: number): string {
    return value >= 0 ? '↑' : '↓';
  }
}
