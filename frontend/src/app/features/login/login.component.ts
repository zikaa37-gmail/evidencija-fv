import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
  ],
})
export class LoginComponent {
  #auth = inject(AuthService);
  #router = inject(Router);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  protected readonly submitting = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorKey.set(null);

    this.#auth.login(email, password).subscribe({
      next: () => this.#router.navigate(['/student-records']),
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorKey.set(
          error.status === 422 ? 'login.invalidCredentials' : 'login.serverError',
        );
      },
    });
  }
}
