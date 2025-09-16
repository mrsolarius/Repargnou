import { Injectable } from '@angular/core';
import {BehaviorSubject, interval, Subject, Subscription, takeWhile} from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerServices {
  private readonly _seconds$ = new BehaviorSubject<number>(0);
  public readonly seconds$ = this._seconds$.asObservable();
  private readonly _timerComplete$ = new Subject<void>();
  public readonly timerComplete$ = this._timerComplete$.asObservable();
  private sub: Subscription | null = null;
  private remainingTime: number = 0;

  start(seconds: number = this.remainingTime) {
    console.log('start',seconds, this.remainingTime);
    // Si un timer est déjà en cours, on ne fait rien
    if (this.sub && !this.sub.closed) {
      console.warn("Un minuteur est déjà en cours.");
      return;
    }

    // Si on démarre un nouveau timer, on met à jour la valeur initiale
    if (seconds > 0) {
      this.remainingTime = seconds;
    }

    console.log("Minuteur démarré avec", this.remainingTime, "secondes");
    this._seconds$.next(this.remainingTime);

    this.sub = interval(1000).pipe(
      map(() => {
        this.remainingTime--;
        return this.remainingTime;
      }),
      // Utilisation de takeWhile pour s'assurer que le timer s'arrête
      // lorsque le temps restant atteint 0.
      takeWhile(val => val >= 0)
    ).subscribe({
      next: (remaining) => {
        this._seconds$.next(remaining);
      },
      complete: () => {
        console.log("Minuteur terminé.");
        this.stop();
        this._timerComplete$.next();
      }
    });
  }

  pause() {
    if (this.sub) {
      console.log("Minuteur mis en pause.");
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  stop() {
    if (this.sub) {
      console.log("Minuteur arrêté.");
      this.sub.unsubscribe();
      this.sub = null;
      this.remainingTime = 0;
      this._seconds$.next(0);
    }
  }
}
