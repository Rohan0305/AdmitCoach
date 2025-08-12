type Experience = {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
};

type User = {
  firstName: string;
  lastName: string;
  email: string;
  programType?: string;
  undergraduateSchool?: string;
  experiences?: Experience[];
  profileCompleted?: boolean;
  lastUpdated?: Date;
  credits?: number;
  lastCreditPurchase?: string;
};

type Question ={
  id: number;
  type: string;
  question: string;
}

type Feedback = {
  text: string;
  contentScore: number | null;
  deliveryScore: number | null;
  structureScore: number | null;
  overallScore: number | null;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  admissionsPerspective?: string;
}

type Answer = {
  audioURL: string | null;
  audioBlob?: Blob; // Store the actual audio data
  feedback: Feedback | null;
  question: string;
  questionId: number;
}

type InterviewSession = {
  id: string;
  date: string;
  programType: string;
  answers: Answer[];
  totalQuestions: number;
  completedQuestions: number;
  userId: string;
}
