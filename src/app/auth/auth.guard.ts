
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router'; 
import { Observable, of } from 'rxjs'; 
import { map, take } from 'rxjs/operators'; 
import { AuthService } from './auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> { 
    
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          // Logado: Permite acesso
          return true;
        } else {
          // Não logado: Redireciona para login
          
          this.router.navigate(['/login']); 
          
          return false; 
        }
      })
    );
  }
}