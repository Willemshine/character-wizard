import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { EQUIPMENT_OPTIONS } from '../../types/character';

export function Step7Equipment() {
  const { character, setEquipment, nextStep, prevStep } = useCharacterStore();
  const [equipment, setEquipmentLocal] = useState<string[]>(character.equipment);
  const [gold, setGold] = useState(character.gold);

  useEffect(() => {
    setEquipment(equipment, gold);
  }, [equipment, gold, setEquipment]);

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipmentLocal(equipment.filter((e) => e !== item));
    } else {
      setEquipmentLocal([...equipment, item]);
    }
  };

  const isValid = equipment.length >= 1;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Equipment</h2>
      <p className="step-description">
        Select your starting equipment and gold.
      </p>

      <div className="form-group">
        <label>Starting Gold</label>
        <input
          type="number"
          min={0}
          value={gold}
          onChange={(e) => setGold(Math.max(0, parseInt(e.target.value) || 0))}
          placeholder="Enter starting gold"
        />
      </div>

      <div className="form-group">
        <label>
          Equipment <span className="required">*</span> (select at least 1)
        </label>
      </div>

      <div className="checkbox-group">
        {EQUIPMENT_OPTIONS.map((item) => (
          <label
            key={item}
            className={`checkbox-item ${equipment.includes(item) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={equipment.includes(item)}
              onChange={() => toggleEquipment(item)}
            />
            {item}
          </label>
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
