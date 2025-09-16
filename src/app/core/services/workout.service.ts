import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Exercise, ExercisePhase } from '../models/exercise.model';

export interface WorkoutSession {
  phase: ExercisePhase;
  startTime: Date;
  endTime?: Date;
  exercises: ExerciseProgress[];
}

export interface ExerciseProgress {
  exercise: Exercise;
  completedSets: number;
  completedReps: number;
  startTime: Date;
  endTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly currentSessionSubject = new BehaviorSubject<WorkoutSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  private readonly workoutHistorySubject = new BehaviorSubject<WorkoutSession[]>([]);
  public workoutHistory$ = this.workoutHistorySubject.asObservable();

  constructor() {
    this.loadWorkoutHistory();
  }

  startWorkoutSession(phase: ExercisePhase): void {
    const session: WorkoutSession = {
      phase: phase,
      startTime: new Date(),
      exercises: phase.exercises.map(exercise => ({
        exercise: exercise,
        completedSets: 0,
        completedReps: 0,
        startTime: new Date()
      }))
    };

    this.currentSessionSubject.next(session);
  }

  updateExerciseProgress(exerciseId: string, sets: number, reps: number): void {
    const currentSession = this.currentSessionSubject.value;
    if (!currentSession) return;

    const exerciseProgress = currentSession.exercises.find(
      ep => ep.exercise.id === exerciseId
    );

    if (exerciseProgress) {
      exerciseProgress.completedSets = sets;
      exerciseProgress.completedReps = reps;

      if (sets >= exerciseProgress.exercise.sets) {
        exerciseProgress.endTime = new Date();
      }

      this.currentSessionSubject.next(currentSession);
    }
  }

  completeWorkoutSession(): void {
    const currentSession = this.currentSessionSubject.value;
    if (!currentSession) return;

    currentSession.endTime = new Date();

    // Add to history
    const history = this.workoutHistorySubject.value;
    history.push(currentSession);
    this.workoutHistorySubject.next(history);

    // Save to localStorage
    this.saveWorkoutHistory(history);

    // Clear current session
    this.currentSessionSubject.next(null);
  }

  cancelWorkoutSession(): void {
    this.currentSessionSubject.next(null);
  }

  getCurrentSession(): WorkoutSession | null {
    return this.currentSessionSubject.value;
  }

  getWorkoutHistory(): WorkoutSession[] {
    return this.workoutHistorySubject.value;
  }

  getWorkoutStats(): any {
    const history = this.workoutHistorySubject.value;
    const completedWorkouts = history.filter(session => session.endTime);

    return {
      totalWorkouts: completedWorkouts.length,
      totalExercises: completedWorkouts.reduce((sum, session) =>
        sum + session.exercises.length, 0
      ),
      averageWorkoutDuration: this.calculateAverageWorkoutDuration(completedWorkouts),
      workoutsByPhase: this.getWorkoutsByPhase(completedWorkouts)
    };
  }

  private calculateAverageWorkoutDuration(sessions: WorkoutSession[]): number {
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      if (session.endTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime());
      }
      return sum;
    }, 0);

    return totalDuration / sessions.length / (1000 * 60); // Return in minutes
  }

  private getWorkoutsByPhase(sessions: WorkoutSession[]): { [phase: number]: number } {
    return sessions.reduce((acc, session) => {
      const phase = session.phase.phase;
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {} as { [phase: number]: number });
  }

  private saveWorkoutHistory(history: WorkoutSession[]): void {
    try {
      localStorage.setItem('workoutHistory', JSON.stringify(history));
    } catch (error) {
      console.warn('Could not save workout history to localStorage:', error);
    }
  }

  private loadWorkoutHistory(): void {
    try {
      const saved = localStorage.getItem('workoutHistory');
      if (saved) {
        const history: WorkoutSession[] = JSON.parse(saved);
        // Convert date strings back to Date objects
        history.forEach(session => {
          session.startTime = new Date(session.startTime);
          if (session.endTime) {
            session.endTime = new Date(session.endTime);
          }
          session.exercises.forEach(exercise => {
            exercise.startTime = new Date(exercise.startTime);
            if (exercise.endTime) {
              exercise.endTime = new Date(exercise.endTime);
            }
          });
        });
        this.workoutHistorySubject.next(history);
      }
    } catch (error) {
      console.warn('Could not load workout history from localStorage:', error);
    }
  }
}
