import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'front';
  showHeaderSidebar = false;
  currentUrl = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
      this.updateHeaderSidebarVisibility();
    });

    // Initial check
    this.updateHeaderSidebarVisibility();
  }

  private updateHeaderSidebarVisibility() {
    // Show header and sidebar only for admin pages
    this.showHeaderSidebar =
      this.currentUrl.includes('/admin/dashboard') ||
      this.currentUrl.includes('/voyages') ||
      this.currentUrl.includes('/reservations') ||
      this.currentUrl.includes('/destinations') ||
      this.currentUrl.includes('/users');
  }
}
