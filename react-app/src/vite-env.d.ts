/// <reference types="vite/client" />

// The wordmark is inlined as a string so the glitch pass can rasterize it.
declare module '*.svg?raw' {
  const content: string
  export default content
}

// SoundCloud's widget API attaches itself to window when the script loads.
// It may never arrive (blocked, offline) — every use site must handle that.
interface SCWidgetEvents {
  READY: string
  PLAY: string
  PAUSE: string
  FINISH: string
  PLAY_PROGRESS: string
}

interface SCWidget {
  bind(event: string, cb: (e: { relativePosition: number; currentPosition: number }) => void): void
  unbind(event: string): void
  toggle(): void
  pause(): void
  seekTo(ms: number): void
  getDuration(cb: (ms: number) => void): void
  getCurrentSound(cb: (sound: { title?: string; user?: { username?: string } }) => void): void
}

interface Window {
  SC?: {
    Widget: ((el: HTMLIFrameElement) => SCWidget) & { Events: SCWidgetEvents }
  }
}
