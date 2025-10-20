import {ExercisePhase} from '../models/exercise.model';

export const ALL_EXERCISES: ExercisePhase[] = [
  {
    name: 'Activation douces',
    phase: 1,
    restBetweenExercisesSeconds: 60,
    exercises: [
      {
        id: 'quad-sets',
        name: 'Quadriceps sets (contractions statiques)',
        description: 'Allongé, contracte la cuisse en poussant l’arrière du genou contre le sol',
        phase: 1,
        sets: 3,
        reps: 10,
        perRepHoldSeconds: 10,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'straight-leg',
        name: 'Straight leg raises',
        description: 'Allongé, jambe tendue, soulève à 30° et maintiens 5 sec',
        phase: 1,
        sets: 3,
        reps: 12,
        perRepHoldSeconds: 7,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'clamshell',
        name: 'Clamshell (fessiers)',
        phase: 1,
        sets: 4,
        reps: 15,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'bridge',
        name: 'Pont fessier',
        phase: 1,
        sets: 3,
        reps: 15,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'leg-extensions',
        name: 'Leg Extensions (assis)',
        description: 'Assis sur une chaise, lever de jambe tenir la jambe tendue',
        phase: 1,
        sets: 3,
        reps: 10,
        perRepHoldSeconds: 10,
        restBetweenSetsSeconds: 45
      },
    ]
  },
  {
    name: 'Renforcement Fonctionel',
    phase: 2,
    restBetweenExercisesSeconds:60,
    exercises: [
      {
        id: 'straight-leg',
        name: 'Straight leg raises leste de 2kg',
        description: 'Allongé, jambe tendue, soulève à 30° et maintiens 5 sec avec leste de 2kg',
        phase: 1,
        sets: 3,
        reps: 12,
        perRepHoldSeconds: 7,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'clamshell',
        name: 'Clamshell (fessiers)',
        phase: 1,
        sets: 4,
        reps: 15,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'bridge',
        name: 'Pont fessier',
        phase: 1,
        sets: 3,
        reps: 15,
        perRepHoldSeconds: 7,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'mini-squats',
        name: 'Mini-squats (0–30° flexion)',
        phase: 2,
        sets: 3,
        reps: 12,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'single-leg-balance',
        name: 'Équilibre sur une jambe',
        phase: 2,
        sets: 3,
        reps: 1,
        holdSeconds: 30,
        restBetweenSetsSeconds: 30
      }
    ]
  },
  {
    name: 'Stabilité avancée',
    phase: 3,
    restBetweenExercisesSeconds:120,
    exercises: [
      {
        id: 'short-lunges',
        name: 'Fentes statiques courtes',
        phase: 3,
        sets: 3,
        reps: 10,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'bosu-squats',
        name: 'Squats sur BOSU ou coussin',
        phase: 3,
        sets: 3,
        reps: 12,
        restBetweenSetsSeconds: 60
      },
      {
        id: 'band-knee-drives',
        name: 'Montées de genoux avec élastique',
        phase: 3,
        sets: 3,
        reps: 15,
        restBetweenSetsSeconds: 45
      },
      {
        id: 'dynamic-warm',
        name: 'Exercices dynamiques doux',
        phase: 3,
        sets: 1,
        reps: 1
      }
    ]
  }
]
