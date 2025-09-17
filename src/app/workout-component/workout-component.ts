import {Component, OnDestroy, OnInit} from '@angular/core';
import {Exercise, ExercisePhase} from '../core/models/exercise.model';
import {ALL_EXERCISES} from '../core/data/exercises.data';
import {Subscription} from 'rxjs';
import {TimerServices} from '../core/services/timer-services.service';
import {TtsService} from '../core/services/text-to-speech.service';
import {WorkoutService} from '../core/services/workout.service';

interface WorkoutState {
  isActive: boolean;
  currentPhase: number;
  currentExerciseIndex: number;
  currentSet: number;
  currentRep: number;
  isResting: boolean;
  restType: 'between-sets' | 'between-exercises' | 'per-rep';
  waitingForUser: boolean;
  isFinished: boolean;
}

@Component({
  selector: 'app-workout',
  imports: [],
  templateUrl: './workout-component.html',
  styleUrl: './workout-component.scss'
})
export class WorkoutComponent implements OnInit, OnDestroy {
  exercisePhases = ALL_EXERCISES;
  selectedPhase: ExercisePhase | null = null;
  currentPhase: ExercisePhase | null = null;
  timerSeconds = 0;

  private timerSubscription?: Subscription;
  private completeSubscription?: Subscription;

  workoutState: WorkoutState = {
    isActive: false,
    currentPhase: 0,
    currentExerciseIndex: 0,
    currentSet: 1,
    currentRep: 1,
    isResting: false,
    restType: 'between-exercises',
    waitingForUser: false,
    isFinished: false
  };

  constructor(
    private readonly timerService: TimerServices,
    private readonly ttsService: TtsService,
    private readonly workoutService: WorkoutService
  ) {
  }

  ngOnInit() {
    this.timerSubscription = this.timerService.seconds$.subscribe(seconds => {
      this.timerSeconds = seconds;
    });

    this.completeSubscription = this.timerService.timerComplete$.subscribe(() => {
      // C'est ici que l'événement est remonté et traité !
      this.handleTimerComplete();
    });
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
    this.timerService.stop();
  }

  selectPhase(phase: ExercisePhase) {
    this.selectedPhase = phase;
  }

  startWorkout() {
    if (!this.selectedPhase) return;

    this.currentPhase = this.selectedPhase;
    this.workoutState = {
      isActive: true,
      currentPhase: this.selectedPhase.phase,
      currentExerciseIndex: 0,
      currentSet: 1,
      currentRep: 1,
      isResting: true,
      restType: 'between-exercises',
      waitingForUser: false,
      isFinished: false
    };

    // Start workout session tracking
    this.workoutService.startWorkoutSession(this.selectedPhase);

    this.startRestPeriod('between-exercises');
  }

  getCurrentExercise(): Exercise | null {
    if (!this.currentPhase) return null;
    return this.currentPhase.exercises[this.workoutState.currentExerciseIndex] || null;
  }

  startRestPeriod(type: 'between-sets' | 'between-exercises' | 'per-rep') {
    this.workoutState.isResting = true;
    this.workoutState.restType = type;
    this.workoutState.waitingForUser = false;

    let restSeconds = 0;
    const exercise = this.getCurrentExercise();

    switch (type) {
      case 'between-exercises':
        restSeconds = this.currentPhase?.restBetweenExercisesSeconds || 120;
        this.ttsService.speak(`Prochain exercice: ${exercise?.name}. Préparez-vous.`);
        break;
      case 'between-sets':
        restSeconds = exercise?.restBetweenSetsSeconds || 60;
        this.ttsService.speak('Fin du set. Repos.');
        break;
      case 'per-rep':
        restSeconds = exercise?.perRepRestSeconds || 30;
        this.ttsService.speak('Repos entre répétitions.');
        break;
    }

    this.timerService.start(restSeconds);
  }

  handleTimerComplete() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    if (this.workoutState.isResting) {
      this.workoutState.isResting = false;

      if (this.workoutState.restType === 'between-exercises') {
        this.ttsService.speak('Go !');
        this.startExercise();
      } else if (this.workoutState.restType === 'between-sets') {
        this.ttsService.speak('Set suivant !');
        this.startExercise();
      } else {
        this.startExercise();
      }
    } else if (exercise.perRepHoldSeconds && this.workoutState.currentRep <= (exercise.reps || 1)) {
      this.ttsService.speak('Répétition suivante');
      this.completeRep();
    } else if (exercise.holdSeconds) {
      this.completeSet();
    }
  }

  startExercise() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    if (exercise.reps && !exercise.perRepHoldSeconds) {
      // Manual repetitions
      this.workoutState.waitingForUser = true;
      this.ttsService.speak(`${exercise.reps} répétitions à effectuer`);
    } else if (exercise.perRepHoldSeconds) {
      // Timed repetitions
      this.timerService.start(exercise.perRepHoldSeconds);
    } else if (exercise.holdSeconds) {
      // Hold exercise
      this.timerService.start(exercise.holdSeconds);
    }
  }

  completeRep() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    if (exercise.reps && this.workoutState.currentRep < exercise.reps) {
      this.workoutState.currentRep++;

      if (exercise.perRepRestSeconds) {
        this.startRestPeriod('per-rep');
      } else if (exercise.perRepHoldSeconds) {
        this.timerService.start(exercise.perRepHoldSeconds);
      } else {
        // Manual reps, wait for user
        this.workoutState.waitingForUser = true;
      }
    } else {
      this.completeSet();
    }
  }

  completeSet() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    // Update workout service with progress
    this.workoutService.updateExerciseProgress(
      exercise.id,
      this.workoutState.currentSet,
      this.workoutState.currentRep
    );

    if (this.workoutState.currentSet < exercise.sets) {
      this.workoutState.currentSet++;
      this.workoutState.currentRep = 1;
      this.startRestPeriod('between-sets');
    } else {
      this.completeExercise();
    }
  }

  completeExercise() {
    if (!this.currentPhase) return;

    if (this.workoutState.currentExerciseIndex < this.currentPhase.exercises.length - 1) {
      this.workoutState.currentExerciseIndex++;
      this.workoutState.currentSet = 1;
      this.workoutState.currentRep = 1;
      this.startRestPeriod('between-exercises');
    } else {
      this.completeWorkout();
    }
  }

  completeWorkout() {
    this.workoutState.isActive = false;
    this.workoutState.isFinished = true;
    this.timerService.stop();
    this.ttsService.speak('Entraînement terminé ! Félicitations !');

    // Complete workout session tracking
    this.workoutService.completeWorkoutSession();
  }

  testTts() {
    this.ttsService.speak('Test de la synthèse vocale. Tout fonctionne correctement !');
  }

  canCompleteSet(): boolean {
    const exercise = this.getCurrentExercise();
    return exercise?.reps ? this.workoutState.currentRep >= exercise.reps : false;
  }

  getProgressPercentage(): number {
    if (!this.currentPhase) return 0;
    return ((this.workoutState.currentExerciseIndex + 1) / this.currentPhase.exercises.length) * 100;
  }

  getTimerLabel(): string {
    if (this.workoutState.isResting) {
      switch (this.workoutState.restType) {
        case 'between-exercises':
          return 'Préparation exercice suivant';
        case 'between-sets':
          return 'Repos entre sets';
        case 'per-rep':
          return 'Repos entre répétitions';
      }
    }

    const exercise = this.getCurrentExercise();
    if (exercise?.perRepHoldSeconds) return `Répétition ${this.workoutState.currentRep}`;
    if (exercise?.holdSeconds) return 'Maintien position';

    return 'Exercice en cours';
  }

  getStatusMessage(): string {
    if (this.workoutState.isResting) {
      return `Repos - ${this.getTimerLabel()}`;
    }
    if (this.workoutState.waitingForUser) {
      return 'En attente de votre action';
    }
    return 'Exercice en cours';
  }

  pauseWorkout() {
    this.timerService.stop();
    this.ttsService.speak('Entraînement en pause');
  }

  stopWorkout() {
    this.workoutService.cancelWorkoutSession();
    this.resetWorkout();
    this.ttsService.speak('Entraînement arrêté');
  }

  resetWorkout() {
    this.timerService.stop();
    this.workoutState = {
      isActive: false,
      currentPhase: 0,
      currentExerciseIndex: 0,
      currentSet: 1,
      currentRep: 1,
      isResting: false,
      restType: 'between-exercises',
      waitingForUser: false,
      isFinished: false
    };
    this.selectedPhase = null;
    this.currentPhase = null;
  }

  calculatePhaseTime(phase: ExercisePhase): number {
    const totalTimeSeconds = phase.exercises.reduce((acc, exercise, index) => {
      let exerciseTime = 0;

      // Calculer le temps de l'exercice
      if (exercise.reps) {
        const repTime = (exercise.perRepHoldSeconds ?? 0) * exercise.reps +
          (exercise.perRepRestSeconds ?? 0) * Math.max(0, exercise.reps - 1);
        exerciseTime = repTime * exercise.sets;
      } else {
        exerciseTime = (exercise.holdSeconds ?? 0) * exercise.sets;
      }

      // Ajouter le temps de repos entre les séries
      exerciseTime += (exercise.restBetweenSetsSeconds ?? 0) * Math.max(0, exercise.sets - 1);

      // Ajouter le temps de repos entre les exercices, si ce n'est pas le dernier
      if (index < phase.exercises.length - 1) {
        exerciseTime += phase.restBetweenExercisesSeconds ?? 0;
      }

      return acc + exerciseTime;
    }, 0);

    // Convertir en minutes et arrondir à l'entier supérieur
    return Math.ceil(totalTimeSeconds / 60);
  }

  completeSetImmediately(): void {
    if (this.workoutState.isActive && !this.workoutState.isFinished) {
      // Passer immédiatement au set suivant
      this.completeSet();
    }
  }

  isTimerActive(): boolean {
    return !this.workoutState.waitingForUser; // Retourne false si l'utilisateur peut contrôler manuellement
  }
}
