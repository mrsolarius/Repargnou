import { Injectable } from '@angular/core';
import {BehaviorSubject, interval, map, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerServices {
  private readonly _seconds$ = new BehaviorSubject<number>(0);
  seconds$ = this._seconds$.asObservable();
  private sub: Subscription | null = null;


  start(seconds: number) {
    this.stop();
    this._seconds$.next(seconds);
    this.sub = interval(1000).pipe(
      map(i => seconds - (i + 1))
    ).subscribe(remaining => {
      if (remaining <= 0) {
        this._seconds$.next(0);
        this.stop();
      } else {
        this._seconds$.next(remaining);
      }
    });
  }


  stop() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }
}
