import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Destination } from 'src/models/destination';
import { DestinationService } from 'src/services/destination.service';

@Component({
  selector: 'app-destination-modal',
  templateUrl: './destination-modal.component.html',
  styleUrls: ['./destination-modal.component.css']
})
export class DestinationModalComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  modalTitle: string = '';
  buttonText: string = '';

  constructor(
    private dialogRef: MatDialogRef<DestinationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    if (this.data) { 
      this.isEditMode = true;
      this.form = new FormGroup({
        id: new FormControl(this.data.id),
        nom: new FormControl(this.data.nom, [Validators.required]),
        description: new FormControl(this.data.description, [Validators.required]),
        image: new FormControl(this.data.image, [Validators.required])
      });
    } else { 
      this.isEditMode = false;
      this.form = new FormGroup({
        id: new FormControl(0),
        nom: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        image: new FormControl('', [Validators.required])
      });
    }
    this.updateModalTexts();
  }

  updateModalTexts(): void {
    if (this.isEditMode) {
      this.modalTitle = 'Modifier une destination';
      this.buttonText = 'Enregistrer les modifications';
    } else {
      this.modalTitle = 'Ajouter une destination';
      this.buttonText = 'Ajouter';
    }
  }

  save(): void {
    if (this.form.valid) {
      const destination: Destination = this.form.value;

      if (this.isEditMode) {
        this.destinationService.updateDestination(destination.id, destination)
          .subscribe(updatedDestination => {
            this.dialogRef.close(updatedDestination);
          });
      } else {
        this.destinationService.addDestination(destination)
          .subscribe(newDestination => {
            this.dialogRef.close(newDestination);
          });
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
