
import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public readonly currentUser$: Observable<User | null> = this._currentUser.asObservable();
  
  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        this._currentUser.next(session ? session.user : null);
      }
    );
    this.loadInitialSession();
  }

  private loadInitialSession(): void {
    from(this.supabaseService.supabase.auth.getSession()).pipe(
      tap(({ data }) => {
        if (data.session) {
          this._currentUser.next(data.session.user);
        }
      })
    ).subscribe();
  }
  
  signIn(email: string, password: string): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.signInWithPassword({ email, password })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return;
      })
    );
  }

  signUp(email: string, password: string): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.signUp({ email, password })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return;
      })
    );
  }

  signOut(): Observable<any> {
    return from(this.supabaseService.supabase.auth.signOut());
  }
  
  
  get currentUserId(): string | null {
    return this._currentUser.getValue()?.id || null;
  }
}