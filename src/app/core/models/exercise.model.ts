export interface Exercise {
  id: string;
  name: string;
  description?: string;
  phase: number;
  sets: number;
  reps?: number;
  holdSeconds?: number;
  perRepHoldSeconds?: number;
  restBetweenSetsSeconds?: number;
  perRepRestSeconds?: number;
}

export interface ExercisePhase {
  phase: number;
  name: string;
  exercises: Exercise[];
  restBetweenExercisesSeconds: number;
}

