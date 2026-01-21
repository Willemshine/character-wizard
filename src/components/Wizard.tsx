import { useCharacterStore } from '../store/characterStore';
import { Stepper } from './Stepper';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Race } from './steps/Step2Race';
import { Step3Class } from './steps/Step3Class';
import { Step4AbilityScores } from './steps/Step4AbilityScores';
import { Step5Background } from './steps/Step5Background';
import { Step6Skills } from './steps/Step6Skills';
import { Step7Equipment } from './steps/Step7Equipment';
import { Step8Spells } from './steps/Step8Spells';
import { Step9Features } from './steps/Step9Features';
import { Step10Appearance } from './steps/Step10Appearance';
import { Step11Backstory } from './steps/Step11Backstory';
import { Step12Review } from './steps/Step12Review';
import './Wizard.css';

const STEPS = [
  Step1BasicInfo,
  Step2Race,
  Step3Class,
  Step4AbilityScores,
  Step5Background,
  Step6Skills,
  Step7Equipment,
  Step8Spells,
  Step9Features,
  Step10Appearance,
  Step11Backstory,
  Step12Review,
];

export function Wizard() {
  const { currentStep } = useCharacterStore();
  const CurrentStepComponent = STEPS[currentStep];

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h1>Character Wizard</h1>
        <p>Create your character step by step</p>
      </div>
      <Stepper />
      <div className="wizard-content">
        <CurrentStepComponent />
      </div>
    </div>
  );
}
