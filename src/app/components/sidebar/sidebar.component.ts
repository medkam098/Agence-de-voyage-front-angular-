import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.checkScreenSize();

    // Subscribe to sidebar state changes
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isCollapsed = collapsed;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 992;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
