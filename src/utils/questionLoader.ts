import medical_schoolquestions from '@/data/questions_medical_school.json';
import dental_schoolquestions from '@/data/questions_dental_school.json';
import pharmacy_schoolquestions from '@/data/questions_pharmacy_school.json';

export function getQuestionsByProgram(programType: string): Question[] {
  switch (programType) {
    case 'Medical School':
      return medical_schoolquestions as Question[];
    case 'Dental School':
      return dental_schoolquestions as Question[];
    case 'Pharmacy School':
      return pharmacy_schoolquestions as Question[];
    case 'Physician Assistant (PA) Program':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Nursing School':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Veterinary School':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Optometry School':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Law School':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Business School (MBA)':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Graduate School (MS/PhD)':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Physical Therapy (PT)':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Occupational Therapy (OT)':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    case 'Other':
      // For now, use medical school questions as they're similar
      return medical_schoolquestions as Question[];
    default:
      // Default to medical school questions
      return medical_schoolquestions as Question[];
  }
} 