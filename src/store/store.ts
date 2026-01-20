import type {
  AppState,
  StateKey,
  Listener,
  Unsubscribe,
  Character,
  CharacterSummary,
  ModuleMetadata,
  ModulePack,
  Route,
  WizardState,
} from '../types/index.ts';

const initialState: AppState = {
  currentRoute: 'start',
  currentCharacterId: null,
  currentCharacter: null,
  characters: [],
  modules: [],
  loadedPacks: [],
  wizard: {
    currentStep: 0,
    totalSteps: 5,
  },
  isLoading: false,
  error: null,
};

type ListenerMap = {
  [K in StateKey]?: Set<Listener<AppState[K]>>;
};

class Store {
  private state: AppState;
  private listeners: ListenerMap = {};
  private globalListeners: Set<Listener<AppState>> = new Set();

  constructor() {
    this.state = { ...initialState };
  }

  getState(): Readonly<AppState> {
    return this.state;
  }

  get<K extends StateKey>(key: K): AppState[K] {
    return this.state[key];
  }

  set<K extends StateKey>(key: K, value: AppState[K]) {
    if (this.state[key] === value) return;

    this.state = { ...this.state, [key]: value };
    this.notifyListeners(key);
  }

  update(partial: Partial<AppState>) {
    const changedKeys: StateKey[] = [];

    for (const key of Object.keys(partial) as StateKey[]) {
      if (this.state[key] !== partial[key]) {
        changedKeys.push(key);
      }
    }

    if (changedKeys.length === 0) return;

    this.state = { ...this.state, ...partial };
    changedKeys.forEach((key) => this.notifyListeners(key));
  }

  private notifyListeners<K extends StateKey>(key: K) {
    const keyListeners = this.listeners[key];
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        (listener as Listener<AppState[K]>)(this.state[key]);
      });
    }

    this.globalListeners.forEach((listener) => listener(this.state));
  }

  subscribe<K extends StateKey>(key: K, listener: Listener<AppState[K]>): Unsubscribe {
    if (!this.listeners[key]) {
      this.listeners[key] = new Set();
    }
    this.listeners[key]!.add(listener as Listener<AppState[StateKey]>);

    listener(this.state[key]);

    return () => {
      this.listeners[key]?.delete(listener as Listener<AppState[StateKey]>);
    };
  }

  subscribeAll(listener: Listener<AppState>): Unsubscribe {
    this.globalListeners.add(listener);
    listener(this.state);

    return () => {
      this.globalListeners.delete(listener);
    };
  }

  setRoute(route: Route) {
    this.set('currentRoute', route);
  }

  setCurrentCharacter(character: Character | null) {
    this.update({
      currentCharacter: character,
      currentCharacterId: character?.id ?? null,
    });
  }

  setCharacters(characters: CharacterSummary[]) {
    this.set('characters', characters);
  }

  addCharacter(summary: CharacterSummary) {
    this.set('characters', [...this.state.characters, summary]);
  }

  removeCharacter(id: string) {
    this.set(
      'characters',
      this.state.characters.filter((c) => c.id !== id)
    );
  }

  setModules(modules: ModuleMetadata[]) {
    this.set('modules', modules);
  }

  toggleModule(moduleId: string, enabled: boolean) {
    this.set(
      'modules',
      this.state.modules.map((m) =>
        m.id === moduleId ? { ...m, enabled } : m
      )
    );
  }

  setLoadedPacks(packs: ModulePack[]) {
    this.set('loadedPacks', packs);
  }

  addLoadedPack(pack: ModulePack) {
    const existing = this.state.loadedPacks.find((p) => p.id === pack.id);
    if (existing) {
      this.set(
        'loadedPacks',
        this.state.loadedPacks.map((p) => (p.id === pack.id ? pack : p))
      );
    } else {
      this.set('loadedPacks', [...this.state.loadedPacks, pack]);
    }
  }

  setWizardStep(step: number) {
    this.set('wizard', { ...this.state.wizard, currentStep: step });
  }

  updateWizard(update: Partial<WizardState>) {
    this.set('wizard', { ...this.state.wizard, ...update });
  }

  setLoading(isLoading: boolean) {
    this.set('isLoading', isLoading);
  }

  setError(error: string | null) {
    this.set('error', error);
  }

  reset() {
    this.state = { ...initialState };
    Object.keys(this.listeners).forEach((key) => {
      this.notifyListeners(key as StateKey);
    });
    this.globalListeners.forEach((listener) => listener(this.state));
  }
}

export const store = new Store();
