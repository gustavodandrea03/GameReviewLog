
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router'; 
import { Observable, of } from 'rxjs'; 
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  //  Protege rotas críticas com verificação de autenticação
  canActivate(): Observable<boolean> { 
    
    //  serve para garantir que o valor do ID do usuário esteja disponível
    const currentUserId = this.authService.currentUserId; 

    if (currentUserId) {
        // Logado (ID disponivel): Permite acesso
        return of(true); 
    } else {
        // Deslogado (ID indisponivel): Força o redirecionamento
        console.error('🔴 AuthGuard: Usuário deslogado. Forçando redirecionamento para /login.');
        
        this.router.navigate(['/login']); 
        
        return of(false);
    }
  }
}