// Load a screen's code only when it is first opened (code splitting).
// The first load used to download every screen at once (~1.4 MB of JS, ~400 KB gzipped) — workouts,
// camera training, tracks, settings… — before a new user saw anything. Each screen wrapped here
// becomes its own small file that the browser fetches the first time the screen opens.
// The wrapper carries its own Suspense, so only that screen shows a short loader, not the whole app.

import { lazy, Suspense } from 'react'

function Loader() {
  return (
    <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid rgba(217,179,76,0.25)', borderTopColor: '#D9B34C',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

export default function lazyScreen(load) {
  const Lazy = lazy(load)
  function LazyScreen(props) {
    return (
      <Suspense fallback={<Loader />}>
        <Lazy {...props} />
      </Suspense>
    )
  }
  return LazyScreen
}
