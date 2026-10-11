import CombatPathScreen from '../combat/CombatPathScreen'
import { MT_LEVELS, MT_L1_TECHNIQUES } from '../../data/muayThaiPath'
import { getMuayThaiState, muayThaiEngine } from '../../utils/muayThaiProgress'
import { useLang } from '../../context/LangContext'

export default function MuayThaiPathScreen({
  profile,
  onStartWorkout,
  onFreeTraining,
  onClose,
  onQuickLegWork,
  onQuickHandsElbows,
  quickDuration,
}) {
  const { t: tr } = useLang()
  const tmt = tr.workouts.combat.mt
  const state = getMuayThaiState(profile)
  return (
    <CombatPathScreen
      title={tmt.title}
      levels={MT_LEVELS}
      levelOneTechniques={MT_L1_TECHNIQUES}
      state={state}
      engine={muayThaiEngine}
      freePracticeLabel={tmt.free}
      allCompletedLabel={tmt.allDone}
      onStartWorkout={onStartWorkout}
      onFreeTraining={onFreeTraining}
      onClose={onClose}
      onQuickLegWork={onQuickLegWork}
      onQuickHandsElbows={onQuickHandsElbows}
      quickDuration={quickDuration}
    />
  )
}
