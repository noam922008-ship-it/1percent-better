import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { dirFor } from '../i18n/detectLang'

// Chevrons that follow the reading direction: "forward" points left in Hebrew (rtl), right in English (ltr).
export function ForwardChevron(props) {
  const { lang } = useLang()
  const Icon = dirFor(lang) === 'rtl' ? ChevronLeft : ChevronRight
  return <Icon data-dir-chevron="forward" {...props} />
}

export function BackChevron(props) {
  const { lang } = useLang()
  const Icon = dirFor(lang) === 'rtl' ? ChevronRight : ChevronLeft
  return <Icon data-dir-chevron="back" {...props} />
}
