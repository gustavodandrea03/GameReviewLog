import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] 
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, preencha o formulário corretamente e garanta a senha mínima.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.registerForm.value;

    this.authService.signUp(email, password).subscribe({
      next: () => {
        alert('Registro bem-sucedido! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = `Erro no Registro: ${err.message || 'Ocorreu um erro.'}`;
        this.loading = false;
      }
    });
  }
}