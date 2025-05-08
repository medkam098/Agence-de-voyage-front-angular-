import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/models/user';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  modalTitle: string = '';
  buttonText: string = '';
  hidePassword: boolean = true;
  roles: string[] = ['user', 'admin'];

  constructor(
    private dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Vérifier si nous avons des données et si nous sommes en mode édition
    if (this.data && this.data.isEditMode && this.data.user) {
      // Mode édition avec données utilisateur
      this.isEditMode = true;
      const user = this.data.user;

      this.form = new FormGroup({
        id: new FormControl(user.id),
        name: new FormControl(user.name, [Validators.required]),
        email: new FormControl(user.email, [Validators.required, Validators.email]),
        role: new FormControl(user.role, [Validators.required]),
        avatar: new FormControl(user.avatar),
        isActive: new FormControl(user.isActive)
      });

      console.log('Editing user:', user);
      // En mode édition, on n'inclut pas le champ password dans le formulaire
    } else if (this.data && !this.data.isEditMode) {
      // Mode création avec données explicites
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        role: new FormControl('user', [Validators.required]),
        avatar: new FormControl(''),
        isActive: new FormControl(true)
      });

      console.log('Adding new user');
    } else if (this.data) {
      // Ancienne structure de données (pour compatibilité)
      this.isEditMode = true;
      this.form = new FormGroup({
        id: new FormControl(this.data.id),
        name: new FormControl(this.data.name, [Validators.required]),
        email: new FormControl(this.data.email, [Validators.required, Validators.email]),
        role: new FormControl(this.data.role, [Validators.required]),
        avatar: new FormControl(this.data.avatar),
        isActive: new FormControl(this.data.isActive)
      });

      console.log('Editing user (legacy format):', this.data);
    } else {
      // Mode création sans données
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        role: new FormControl('user', [Validators.required]),
        avatar: new FormControl(''),
        isActive: new FormControl(true)
      });

      console.log('Adding new user (no data)');
    }

    this.updateModalTexts();
  }

  updateModalTexts(): void {
    if (this.isEditMode) {
      this.modalTitle = 'Modifier un utilisateur';
      this.buttonText = 'Enregistrer les modifications';
    } else {
      this.modalTitle = 'Ajouter un utilisateur';
      this.buttonText = 'Ajouter';
    }
  }

  save(): void {
    if (this.form.valid) {
      const formValues = this.form.value;

      if (this.isEditMode) {
        const updateData: Partial<User> = {
          id: formValues.id,
          name: formValues.name,
          email: formValues.email,
          role: formValues.role,
          avatar: formValues.avatar || '',
          isActive: formValues.isActive
        };

        console.log('Form values (edit):', formValues);
        console.log('User object to update:', updateData);

        this.userService.updateUser(updateData.id!, updateData)
          .subscribe({
            next: (updatedUser) => {
              console.log('User updated successfully:', updatedUser);
              this.dialogRef.close(updatedUser);
            },
            error: (error) => {
              console.error('Error updating user:', error);
              alert('Une erreur est survenue lors de la mise à jour de l\'utilisateur.');
            }
          });
      } else {
        const newUser: User = {
          id: formValues.id,
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
          role: formValues.role,
          avatar: formValues.avatar || '',
          isActive: formValues.isActive
        };

        console.log('Form values (add):', formValues);
        console.log('User object to create:', newUser);

        this.userService.addUser(newUser)
          .subscribe({
            next: (createdUser) => {
              console.log('User created successfully:', createdUser);
              this.dialogRef.close(createdUser);
            },
            error: (error) => {
              console.error('Error creating user:', error);
              alert('Une erreur est survenue lors de la création de l\'utilisateur.');
            }
          });
      }
    } else {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });

      console.error('Form is invalid:', this.form.errors);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
