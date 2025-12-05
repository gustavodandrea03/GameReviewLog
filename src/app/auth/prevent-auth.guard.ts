
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, skip } from 'rxjs/operators'; 
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PreventAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser$.pipe(
      skip(1), 
      take(1), 
      map(user => {
        if (user) {
          // Usuário logado: Redireciona para o catálogo
          console.log('PreventAuthGuard: Redirecionando usuário logado (estado resolvido).');
          return this.router.createUrlTree(['/catalogo']);
        } else {
          // Usuário não logado: Permite acesso
          return true;
        }
      })
    );
  }
}