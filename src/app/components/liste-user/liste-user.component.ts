import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/services/user.service';
import { User } from 'src/models/user';
import { UserModalComponent } from '../modals/user-modal/user-modal.component';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-liste-user',
  templateUrl: './liste-user.component.html',
  styleUrls: ['./liste-user.component.css']
})
export class ListeUserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;

  // Filter properties
  selectedRole: string = 'all';
  roles: string[] = ['all', 'user', 'admin'];

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
      this.filteredUsers = data;
      this.isLoading = false;
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filter by search query
      const matchesQuery =
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filter by role
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;

      // Return true only if both conditions are met
      return matchesQuery && matchesRole;
    });
  }

  // Method to handle role filter change
  onRoleFilterChange(): void {
    this.filterUsers();
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '500px',
      data: { user: null, isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User added, updating list:', result);
        // Ajouter le nouvel utilisateur à la liste et rafraîchir
        this.loadUsers();
      }
    });
  }

  openEditModal(user: User): void {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '500px',
      data: { user: user, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User updated, updating list:', result);
        // Rafraîchir la liste complète pour s'assurer que tout est à jour
        this.loadUsers();
      }
    });
  }

  deleteUser(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Voulez-vous vraiment supprimer cet utilisateur ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(id).subscribe(() => {
          this.users = this.users.filter(user => user.id !== id);
          this.filterUsers();
        });
      }
    });
  }


}
