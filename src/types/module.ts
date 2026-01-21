export interface ModuleRace {
  id: string;
  name: string;
  description: string;
  abilityBonuses: Partial<Record<string, number>>;
  traits: string[];
  speed: number;
  languages: string[];
}

export interface ModuleClass {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrows: string[];
  skillChoices: {
    count: number;
    options: string[];
  };
  startingEquipment: string[];
  features: ModuleClassFeature[];
}

export interface ModuleClassFeature {
  name: string;
  level: number;
  description: string;
}

export interface ModuleBackground {
  id: string;
  name: string;
  description: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: number;
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
}

export interface ModuleSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
}

export interface ModuleEquipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'gear' | 'tool';
  cost: string;
  weight: number;
  description: string;
  properties?: string[];
}

export interface ModulePack {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  races?: ModuleRace[];
  classes?: ModuleClass[];
  backgrounds?: ModuleBackground[];
  spells?: ModuleSpell[];
  equipment?: ModuleEquipment[];
}

export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  isBuiltIn: boolean;
  isUploaded: boolean;
}
