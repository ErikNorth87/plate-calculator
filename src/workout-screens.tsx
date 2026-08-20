import { useState } from 'react'
import { BarbellDiagram, Header } from './components'
import {
  PERCENTAGES,
  type BarWeight,
  type Lift,
  type Partner,
  type PersonSetResult,
  type RoundDirection,
  type RoundedOptions,
  type SetResult,
  type WorkoutMode,
} from './lib/domain'

export function ModeScreen({
  lift,
  onSelect,
  onBack,
}: {
  lift: Lift
  onSelect: (mode: WorkoutMode, useChangePlates: boolean) => void
  onBack: () => void
}) {
  const [useChangePlates, setUseChangePlates] = useState(false)

  return (
    <>
      <Header title={lift.name} onBack={onBack} />
      <main>
        <div className="intro">
          <span className="eyebrow">1 rep max</span>
          <h2>{lift.oneRm} lb</h2>
          <p>How are you training today?</p>
        </div>
        <button
          type="button"
          className={`change-plates-toggle${useChangePlates ? ' selected' : ''}`}
          aria-pressed={useChangePlates}
          onClick={() => setUseChangePlates((current) => !current)}
        >
          <span>
            <strong>Change plates</strong>
            <small>Include 0.25, 0.5, and 1 lb plates for finer loads</small>
          </span>
          <span className="change-plates-indicator" aria-hidden="true">
            {useChangePlates ? 'On' : 'Off'}
          </span>
        </button>
        <div className="mode-grid">
          <button className="mode-card" onClick={() => onSelect('solo', useChangePlates)}>
            <span className="mode-icon">●</span>
            <strong>Solo</strong>
            <small>Calculate plates for your sets</small>
          </button>
          <button className="mode-card" onClick={() => onSelect('partnered', useChangePlates)}>
            <span className="mode-icon">● ●</span>
            <strong>Partnered</strong>
            <small>Build efficient shared-bar loads</small>
          </button>
        </div>
      </main>
    </>
  )
}

export function PartnerSelectScreen({
  lastPartner,
  lift,
  onChoose,
  onNew,
  onBack,
}: {
  lastPartner: Partner | null
  lift: Lift
  onChoose: (partner: Partner) => void
  onNew: () => void
  onBack: () => void
}) {
  return (
    <>
      <Header title="Choose Partner" onBack={onBack} />
      <main>
        <p className="muted">Partner 1RMs are saved separately for each lift.</p>
        <div className="mode-grid">
          {lastPartner && (
            <button className="mode-card" onClick={() => onChoose(lastPartner)}>
              <span className="eyebrow">Last partner</span>
              <strong>{lastPartner.name}</strong>
              <small>
                {lastPartner.oneRmsByLiftId[lift.id]
                  ? `${lastPartner.oneRmsByLiftId[lift.id]} lb ${lift.name} 1RM`
                  : `Add a ${lift.name} 1RM`}
              </small>
            </button>
          )}
          <button className="mode-card" onClick={onNew}>
            <span className="mode-icon">+</span>
            <strong>New Partner</strong>
            <small>Save a name and 1RM</small>
          </button>
        </div>
      </main>
    </>
  )
}

export function PercentageScreen({
  lift,
  partner,
  previousPct,
  onChoose,
  onBack,
}: {
  lift: Lift
  partner?: Partner
  previousPct?: number
  onChoose: (percentage: number) => void
  onBack: () => void
}) {
  return (
    <>
      <Header title="Choose Percentage" onBack={onBack} />
      <main>
        <div className="stats-strip">
          <div><span>Your 1RM</span><strong>{lift.oneRm} lb</strong></div>
          {partner && <div><span>{partner.name}</span><strong>{partner.oneRmsByLiftId[lift.id]} lb</strong></div>}
        </div>
        <div className="percentage-grid">
          {PERCENTAGES.map((pct) => {
            const isPrevious = previousPct === pct
            return (
              <button
                key={pct}
                className={isPrevious ? 'previous' : undefined}
                onClick={() => onChoose(pct)}
              >
                {isPrevious && <em className="previous-label">Previous</em>}
                <strong>{pct}%</strong>
                <span>{Math.round(lift.oneRm * pct) / 100} lb</span>
              </button>
            )
          })}
        </div>
      </main>
    </>
  )
}

export interface RoundPerson {
  key: 'user' | 'partner'
  name: string
  target: number
  options: RoundedOptions
}

export function RoundScreen({
  people,
  onComplete,
  onBack,
}: {
  people: RoundPerson[]
  onComplete: (choices: Record<string, RoundDirection>) => void
  onBack: () => void
}) {
  const [choices, setChoices] = useState<Record<string, RoundDirection>>({})
  const unresolved = people.filter((person) => !person.options.exact)
  const ready = unresolved.every((person) => choices[person.key])

  return (
    <>
      <Header title="Round Working Weight" onBack={onBack} />
      <main>
        <p className="muted">These targets cannot be loaded exactly. Choose for each lifter.</p>
        {unresolved.map((person) => (
          <section className="round-card" key={person.key}>
            <div><strong>{person.name}</strong><span>Target: {person.target} lb</span></div>
            <div className="round-options">
              {person.options.lower !== null && (
                <button
                  className={choices[person.key] === 'down' ? 'selected' : ''}
                  onClick={() => setChoices({ ...choices, [person.key]: 'down' })}
                >
                  Round down<strong>{person.options.lower} lb</strong>
                </button>
              )}
              <button
                className={choices[person.key] === 'up' ? 'selected' : ''}
                onClick={() => setChoices({ ...choices, [person.key]: 'up' })}
              >
                Round up<strong>{person.options.upper} lb</strong>
              </button>
            </div>
          </section>
        ))}
        <button className="primary full-width" disabled={!ready} onClick={() => onComplete(choices)}>
          Show Plates
        </button>
      </main>
    </>
  )
}

export function LoadScreen({
  currentSet,
  mode,
  userName,
  partnerName,
  barWeight,
  lowerKey,
  base,
  addOns,
  onNext,
  onComplete,
}: {
  currentSet: SetResult
  mode: WorkoutMode
  userName: string
  partnerName?: string
  barWeight: BarWeight
  lowerKey?: 'user' | 'partner'
  base?: number[]
  addOns?: number[]
  onNext: () => void
  onComplete: () => void
}) {
  const user = currentSet.user
  if (mode === 'solo') {
    return (
      <>
        <Header title={`${currentSet.pct}% Set`} />
        <main>
          <BarbellDiagram title={userName} plates={user.plates} barWeight={barWeight} totalWeight={user.loadedWeight} />
          <SetActions onNext={onNext} onComplete={onComplete} />
        </main>
      </>
    )
  }

  const partner = currentSet.partner!
  const lower: PersonSetResult = lowerKey === 'user' ? user : partner
  const higher: PersonSetResult = lowerKey === 'user' ? partner : user
  const lowerName = lowerKey === 'user' ? userName : partnerName!
  const higherName = lowerKey === 'user' ? partnerName! : userName

  return (
    <>
      <Header title={`${currentSet.pct}% Shared Set`} />
      <main>
        <div className="partner-note">Load the top bar first. Add only the highlighted outer plates for the heavier lifter.</div>
        <BarbellDiagram title={`${lowerName} · Base`} plates={base!} barWeight={barWeight} totalWeight={lower.loadedWeight} />
        <BarbellDiagram
          title={`${higherName} · Add ${addOns!.length} per side`}
          plates={[...base!, ...addOns!]}
          unlabeledCount={base!.length}
          barWeight={barWeight}
          totalWeight={higher.loadedWeight}
        />
        <SetActions onNext={onNext} onComplete={onComplete} />
      </main>
    </>
  )
}

function SetActions({ onNext, onComplete }: { onNext: () => void; onComplete: () => void }) {
  return (
    <div className="sticky-actions">
      <button className="secondary" onClick={onNext}>Next Set</button>
      <button className="primary" onClick={onComplete}>Complete</button>
    </div>
  )
}
