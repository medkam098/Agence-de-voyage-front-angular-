import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  name: string = '';  
  optionsVisible: boolean = false;  

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.name = user.name;  
    }
  }

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;  
  }

  logout(): void {
    this.authService.logout();  
  }
}
