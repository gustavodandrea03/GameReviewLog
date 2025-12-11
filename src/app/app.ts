
import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'; 
import { CommonModule, Location } from '@angular/common'; 
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
    private router: Router, 
    private location: Location 
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }
  
  ngOnInit(): void {
  }

  // chama a função de navegação para a página de login
  goToLogin(): void {
    this.router.navigate(['/login']);    
    window.location.reload(); 
  }

  logout(): void {
    this.authService.signOut().subscribe({
      next: () => {
        alert('Logout efetuado com sucesso!');
        this.router.navigate(['/catalogo']);
      },
      error: (err: any) => { 
        console.error('Erro durante o logout:', err);
        alert('Falha ao efetuar logout. Tente novamente.');
      }
    });
  }
}