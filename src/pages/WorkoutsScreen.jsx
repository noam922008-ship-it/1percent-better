import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'

// Labels come from t.workouts.categories / t.workouts.exercises, by id
const WORKOUT_CATEGORIES = [
  {
    id: 'strength',
    icon: '💪',
    exercises: [
      { id: 'pushups',  trackId: 'strength-pushups' },
      { id: 'pullups',  trackId: 'strength-pullups' },
      { id: 'squats',   trackId: 'strength-squats'  },
      { id: 'dips',     trackId: null               },
    ],
  },
  {
    id: 'cardio',
    icon: '🏃',
    exercises: [
      { id: 'run',  trackId: 'cardio-run'  },
      { id: 'walk', trackId: 'cardio-walk' },
    ],
  },
  {
    id: 'combat',
    icon: '🥊',
    exercises: [
      { id: 'boxing',   trackId: 'boxing-muaythai' },
      { id: 'muaythai', trackId: 'boxing-muaythai' },
    ],
  },
]

export default function WorkoutsScreen({ onStartWorkout, onCombat, onBoxing, onMuayThai }) {
  const { t: tr } = useLang()
  const tw = tr.workouts
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.25rem' }}>
      <h2 style={{ color: '#F4F1E8', fontWeight: 800, fontSize: '1rem', margin: '0 0 1rem' }}>{tw.title}</h2>
      {WORKOUT_CATEGORIES.map(cat => (
        <div key={cat.id} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
            <span style={{ color: '#F4F1E8', fontWeight: 800, fontSize: '0.9rem' }}>{tw.categories[cat.id].label}</span>
            <span style={{ color: '#71717A', fontSize: '0.72rem' }}>— {tw.categories[cat.id].desc}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {cat.exercises.map(ex => {
              const { name, desc } = tw.exercises[ex.id]
              return (
                <button
                  key={ex.id}
                  className="btn-tactile"
                  onClick={() => {
                    if (cat.id === 'combat' && ex.id === 'boxing') {
                      onBoxing?.()
                    } else if (cat.id === 'combat' && ex.id === 'muaythai') {
                      onMuayThai?.()
                    } else if (cat.id === 'combat') {
                      onCombat?.()
                    } else {
                      onStartWorkout({ id: ex.id, name, emoji: cat.icon, desc, trackId: ex.trackId })
                    }
                  }}
                  style={{
                    background: '#111317', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '0.9rem 0.85rem',
                    textAlign: 'start', cursor: 'pointer',
                  }}
                  aria-label={fmt(tw.startAria, { name })}
                >
                  <div style={{ color: '#F4F1E8', fontSize: '0.87rem', fontWeight: 800, marginBottom: '0.2rem' }}>{name}</div>
                  <div style={{ color: '#71717A', fontSize: '0.7rem' }}>{desc}</div>
                  <div style={{ marginTop: '0.5rem', color: 'rgba(232,232,232,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>{tw.start}</div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
