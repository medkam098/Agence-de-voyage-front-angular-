import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  adminName: string = '';
  isSidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Get user info
    const user = this.authService.getUser();
    if (user) {
      this.adminName = user.name;
    }

    // Check screen size
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));

    // Subscribe to sidebar state changes
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isSidebarCollapsed = collapsed;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions and event listeners
    this.subscription.unsubscribe();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 992;
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.authService.logout();
  }
}
