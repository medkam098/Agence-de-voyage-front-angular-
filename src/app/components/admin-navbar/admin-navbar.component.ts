import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  name: string = '';  // Variable pour stocker le nom de l'utilisateur
  optionsVisible: boolean = false;  // Variable pour afficher/masquer le lien "Déconnexion"

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.name = user.name;  // Assure-toi que l'objet `user` a un attribut `name`
    }
  }

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;  // Affiche ou cache le lien "Déconnexion"
  }

  logout(): void {
    this.authService.logout();  // Appeler la méthode de déconnexion du service
  }
}
