/** Display profiles for chat actors — UI labels only; engine IDs stay planner/navigator/etc. */
export const ACTOR_PROFILES = {
  user: {
    name: 'You',
    icon: 'icons/user.svg',
    iconBackground: '#0B1B33',
  },
  system: {
    name: 'OWeb',
    icon: 'icons/system.svg',
    iconBackground: '#0B1B33',
  },
  planner: {
    name: 'Super Agent',
    icon: 'icons/planner.svg',
    iconBackground: '#0B1B33',
  },
  navigator: {
    name: 'Browser',
    icon: 'icons/navigator.svg',
    iconBackground: '#0A86E0',
  },
  validator: {
    name: 'Checker',
    icon: 'icons/validator.svg',
    iconBackground: '#16406B',
  },
  manager: {
    name: 'Manager',
    icon: 'icons/manager.svg',
    iconBackground: '#16406B',
  },
  evaluator: {
    name: 'Evaluator',
    icon: 'icons/evaluator.svg',
    iconBackground: '#16406B',
  },
} as const;

export type ActorProfileKey = keyof typeof ACTOR_PROFILES;
