import { asset } from '../utils/asset'
import type { DJ } from './types'

/* The roster. Order here is the carousel order.
 * accent: 'green' | 'cyan' | 'magenta' | 'amber' — drives the card's --acc.
 * tag: 'RESIDENT' | 'GUEST' | 'PAST'
 * photo: path under /public, or null for a typographic (no-photo) card.
 * track: SoundCloud URL the profile player loads.
 */

export const DJ_DEFAULT_TRACK = 'https://soundcloud.com/forss/flickermood'

export const DJS: DJ[] = [
  {
    id: 'summers',
    name: 'SUMMERS',
    kicker: '// RESIDENT',
    genre: 'TECH HOUSE',
    city: 'SF',
    tag: 'RESIDENT',
    accent: 'magenta',
    photo: asset('media/dj-01.jpg'),
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
    next: true,
  },
  {
    id: 'cat-liu',
    name: 'CAT LIU',
    kicker: '// RESIDENT',
    genre: 'HOUSE',
    city: 'SF',
    tag: 'RESIDENT',
    accent: 'cyan',
    photo: asset('media/dj-02.jpg'),
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'sergi-ooh',
    name: 'SERGI (OOH)',
    kicker: '// RESIDENT',
    genre: 'TECHNO',
    city: 'SF',
    tag: 'RESIDENT',
    accent: 'green',
    photo: asset('media/dj-03.jpg'),
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'vrok',
    name: 'VROK',
    kicker: '// RESIDENT',
    genre: 'INDIE DANCE',
    city: 'SF',
    tag: 'RESIDENT',
    accent: 'amber',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'void-sys',
    name: 'VOID.SYS',
    kicker: '// GUEST',
    genre: 'TECHNO',
    city: null,
    tag: 'GUEST',
    accent: 'cyan',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'analog-decay',
    name: 'ANALOG_DECAY',
    kicker: '// GUEST',
    genre: 'ELECTRO',
    city: null,
    tag: 'GUEST',
    accent: 'magenta',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'kt-909',
    name: 'KT-909',
    kicker: '// GUEST',
    genre: 'ACID / LIVE',
    city: null,
    tag: 'GUEST',
    accent: 'green',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: '303-queen',
    name: '303_QUEEN',
    kicker: '// GUEST',
    genre: 'ACID HOUSE',
    city: null,
    tag: 'PAST',
    accent: 'amber',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'modular-moth',
    name: 'MODULAR_MOTH',
    kicker: '// GUEST',
    genre: 'AMBIENT TECHNO',
    city: null,
    tag: 'PAST',
    accent: 'cyan',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
  {
    id: 'sysadmin',
    name: 'SYSADMIN',
    kicker: '// GUEST',
    genre: 'TECHNO',
    city: null,
    tag: 'PAST',
    accent: 'magenta',
    photo: null,
    track: DJ_DEFAULT_TRACK,
    socials: { soundcloud: '#', instagram: '#', spotify: '#' },
  },
]

export const findDJ = (id: string | undefined): DJ | undefined =>
  id ? DJS.find((d) => d.id === id) : undefined

export const djIndex = (id: string | undefined): number =>
  id ? DJS.findIndex((d) => d.id === id) : -1
