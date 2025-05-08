import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isHtml?: boolean;
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  title: string = 'Confirmation';
  message: string = 'Êtes-vous sûr?';
  confirmLabel: string = 'Confirmer';
  cancelLabel: string = 'Annuler';
  isHtml: boolean = false;
  showCancel: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    this.title = data?.title || this.title;
    this.message = data?.message || this.message;
    this.confirmLabel = data?.confirmLabel || this.confirmLabel;
    this.cancelLabel = data?.cancelLabel || this.cancelLabel;
    this.isHtml = data?.isHtml || this.isHtml;
    this.showCancel = data?.showCancel !== undefined ? data.showCancel : this.showCancel;
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}