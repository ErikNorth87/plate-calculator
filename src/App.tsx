import { ProfileForm, LiftForm, PartnerForm } from './forms'
import { HomeScreen, HistoryScreen, SettingsScreen } from './library-screens'
import { SummaryScreen } from './summary-screen'
import {
  LoadScreen,
  ModeScreen,
  PartnerSelectScreen,
  PercentageScreen,
  RoundScreen,
} from './workout-screens'
import { createId } from './lib/storage'
import { useAppFlow } from './useAppFlow'

export default function App() {
  const {
    data, setData, screen, setScreen, setSelectedLiftId,
    editingLift, setEditingLift, editingPartner, setEditingPartner,
    partnerFormDestination, setPartnerFormDestination, mode, sets, setSets,
    pending, currentSet, partnerLoad, lift, partner, lastPartner,
    openLift, chooseMode, choosePartner, savePartner, deletePartner, choosePercentage,
    finalizeSet, roundPeople,
  } = useAppFlow()

  if (screen === 'profile') {
    return (
      <ProfileForm
        initial={data.profile}
        onCancel={data.profile ? () => setScreen('settings') : undefined}
        onSave={(profile) => {
          setData((current) => ({ ...current, profile }))
          setScreen('home')
        }}
      />
    )
  }

  if (!data.profile) return null

  if (screen === 'lift-form') {
    return (
      <LiftForm
        initial={editingLift}
        onCancel={() => setScreen('home')}
        onSave={(name, oneRm) => {
          setData((current) => ({
            ...current,
            lifts: editingLift
              ? current.lifts.map((item) =>
                  item.id === editingLift.id ? { ...item, name, oneRm } : item,
                )
              : [...current.lifts, { id: createId(), name, oneRm }],
          }))
          setEditingLift(undefined)
          setScreen('home')
        }}
      />
    )
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        name={data.profile.name}
        lifts={data.lifts}
        workouts={data.workouts}
        onCreate={() => {
          setEditingLift(undefined)
          setScreen('lift-form')
        }}
        onOpen={openLift}
        onEdit={(item) => {
          setEditingLift(item)
          setScreen('lift-form')
        }}
        onHistory={() => setScreen('history')}
        onSettings={() => setScreen('settings')}
      />
    )
  }

  if (screen === 'history') {
    return <HistoryScreen workouts={data.workouts} onBack={() => setScreen('home')} />
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        profile={data.profile}
        partners={data.partners}
        onBack={() => setScreen('home')}
        onEditProfile={() => setScreen('profile')}
        onEditPartner={(item) => {
          const firstLiftId = Object.keys(item.oneRmsByLiftId)[0]
          setSelectedLiftId(firstLiftId)
          setEditingPartner(item)
          setPartnerFormDestination('settings')
          setScreen('partner-form')
        }}
        onDeletePartner={deletePartner}
      />
    )
  }

  if (!lift) {
    return null
  }

  if (screen === 'mode') {
    return <ModeScreen lift={lift} onBack={() => setScreen('home')} onSelect={chooseMode} />
  }

  if (screen === 'partner-select') {
    return (
      <PartnerSelectScreen
        lastPartner={lastPartner}
        lift={lift}
        onBack={() => setScreen('mode')}
        onChoose={choosePartner}
        onNew={() => {
          setEditingPartner(undefined)
          setPartnerFormDestination('percentage')
          setScreen('partner-form')
        }}
      />
    )
  }

  if (screen === 'partner-form') {
    return (
      <PartnerForm
        liftName={lift.name}
        initial={editingPartner}
        currentOneRm={editingPartner?.oneRmsByLiftId[lift.id]}
        onCancel={() => setScreen(partnerFormDestination === 'settings' ? 'settings' : 'partner-select')}
        onSave={savePartner}
      />
    )
  }

  if (screen === 'percentage') {
    return (
      <PercentageScreen
        lift={lift}
        partner={mode === 'partnered' ? partner : undefined}
        previousPct={sets.length ? sets[sets.length - 1].pct : undefined}
        onBack={() => setScreen(mode === 'partnered' ? 'partner-select' : 'mode')}
        onChoose={choosePercentage}
      />
    )
  }

  if (screen === 'round' && pending) {
    return (
      <RoundScreen
        people={roundPeople()}
        onBack={() => setScreen('percentage')}
        onComplete={(choices) => finalizeSet(pending, choices)}
      />
    )
  }

  if (screen === 'load' && currentSet) {
    return (
      <LoadScreen
        currentSet={currentSet}
        mode={mode}
        userName={data.profile.name}
        partnerName={partner?.name}
        barWeight={data.profile.barWeight}
        lowerKey={partnerLoad?.lowerKey}
        base={partnerLoad?.base}
        addOns={partnerLoad?.addOns}
        onNext={() => setScreen('percentage')}
        onComplete={() => setScreen('summary')}
      />
    )
  }

  if (screen === 'summary') {
    return (
      <SummaryScreen
        sets={sets}
        mode={mode}
        userName={data.profile.name}
        partnerName={partner?.name}
        onBack={() => setScreen('load')}
        onSave={(savedSets) => {
          setData((current) => ({
            ...current,
            workouts: [
              ...current.workouts,
              {
                id: createId(),
                liftId: lift.id,
                liftName: lift.name,
                mode,
                completedAt: new Date().toISOString(),
                userName: data.profile!.name,
                partnerName: partner?.name,
                sets: savedSets,
              },
            ],
          }))
          setSets([])
          setScreen('home')
        }}
      />
    )
  }

  return null
}
