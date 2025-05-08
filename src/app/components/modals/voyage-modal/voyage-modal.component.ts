import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Voyage } from 'src/models/voyage';
import { Destination } from 'src/models/destination';
import { VoyageService } from 'src/services/voyage.service';
import { DestinationService } from 'src/services/destination.service';

@Component({
  selector: 'app-voyage-modal',
  templateUrl: './voyage-modal.component.html',
  styleUrls: ['./voyage-modal.component.css']
})
export class VoyageModalComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  modalTitle: string = '';
  buttonText: string = '';
  destinations: Destination[] = [];

  constructor(
    private dialogRef: MatDialogRef<VoyageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private voyageService: VoyageService,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    this.loadDestinations();

    // Vérifier si nous avons des données et si nous sommes en mode édition
    if (this.data && this.data.isEditMode && this.data.voyage) {
      // Mode édition avec données de voyage
      this.isEditMode = true;
      const voyage = this.data.voyage;

      this.form = new FormGroup({
        id: new FormControl(voyage.id),
        destination_id: new FormControl(voyage.destination_id, [Validators.required]),
        datevoyage: new FormControl(voyage.datevoyage, [Validators.required]),
        nbplacetotal: new FormControl(voyage.nbplacetotal, [Validators.required, Validators.min(1)]),
        prixplace: new FormControl(voyage.prixplace, [Validators.required, Validators.min(0)]),
        depart: new FormControl(voyage.depart, [Validators.required])
      });

      console.log('Editing voyage:', voyage);
    } else if (this.data && !this.data.isEditMode) {
      // Mode création avec données explicites
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        destination_id: new FormControl('', [Validators.required]),
        datevoyage: new FormControl('', [Validators.required]),
        nbplacetotal: new FormControl('', [Validators.required, Validators.min(1)]),
        prixplace: new FormControl('', [Validators.required, Validators.min(0)]),
        depart: new FormControl('', [Validators.required])
      });

      console.log('Adding new voyage');
    } else if (this.data) {
      // Ancienne structure de données (pour compatibilité)
      this.isEditMode = true;
      this.form = new FormGroup({
        id: new FormControl(this.data.id),
        destination_id: new FormControl(this.data.destination_id, [Validators.required]),
        datevoyage: new FormControl(this.data.datevoyage, [Validators.required]),
        nbplacetotal: new FormControl(this.data.nbplacetotal, [Validators.required, Validators.min(1)]),
        prixplace: new FormControl(this.data.prixplace, [Validators.required, Validators.min(0)]),
        depart: new FormControl(this.data.depart, [Validators.required])
      });

      console.log('Editing voyage (legacy format):', this.data);
    } else {
      // Mode création sans données
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        destination_id: new FormControl('', [Validators.required]),
        datevoyage: new FormControl('', [Validators.required]),
        nbplacetotal: new FormControl('', [Validators.required, Validators.min(1)]),
        prixplace: new FormControl('', [Validators.required, Validators.min(0)]),
        depart: new FormControl('', [Validators.required])
      });

      console.log('Adding new voyage (no data)');
    }

    this.updateModalTexts();
  }

  updateModalTexts(): void {
    if (this.isEditMode) {
      this.modalTitle = 'Modifier un voyage';
      this.buttonText = 'Enregistrer les modifications';
    } else {
      this.modalTitle = 'Ajouter un voyage';
      this.buttonText = 'Ajouter';
    }
  }

  loadDestinations(): void {
    this.destinationService.getDestinations().subscribe(destinations => {
      this.destinations = destinations;
    });
  }

  save(): void {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Formater la date correctement
      let formattedDate = formValues.datevoyage;
      if (formValues.datevoyage) {
        if (typeof formValues.datevoyage === 'string') {
          // Si c'est une chaîne, s'assurer qu'elle est au bon format
          if (formValues.datevoyage.includes('/')) {
            const parts = formValues.datevoyage.split('/');
            if (parts.length === 3) {
              // Convertir de MM/DD/YYYY à YYYY-MM-DD
              formattedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            }
          }
        } else {
          // Si ce n'est pas une chaîne, essayer de le convertir en Date
          try {
            const date = new Date(formValues.datevoyage);
            formattedDate = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
          } catch (error) {
            console.error('Error formatting date:', error);
          }
        }
      }

      // Créer un objet voyage avec les bonnes conversions de types
      const voyage: Voyage = {
        id: formValues.id,
        destination_id: Number(formValues.destination_id),
        datevoyage: formattedDate,
        nbplacetotal: Number(formValues.nbplacetotal),
        prixplace: Number(formValues.prixplace),
        depart: formValues.depart
      };

      console.log('Form values:', formValues);
      console.log('Voyage object to save:', voyage);

      if (this.isEditMode) {
        this.voyageService.updateVoyage(voyage.id, voyage)
          .subscribe({
            next: (updatedVoyage) => {
              console.log('Voyage updated successfully:', updatedVoyage);
              this.dialogRef.close(updatedVoyage);
            },
            error: (error) => {
              console.error('Error updating voyage:', error);
              alert('Une erreur est survenue lors de la mise à jour du voyage.');
            }
          });
      } else {
        this.voyageService.addVoyage(voyage)
          .subscribe({
            next: (newVoyage) => {
              console.log('Voyage added successfully:', newVoyage);
              this.dialogRef.close(newVoyage);
            },
            error: (error) => {
              console.error('Error adding voyage:', error);
              alert('Une erreur est survenue lors de l\'ajout du voyage.');
            }
          });
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
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
