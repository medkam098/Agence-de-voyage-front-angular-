import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$: Observable<boolean> = this.isCollapsedSubject.asObservable();

  constructor() {
    // Check screen size on initialization
    this.checkScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize(): void {
    const isMobile = window.innerWidth < 992;
    this.isCollapsedSubject.next(isMobile);
  }

  toggle(): void {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  collapse(): void {
    this.isCollapsedSubject.next(true);
  }

  expand(): void {
    this.isCollapsedSubject.next(false);
  }

  getCollapsedState(): boolean {
    return this.isCollapsedSubject.value;
  }
}
