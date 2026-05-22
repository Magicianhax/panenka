"use client";

// Audio manager with per-channel mixing (music / crowd / sfx) + a master level and mute.
// Settings persist globally in localStorage. Autoplay-safe (starts after first user gesture).

export type Sfx =
  | "whistle" | "kick" | "goal" | "save" | "lockin" | "click" | "victory" | "defeat" | "reaction";

const SFX_VOL: Record<Sfx, number> = {
  whistle: 0.6, kick: 0.7, goal: 0.85, save: 0.85, lockin: 0.55,
  click: 0.3, victory: 0.85, defeat: 0.7, reaction: 0.45,
};
const MUSIC_BASE = 0.35;
const CROWD_BASE = 0.45;
const KEY = "xcup:sound";

export type SoundSettings = { master: number; music: number; crowd: number; sfx: number; muted: boolean };
const DEFAULTS: SoundSettings = { master: 0.7, music: 1, crowd: 1, sfx: 1, muted: false };

let s: SoundSettings = { ...DEFAULTS };
let primed = false;
let music: HTMLAudioElement | null = null;
let crowd: HTMLAudioElement | null = null;
let wantMusic = false;
let wantCrowd = false;
const listeners = new Set<() => void>();

const ready = () => typeof window !== "undefined";

if (ready()) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    s = { ...DEFAULTS, ...saved };
  } catch { /* keep defaults */ }
}

function persist() {
  if (ready()) window.localStorage.setItem(KEY, JSON.stringify(s));
}

const musicVol = () => (s.muted ? 0 : MUSIC_BASE * s.master * s.music);
const crowdVol = () => (s.muted ? 0 : CROWD_BASE * s.master * s.crowd);

function loop(src: string): HTMLAudioElement {
  const a = new Audio(src);
  a.loop = true;
  return a;
}

function applyLoops() {
  if (music) music.volume = musicVol();
  if (crowd) crowd.volume = crowdVol();
  if (!primed) return;
  if (wantMusic && musicVol() > 0) music?.play().catch(() => {});
  else music?.pause();
  if (wantCrowd && crowdVol() > 0) crowd?.play().catch(() => {});
  else crowd?.pause();
}

/** Call once on the first real user gesture to unlock audio. */
export function primeAudio() {
  if (!ready() || primed) return;
  primed = true;
  music = loop("/audio/music.mp3");
  crowd = loop("/audio/crowd.mp3");
  wantMusic = true;
  applyLoops();
}

export function playSfx(name: Sfx) {
  if (!ready() || s.muted) return;
  const vol = (SFX_VOL[name] ?? 0.5) * s.master * s.sfx;
  if (vol <= 0) return;
  const a = new Audio(`/audio/${name}.mp3`);
  a.volume = Math.min(1, vol);
  a.play().catch(() => {});
}

export function setCrowd(on: boolean) {
  wantCrowd = on;
  if (!crowd) return;
  if (on && primed && crowdVol() > 0) crowd.play().catch(() => {});
  else { crowd.pause(); if (!on) crowd.currentTime = 0; }
}

// ---- settings API ----
export function getSettings(): SoundSettings {
  return s;
}
export function update(partial: Partial<SoundSettings>) {
  s = { ...s, ...partial };
  persist();
  applyLoops();
  listeners.forEach((l) => l());
}
export function toggleMuted() {
  update({ muted: !s.muted });
}
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
