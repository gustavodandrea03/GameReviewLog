import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PreventAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const userId = this.authService.currentUserId;

    if (userId) {
      // Já logado → redireciona para catálogo
      this.router.navigate(['/catalogo']);
      return of(false);
    }

    // Não logado → permite acesso a login/register
    return of(true);
  }
}