import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from './auth/auth.service';
import { User } from '@supabase/supabase-js';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule], 
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  
  protected readonly title = signal('GameReviewLog');
  currentUser$: Observable<User | null>; 

  constructor(
    private authService: AuthService,
    private router: Router 
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }
  
  ngOnInit(): void {
  }

  // Método para Logout
  logout(): void {
    this.authService.signOut().subscribe({
      next: () => {
        alert('Logout efetuado com sucesso!');
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        console.error('Erro durante o logout:', err);
      }
    });
  }

}