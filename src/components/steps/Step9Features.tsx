import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';

const COMMON_FEATURES = [
  'Darkvision',
  'Fey Ancestry',
  'Trance',
  'Dwarven Resilience',
  'Lucky',
  'Brave',
  'Rage',
  'Unarmored Defense',
  'Fighting Style',
  'Second Wind',
  'Sneak Attack',
  'Divine Sense',
  'Spellcasting',
  'Wild Shape',
];

const COMMON_TRAITS = [
  'Keen Senses',
  'Stonecunning',
  'Nimble',
  'Naturally Stealthy',
  'Menacing',
  'Relentless Endurance',
  'Savage Attacks',
  'Hellish Resistance',
  'Breath Weapon',
];

export function Step9Features() {
  const { character, setFeaturesAndTraits, nextStep, prevStep } = useCharacterStore();
  const [features, setFeatures] = useState<string[]>(character.features);
  const [traits, setTraits] = useState<string[]>(character.traits);
  const [customFeature, setCustomFeature] = useState('');
  const [customTrait, setCustomTrait] = useState('');

  useEffect(() => {
    setFeaturesAndTraits(features, traits);
  }, [features, traits, setFeaturesAndTraits]);

  const toggleFeature = (feature: string) => {
    if (features.includes(feature)) {
      setFeatures(features.filter((f) => f !== feature));
    } else {
      setFeatures([...features, feature]);
    }
  };

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter((t) => t !== trait));
    } else {
      setTraits([...traits, trait]);
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !features.includes(customFeature.trim())) {
      setFeatures([...features, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const addCustomTrait = () => {
    if (customTrait.trim() && !traits.includes(customTrait.trim())) {
      setTraits([...traits, customTrait.trim()]);
      setCustomTrait('');
    }
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="step">
      <h2 className="step-title">Features & Traits</h2>
      <p className="step-description">
        Select or add features and racial traits for your character.
      </p>

      <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Class Features</h3>
      <div className="checkbox-group">
        {COMMON_FEATURES.map((feature) => (
          <label
            key={feature}
            className={`checkbox-item ${features.includes(feature) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={features.includes(feature)}
              onChange={() => toggleFeature(feature)}
            />
            {feature}
          </label>
        ))}
      </div>

      <div className="form-row" style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label>Add Custom Feature</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              placeholder="Enter custom feature"
              onKeyDown={(e) => e.key === 'Enter' && addCustomFeature()}
            />
            <button className="btn btn-secondary" onClick={addCustomFeature}>
              Add
            </button>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Racial Traits</h3>
      <div className="checkbox-group">
        {COMMON_TRAITS.map((trait) => (
          <label
            key={trait}
            className={`checkbox-item ${traits.includes(trait) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={traits.includes(trait)}
              onChange={() => toggleTrait(trait)}
            />
            {trait}
          </label>
        ))}
      </div>

      <div className="form-row" style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label>Add Custom Trait</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customTrait}
              onChange={(e) => setCustomTrait(e.target.value)}
              placeholder="Enter custom trait"
              onKeyDown={(e) => e.key === 'Enter' && addCustomTrait()}
            />
            <button className="btn btn-secondary" onClick={addCustomTrait}>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
