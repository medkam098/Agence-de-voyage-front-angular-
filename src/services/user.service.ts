import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users';
  private addUrl = 'http://localhost:8000/api/users/register';


  constructor(private http: HttpClient) {}

  // Récupérer la liste des utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Récupérer un utilisateur par son ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un nouvel utilisateur
  addUser(user: User): Observable<User> {
    // Créer un objet avec les propriétés attendues par le backend
    const userData = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      avatar: user.avatar || '',
      isActive: user.isActive
    };

    console.log('Sending user data:', userData);
    return this.http.post<User>(this.addUrl, userData);
  }

  // Mettre à jour un utilisateur
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
