import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import {TimerServices} from './core/services/timer-services.service';
import {TtsService} from './core/services/text-to-speech.service';
import {WorkoutService} from './core/services/workout.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    TimerServices,
    TtsService,
    WorkoutService
  ]
};
