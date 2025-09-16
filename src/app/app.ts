import { Component, signal } from '@angular/core';
import {WorkoutComponent} from './workout-component/workout-component';

@Component({
  selector: 'app-root',
  imports: [WorkoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Repargnou');
}
