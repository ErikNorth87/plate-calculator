export const PLATES = [45, 35, 25, 15, 10, 5, 2.5] as const
export const CHANGE_PLATES = [1, 0.5, 0.25] as const
export const PERCENTAGES = Array.from({ length: 32 }, (_, index) => (index + 1) * 5)

export type BarWeight = 35 | 45
export type WorkoutMode = 'solo' | 'partnered'
export type RoundDirection = 'down' | 'up'

export interface Profile {
  name: string
  barWeight: BarWeight
}

export interface Lift {
  id: string
  name: string
  oneRm: number
}

export interface Partner {
  id: string
  name: string
  oneRmsByLiftId: Record<string, number>
}

export interface PersonSetResult {
  targetWeight: number
  loadedWeight: number
  plates: number[]
  reps?: number
}

export interface SetResult {
  pct: number
  user: PersonSetResult
  partner?: PersonSetResult & { partnerId: string }
}

export interface Workout {
  id: string
  liftId: string
  liftName: string
  mode: WorkoutMode
  completedAt: string
  userName: string
  partnerName?: string
  sets: SetResult[]
}

export interface AppData {
  profile: Profile | null
  lifts: Lift[]
  partners: Partner[]
  workouts: Workout[]
  lastPartnerId: string | null
}

export interface RoundedOptions {
  exact: boolean
  lower: number | null
  upper: number
}

/** 0.01 lb units so 0.25 lb change plates divide evenly. */
const TICK = 100

const toTicks = (weight: number) => Math.round(weight * TICK)
const fromTicks = (ticks: number) => ticks / TICK

export function availablePlates(useChangePlates: boolean): number[] {
  return useChangePlates
    ? [...PLATES, ...CHANGE_PLATES].sort((a, b) => b - a)
    : [...PLATES]
}

/** Smallest plate on one side; total bar steps are 2× this. */
export function minPlateLb(useChangePlates: boolean): number {
  return useChangePlates ? 0.25 : 2.5
}

export function totalIncrementLb(useChangePlates: boolean): number {
  return minPlateLb(useChangePlates) * 2
}

export function workingWeight(oneRm: number, percentage: number): number {
  return Math.round(oneRm * percentage) / 100
}

export function roundedOptions(
  target: number,
  barWeight: BarWeight,
  useChangePlates = false,
): RoundedOptions {
  const targetTicks = toTicks(target)
  const barTicks = toTicks(barWeight)
  const step = toTicks(totalIncrementLb(useChangePlates))
  const delta = targetTicks - barTicks
  const exact = delta >= 0 && delta % step === 0

  if (exact) {
    const weight = fromTicks(targetTicks)
    return { exact: true, lower: weight, upper: weight }
  }

  const lowerTicks =
    delta >= 0 ? barTicks + Math.floor(delta / step) * step : null
  const upperTicks = barTicks + Math.ceil(Math.max(0, delta) / step) * step

  return {
    exact: false,
    lower: lowerTicks === null ? null : fromTicks(lowerTicks),
    upper: fromTicks(upperTicks),
  }
}

export function selectRoundedWeight(
  target: number,
  barWeight: BarWeight,
  direction: RoundDirection,
  useChangePlates = false,
): number {
  const options = roundedOptions(target, barWeight, useChangePlates)
  if (options.exact) return options.upper
  if (direction === 'down' && options.lower !== null) return options.lower
  return options.upper
}

export function solvePlates(
  totalWeight: number,
  barWeight: BarWeight,
  useChangePlates = false,
): number[] {
  const sideTicks = Math.round(((totalWeight - barWeight) * TICK) / 2)
  const unit = toTicks(minPlateLb(useChangePlates))
  if (sideTicks < 0 || sideTicks % unit !== 0) {
    throw new Error('Weight is not loadable with the selected bar.')
  }

  return minimumPlateCombination(sideTicks, useChangePlates)
}

export function solvePartnered(
  lowerWeight: number,
  higherWeight: number,
  barWeight: BarWeight,
  useChangePlates = false,
): { base: number[]; addOns: number[]; higher: number[] } {
  if (higherWeight < lowerWeight) {
    throw new Error('Higher weight must not be below lower weight.')
  }

  const base = solvePlates(lowerWeight, barWeight, useChangePlates)
  const differencePerSideTicks = Math.round(((higherWeight - lowerWeight) * TICK) / 2)
  const addOns = minimumPlateCombination(differencePerSideTicks, useChangePlates)
  return { base, addOns, higher: [...base, ...addOns].sort((a, b) => b - a) }
}

function minimumPlateCombination(targetTicks: number, useChangePlates: boolean): number[] {
  if (targetTicks === 0) return []

  const unit = toTicks(minPlateLb(useChangePlates))
  if (targetTicks < 0 || targetTicks % unit !== 0) {
    throw new Error(
      useChangePlates
        ? 'Plate load must be divisible by 0.25 lb.'
        : 'Plate load must be divisible by 2.5 lb.',
    )
  }

  const target = targetTicks / unit
  const coins = availablePlates(useChangePlates).map((plate) => ({
    plate,
    value: toTicks(plate) / unit,
  }))
  const best: Array<number[] | null> = Array(target + 1).fill(null)
  best[0] = []

  for (let value = 1; value <= target; value += 1) {
    for (const coin of coins) {
      const previous = value - coin.value
      if (previous < 0 || best[previous] === null) continue
      const candidate = [...best[previous]!, coin.plate].sort((a, b) => b - a)
      if (
        best[value] === null ||
        candidate.length < best[value]!.length ||
        (candidate.length === best[value]!.length &&
          candidate.join(',').localeCompare(best[value]!.join(',')) > 0)
      ) {
        best[value] = candidate
      }
    }
  }

  if (best[target] === null) throw new Error('No plate combination found.')
  return best[target]!
}
