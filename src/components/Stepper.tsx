import { useCharacterStore } from '../store/characterStore';
import './Stepper.css';

const STEPS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Race' },
  { number: 3, label: 'Class' },
  { number: 4, label: 'Abilities' },
  { number: 5, label: 'Background' },
  { number: 6, label: 'Skills' },
  { number: 7, label: 'Equipment' },
  { number: 8, label: 'Spells' },
  { number: 9, label: 'Features' },
  { number: 10, label: 'Appearance' },
  { number: 11, label: 'Backstory' },
  { number: 12, label: 'Review' },
];

export function Stepper() {
  const { currentStep, setCurrentStep } = useCharacterStore();

  return (
    <div className="stepper">
      {STEPS.map((step, index) => (
        <div
          key={step.number}
          className={`stepper-item ${index === currentStep ? 'active' : ''} ${
            index < currentStep ? 'completed' : ''
          }`}
          onClick={() => index <= currentStep && setCurrentStep(index)}
        >
          <div className="stepper-number">
            {index < currentStep ? '✓' : step.number}
          </div>
          <div className="stepper-label">{step.label}</div>
          {index < STEPS.length - 1 && <div className="stepper-line" />}
        </div>
      ))}
    </div>
  );
}
