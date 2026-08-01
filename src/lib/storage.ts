import type { AppData, Workout } from './domain'

const STORAGE_KEY = 'plate-calculator:v1'

export const EMPTY_DATA: AppData = {
  profile: null,
  lifts: [],
  partners: [],
  workouts: [],
  lastPartnerId: null,
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DATA
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      profile: parsed.profile ?? null,
      lifts: Array.isArray(parsed.lifts) ? parsed.lifts : [],
      partners: Array.isArray(parsed.partners) ? parsed.partners : [],
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      lastPartnerId: parsed.lastPartnerId ?? null,
    }
  } catch {
    return EMPTY_DATA
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function publicShareUrl(): string | null {
  const configured = import.meta.env.VITE_PUBLIC_URL?.trim()
  if (configured) return configured
  if (location.protocol === 'https:' && location.hostname !== 'localhost') {
    return new URL(import.meta.env.BASE_URL, location.origin).toString()
  }
  return null
}

export interface NeutralWorkoutExport {
  exercise: string
  completedAt: string
  mode: string
  athletes: Array<{
    name: string
    sets: Array<{ percentage: number; targetWeightLb: number; loadedWeightLb: number; reps?: number }>
  }>
}

export function toNeutralWorkout(workout: Workout): NeutralWorkoutExport {
  const athletes: NeutralWorkoutExport['athletes'] = [
    {
      name: workout.userName,
      sets: workout.sets.map((set) => ({
        percentage: set.pct,
        targetWeightLb: set.user.targetWeight,
        loadedWeightLb: set.user.loadedWeight,
        reps: set.user.reps,
      })),
    },
  ]

  if (workout.partnerName) {
    athletes.push({
      name: workout.partnerName,
      sets: workout.sets
        .filter((set) => set.partner)
        .map((set) => ({
          percentage: set.pct,
          targetWeightLb: set.partner!.targetWeight,
          loadedWeightLb: set.partner!.loadedWeight,
          reps: set.partner!.reps,
        })),
    })
  }

  return {
    exercise: workout.liftName,
    completedAt: workout.completedAt,
    mode: workout.mode,
    athletes,
  }
}
