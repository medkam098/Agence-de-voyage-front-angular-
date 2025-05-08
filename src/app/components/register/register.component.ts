import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      role: ['user', Validators.required],  // Rôle fixé à "user"
      avatar: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur pour vérifier que le mot de passe et la confirmation sont identiques
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const passwordConfirmation = group.get('password_confirmation')?.value;
    if (password && passwordConfirmation && password !== passwordConfirmation) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return; // Ne rien faire si le formulaire est invalide
    }
  
    // Validation des mots de passe
    const password = this.registerForm.get('password')?.value;
    const passwordConfirmation = this.registerForm.get('password_confirmation')?.value;
  
    if (password !== passwordConfirmation) {
      this.registerForm.setErrors({ passwordMismatch: true }); // Ajoute une erreur de correspondance de mot de passe
      return;
    }
  
    // Envoi de la requête d'inscription à l'API
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/login']); // Redirection en cas de succès
        } else {
          this.errorMessage = 'Erreur lors de l\'inscription'; // Message d'erreur si la réponse de l'API échoue
        }
      },
      
    });
    this.router.navigate(['/login']);
  }
  
}
