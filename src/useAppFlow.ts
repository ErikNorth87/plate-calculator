import { useEffect, useMemo, useState } from 'react'
import {
  roundedOptions,
  selectRoundedWeight,
  solvePartnered,
  solvePlates,
  workingWeight,
  type AppData,
  type Lift,
  type Partner,
  type RoundDirection,
  type SetResult,
  type WorkoutMode,
} from './lib/domain'
import { createId, loadData, saveData } from './lib/storage'
import type { RoundPerson } from './workout-screens'

export type Screen =
  | 'home' | 'profile' | 'lift-form' | 'mode' | 'partner-select' | 'partner-form'
  | 'percentage' | 'round' | 'load' | 'summary' | 'history' | 'settings'

interface PendingSet {
  pct: number
  userTarget: number
  partnerTarget?: number
}

interface PartnerLoad {
  lowerKey: 'user' | 'partner'
  base: number[]
  addOns: number[]
}

export function useAppFlow() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [screen, setScreen] = useState<Screen>(data.profile ? 'home' : 'profile')
  const [selectedLiftId, setSelectedLiftId] = useState<string | null>(null)
  const [editingLift, setEditingLift] = useState<Lift | undefined>()
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>()
  const [partnerFormDestination, setPartnerFormDestination] =
    useState<'percentage' | 'settings'>('percentage')
  const [mode, setMode] = useState<WorkoutMode>('solo')
  const [sets, setSets] = useState<SetResult[]>([])
  const [pending, setPending] = useState<PendingSet | null>(null)
  const [currentSet, setCurrentSet] = useState<SetResult | null>(null)
  const [partnerLoad, setPartnerLoad] = useState<PartnerLoad | null>(null)

  useEffect(() => saveData(data), [data])

  const lift = useMemo(
    () => data.lifts.find((item) => item.id === selectedLiftId),
    [data.lifts, selectedLiftId],
  )
  const partner = useMemo(
    () =>
      mode === 'partnered'
        ? data.partners.find((item) => item.id === activePartnerId)
        : undefined,
    [data.partners, activePartnerId, mode],
  )
  const lastPartner = data.partners.find((item) => item.id === data.lastPartnerId) ?? null

  const openLift = (item: Lift) => {
    setSelectedLiftId(item.id)
    setSets([])
    setCurrentSet(null)
    setActivePartnerId(null)
    setScreen('mode')
  }

  const chooseMode = (nextMode: WorkoutMode) => {
    setMode(nextMode)
    setSets([])
    if (nextMode === 'solo') setActivePartnerId(null)
    setScreen(nextMode === 'solo' ? 'percentage' : 'partner-select')
  }

  const choosePartner = (item: Partner) => {
    setActivePartnerId(item.id)
    setEditingPartner(item)
    if (!item.oneRmsByLiftId[lift!.id]) {
      setPartnerFormDestination('percentage')
      setScreen('partner-form')
    } else {
      setData((current) => ({ ...current, lastPartnerId: item.id }))
      setScreen('percentage')
    }
  }

  const savePartner = (name: string, oneRm: number) => {
    if (!lift) return
    const partnerId = editingPartner?.id ?? createId()
    setData((current) => {
      const existing = current.partners.find((item) => item.id === partnerId)
      const saved: Partner = {
        id: partnerId,
        name,
        oneRmsByLiftId: { ...(existing?.oneRmsByLiftId ?? {}), [lift.id]: oneRm },
      }
      return {
        ...current,
        partners: existing
          ? current.partners.map((item) => (item.id === partnerId ? saved : item))
          : [...current.partners, saved],
        lastPartnerId: partnerId,
      }
    })
    setActivePartnerId(partnerId)
    setEditingPartner(undefined)
    setScreen(partnerFormDestination)
  }

  const deletePartner = (item: Partner) => {
    setData((current) => ({
      ...current,
      partners: current.partners.filter((partner) => partner.id !== item.id),
      lastPartnerId: current.lastPartnerId === item.id ? null : current.lastPartnerId,
    }))
    setActivePartnerId((current) => (current === item.id ? null : current))
    if (editingPartner?.id === item.id) setEditingPartner(undefined)
  }

  const choosePercentage = (pct: number) => {
    if (!lift || !data.profile) return
    const next: PendingSet = {
      pct,
      userTarget: workingWeight(lift.oneRm, pct),
      partnerTarget: partner ? workingWeight(partner.oneRmsByLiftId[lift.id], pct) : undefined,
    }
    setPending(next)
    const userOptions = roundedOptions(next.userTarget, data.profile.barWeight)
    const partnerOptions = next.partnerTarget === undefined
      ? null
      : roundedOptions(next.partnerTarget, data.profile.barWeight)

    if (userOptions.exact && (!partnerOptions || partnerOptions.exact)) finalizeSet(next, {})
    else setScreen('round')
  }

  const finalizeSet = (next: PendingSet, choices: Record<string, RoundDirection>) => {
    if (!data.profile || !lift) return
    const bar = data.profile.barWeight
    const userLoaded = selectRoundedWeight(next.userTarget, bar, choices.user ?? 'up')
    const userResult = {
      targetWeight: next.userTarget,
      loadedWeight: userLoaded,
      plates: solvePlates(userLoaded, bar),
    }
    let completed: SetResult = { pct: next.pct, user: userResult }
    let load: PartnerLoad | null = null

    if (partner && next.partnerTarget !== undefined) {
      const partnerLoaded = selectRoundedWeight(next.partnerTarget, bar, choices.partner ?? 'up')
      const lowerKey = userLoaded <= partnerLoaded ? 'user' : 'partner'
      const solved = solvePartnered(Math.min(userLoaded, partnerLoaded), Math.max(userLoaded, partnerLoaded), bar)
      completed = {
        ...completed,
        user: { ...userResult, plates: lowerKey === 'user' ? solved.base : solved.higher },
        partner: {
          partnerId: partner.id,
          targetWeight: next.partnerTarget,
          loadedWeight: partnerLoaded,
          plates: lowerKey === 'partner' ? solved.base : solved.higher,
        },
      }
      load = { lowerKey, base: solved.base, addOns: solved.addOns }
    }

    setCurrentSet(completed)
    setPartnerLoad(load)
    setSets((current) => [...current, completed])
    setScreen('load')
  }

  const roundPeople = (): RoundPerson[] => {
    if (!pending || !data.profile) return []
    const people: RoundPerson[] = [{
      key: 'user',
      name: data.profile.name,
      target: pending.userTarget,
      options: roundedOptions(pending.userTarget, data.profile.barWeight),
    }]
    if (partner && pending.partnerTarget !== undefined) {
      people.push({
        key: 'partner',
        name: partner.name,
        target: pending.partnerTarget,
        options: roundedOptions(pending.partnerTarget, data.profile.barWeight),
      })
    }
    return people
  }

  return {
    data, setData, screen, setScreen, selectedLiftId, setSelectedLiftId,
    editingLift, setEditingLift, editingPartner, setEditingPartner,
    partnerFormDestination, setPartnerFormDestination, mode, sets, setSets,
    pending, currentSet, partnerLoad, lift, partner, lastPartner,
    openLift, chooseMode, choosePartner, savePartner, deletePartner, choosePercentage,
    finalizeSet, roundPeople,
  }
}
