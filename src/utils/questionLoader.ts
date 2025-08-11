import medical_schoolquestions from '@/data/questions_medical_school.json';
import dental_schoolquestions from '@/data/questions_dental_school.json';
import pharmacy_schoolquestions from '@/data/questions_pharmacy_school.json';
import pa_programquestions from '@/data/questions_pa_program.json';
import nursing_schoolquestions from '@/data/questions_nursing_school.json';
import veterinary_schoolquestions from '@/data/questions_veterinary_school.json';
import optometry_schoolquestions from '@/data/questions_optometry_school.json';
import law_schoolquestions from '@/data/questions_law_school.json';
import business_schoolquestions from '@/data/questions_business_school.json';
import graduate_schoolquestions from '@/data/questions_graduate_school.json';
import physical_therapyquestions from '@/data/questions_physical_therapy.json';
import occupational_therapyquestions from '@/data/questions_occupational_therapy.json';

export function getQuestionsByProgram(programType: string): Question[] {
  switch (programType) {
    case 'Medical School':
      return medical_schoolquestions as Question[];
    case 'Dental School':
      return dental_schoolquestions as Question[];
    case 'Pharmacy School':
      return pharmacy_schoolquestions as Question[];
    case 'Physician Assistant (PA) Program':
      return pa_programquestions as Question[];
    case 'Nursing School':
      return nursing_schoolquestions as Question[];
    case 'Veterinary School':
      return veterinary_schoolquestions as Question[];
    case 'Optometry School':
      return optometry_schoolquestions as Question[];
    case 'Law School':
      return law_schoolquestions as Question[];
    case 'Business School (MBA)':
      return business_schoolquestions as Question[];
    case 'Graduate School (MS/PhD)':
      return graduate_schoolquestions as Question[];
    case 'Physical Therapy (PT)':
      return physical_therapyquestions as Question[];
    case 'Occupational Therapy (OT)':
      return occupational_therapyquestions as Question[];
    case 'Other':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    default:
      // Default to medical school questions
      return medical_schoolquestions as Question[];
  }
} 