import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import type { Appearance } from '../../types/character';

export function Step10Appearance() {
  const { character, setAppearance, nextStep, prevStep } = useCharacterStore();
  const [appearance, setAppearanceLocal] = useState<Appearance>(character.appearance);

  useEffect(() => {
    setAppearance(appearance);
  }, [appearance, setAppearance]);

  const updateField = (field: keyof Appearance, value: string) => {
    setAppearanceLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="step">
      <h2 className="step-title">Appearance</h2>
      <p className="step-description">
        Describe how your character looks. All fields are optional.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Age</label>
          <input
            type="text"
            value={appearance.age}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="e.g., 25, Young Adult, Elderly"
          />
        </div>

        <div className="form-group">
          <label>Height</label>
          <input
            type="text"
            value={appearance.height}
            onChange={(e) => updateField('height', e.target.value)}
            placeholder="e.g., 5 ft 10 in, Tall, Short"
          />
        </div>

        <div className="form-group">
          <label>Weight</label>
          <input
            type="text"
            value={appearance.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            placeholder="e.g., 180 lbs, Slender, Muscular"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Eyes</label>
          <input
            type="text"
            value={appearance.eyes}
            onChange={(e) => updateField('eyes', e.target.value)}
            placeholder="e.g., Blue, Amber, Heterochromatic"
          />
        </div>

        <div className="form-group">
          <label>Skin</label>
          <input
            type="text"
            value={appearance.skin}
            onChange={(e) => updateField('skin', e.target.value)}
            placeholder="e.g., Fair, Olive, Scarred"
          />
        </div>

        <div className="form-group">
          <label>Hair</label>
          <input
            type="text"
            value={appearance.hair}
            onChange={(e) => updateField('hair', e.target.value)}
            placeholder="e.g., Long black, Bald, Red braids"
          />
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
