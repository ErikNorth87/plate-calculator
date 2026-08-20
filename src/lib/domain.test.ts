import { describe, expect, it } from 'vitest'
import {
  roundedOptions,
  selectRoundedWeight,
  solvePartnered,
  solvePlates,
  workingWeight,
} from './domain'

describe('working weights and rounding', () => {
  it('applies the selected percentage to the 1RM', () => {
    expect(workingWeight(315, 80)).toBe(252)
  })

  it('returns both neighboring loadable weights', () => {
    expect(roundedOptions(252, 45)).toEqual({
      exact: false,
      lower: 250,
      upper: 255,
    })
    expect(selectRoundedWeight(252, 45, 'down')).toBe(250)
    expect(selectRoundedWeight(252, 45, 'up')).toBe(255)
  })

  it('does not round below an empty bar', () => {
    expect(roundedOptions(20, 45)).toEqual({
      exact: false,
      lower: null,
      upper: 45,
    })
  })

  it('rounds to 0.5 lb steps when change plates are enabled', () => {
    expect(roundedOptions(252.2, 45, true)).toEqual({
      exact: false,
      lower: 252,
      upper: 252.5,
    })
    expect(selectRoundedWeight(252.2, 45, 'down', true)).toBe(252)
    expect(selectRoundedWeight(252.2, 45, 'up', true)).toBe(252.5)
  })
})

describe('plate solving', () => {
  it('uses the minimum number of plates per side', () => {
    expect(solvePlates(185, 45)).toEqual([45, 25])
    expect(solvePlates(225, 45)).toEqual([45, 45])
  })

  it('builds the heavier load by adding the minimum plates', () => {
    expect(solvePartnered(185, 225, 45)).toEqual({
      base: [45, 25],
      addOns: [15, 5],
      higher: [45, 25, 15, 5],
    })
  })

  it('uses no add-ons when both rounded targets match', () => {
    expect(solvePartnered(135, 135, 45).addOns).toEqual([])
  })

  it('loads fractional change plates when enabled', () => {
    expect(solvePlates(136, 45, true)).toEqual([45, 0.5])
    expect(solvePlates(135.5, 45, true)).toEqual([45, 0.25])
    expect(solvePlates(137, 45, true)).toEqual([45, 1])
  })
})
