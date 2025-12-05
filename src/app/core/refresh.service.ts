import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private refreshNeeded = new Subject<void>(); 

  constructor() { }

  get refreshNeeded$(): Observable<void> {
    return this.refreshNeeded.asObservable();
  }

  triggerRefresh(): void {
    this.refreshNeeded.next();
  }
}