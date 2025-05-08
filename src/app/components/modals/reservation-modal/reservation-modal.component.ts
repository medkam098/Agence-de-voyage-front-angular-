import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reservation } from 'src/models/reservation';
import { Voyage } from 'src/models/voyage';
import { User } from 'src/models/user';
import { ReservationService } from 'src/services/reservation.service';
import { VoyageService } from 'src/services/voyage.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-reservation-modal',
  templateUrl: './reservation-modal.component.html',
  styleUrls: ['./reservation-modal.component.css']
})
export class ReservationModalComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  modalTitle: string = '';
  buttonText: string = '';
  voyages: Voyage[] = [];
  users: User[] = [];

  constructor(
    private dialogRef: MatDialogRef<ReservationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reservationService: ReservationService,
    private voyageService: VoyageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadVoyages();
    this.loadUsers();

    if (this.data && this.data.isEditMode && this.data.reservation) {
      this.isEditMode = true;
      const reservation = this.data.reservation;

      this.form = new FormGroup({
        id: new FormControl(reservation.id),
        idVoyage: new FormControl(Number(reservation.idVoyage), [Validators.required]),
        idUser: new FormControl(Number(reservation.idUser), [Validators.required]),
        nbPlaceAReserver: new FormControl(Number(reservation.nbPlaceAReserver), [Validators.required, Validators.min(1)])
      });

      console.log('Editing reservation:', reservation);
    } else if (this.data && !this.data.isEditMode) {
      // Mode création avec données explicites
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        idVoyage: new FormControl('', [Validators.required]),
        idUser: new FormControl('', [Validators.required]),
        nbPlaceAReserver: new FormControl('', [Validators.required, Validators.min(1)])
      });

      console.log('Adding new reservation');
    } else if (this.data) {
      this.isEditMode = true;
      this.form = new FormGroup({
        id: new FormControl(this.data.id),
        idVoyage: new FormControl(Number(this.data.idVoyage), [Validators.required]),
        idUser: new FormControl(Number(this.data.idUser), [Validators.required]),
        nbPlaceAReserver: new FormControl(Number(this.data.nbPlaceAReserver), [Validators.required, Validators.min(1)])
      });

      console.log('Editing reservation (legacy format):', this.data);
    } else {
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        idVoyage: new FormControl('', [Validators.required]),
        idUser: new FormControl('', [Validators.required]),
        nbPlaceAReserver: new FormControl('', [Validators.required, Validators.min(1)])
      });

      console.log('Adding new reservation (no data)');
    }

    this.updateModalTexts();
  }

  updateModalTexts(): void {
    if (this.isEditMode) {
      this.modalTitle = 'Modifier une réservation';
      this.buttonText = 'Enregistrer les modifications';
    } else {
      this.modalTitle = 'Ajouter une réservation';
      this.buttonText = 'Ajouter';
    }
  }

  loadVoyages(): void {
    this.voyageService.getVoyages().subscribe(voyages => {
      this.voyages = voyages;
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  save(): void {
    if (this.form.valid) {
      const formValues = this.form.value;

      const reservation: Reservation = {
        id: formValues.id,
        idVoyage: Number(formValues.idVoyage),
        idUser: Number(formValues.idUser),
        nbPlaceAReserver: Number(formValues.nbPlaceAReserver)
      };

      console.log('Form values:', formValues);
      console.log('Reservation object to save:', reservation);

      if (this.isEditMode) {
        this.reservationService.updateReservation(reservation.id, reservation)
          .subscribe({
            next: (updatedReservation) => {
              console.log('Reservation updated successfully:', updatedReservation);
              this.dialogRef.close(updatedReservation);
            },
            error: (error) => {
              console.error('Error updating reservation:', error);
              alert('Une erreur est survenue lors de la mise à jour de la réservation.');
            }
          });
      } else {
        this.reservationService.addReservation(reservation)
          .subscribe({
            next: (newReservation) => {
              console.log('Reservation added successfully:', newReservation);
              this.dialogRef.close(newReservation);
            },
            error: (error) => {
              console.error('Error adding reservation:', error);
              alert('Une erreur est survenue lors de l\'ajout de la réservation.');
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
