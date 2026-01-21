import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import type { AbilityScores } from '../../types/character';

const ABILITIES: (keyof AbilityScores)[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

const ABILITY_LABELS: Record<keyof AbilityScores, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const POINT_BUY_TOTAL = 27;
const POINT_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export function Step4AbilityScores() {
  const { character, setAbilityScores, nextStep, prevStep } = useCharacterStore();
  const [scores, setScores] = useState<AbilityScores>(character.abilityScores);

  useEffect(() => {
    setAbilityScores(scores);
  }, [scores, setAbilityScores]);

  const updateScore = (ability: keyof AbilityScores, value: number) => {
    const clampedValue = Math.max(8, Math.min(15, value));
    setScores((prev) => ({ ...prev, [ability]: clampedValue }));
  };

  const pointsUsed = ABILITIES.reduce((sum, ability) => {
    return sum + (POINT_COSTS[scores[ability]] || 0);
  }, 0);

  const pointsRemaining = POINT_BUY_TOTAL - pointsUsed;
  const isValid = pointsRemaining >= 0;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Ability Scores</h2>
      <p className="step-description">
        Set your character's ability scores using point buy (8-15 per ability).
      </p>

      <div className={`points-remaining ${pointsRemaining === 0 ? 'complete' : ''}`}>
        Points Remaining: <strong>{pointsRemaining}</strong> / {POINT_BUY_TOTAL}
      </div>

      <div className="ability-scores">
        {ABILITIES.map((ability) => (
          <div key={ability} className="ability-score-item">
            <label>{ABILITY_LABELS[ability]}</label>
            <input
              type="number"
              min={8}
              max={15}
              value={scores[ability]}
              onChange={(e) => updateScore(ability, parseInt(e.target.value) || 8)}
            />
            <div className="ability-modifier">
              {formatModifier(calculateModifier(scores[ability]))}
            </div>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isValid}
        >
          Next
        </button>
      </div>
    </div>
  );
}
