import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Preencha email e senha corretamente.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.signIn(email, password).subscribe({
      next: () => {
        this.loading = false;
        // Redireciona para o catálogo após login bem-sucedido
        this.router.navigate(['/catalogo']);
      },
      error: (err: any) => {
        this.loading = false;
        if (err.message.includes('Invalid login credentials')) {
          this.errorMessage = 'Email ou senha incorretos.';
        } else if (err.message.includes('Email not confirmed')) {
          this.errorMessage = 'Confirme seu email antes de fazer login.';
        } else {
          this.errorMessage = err.message || 'Erro ao fazer login. Tente novamente.';
        }
        console.error('Erro no login:', err);
      }
    });
  }
}