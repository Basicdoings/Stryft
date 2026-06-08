import { create } from 'zustand';

interface OnboardingState {
  gender: 'Male' | 'Female' | 'Other' | null;
  age: number | null;
  weight: { value: number | null; unit: 'kg' | 'lbs' };
  fitnessLevel: number; // e.g., 1 to 5
  primaryGoal: string | null;
  secondaryGoal: string | null;
  physicalLimitations: string[];
  daysPerWeek: number;
  exercisePreferences: { location: string | null; equipment: string | null; cardio: string | null };
  mealExceptions: string[];
  supplements: string[];
  calorieGoal: number | null;
  sleepQuality: string | null;
  measurements: { height: number | null; waist: number | null; bodyFat: number | null };
  timelineWeeks: number | null;
  journey: string | null;
  onboardingComplete: boolean;

  // Actions
  setGender: (gender: OnboardingState['gender']) => void;
  setAge: (age: number) => void;
  setWeight: (weight: number | null, unit: 'kg' | 'lbs') => void;
  setFitnessLevel: (level: number) => void;
  setPrimaryGoal: (goal: string) => void;
  setSecondaryGoal: (goal: string) => void;
  setPhysicalLimitations: (limitations: string[]) => void;
  setDaysPerWeek: (days: number) => void;
  setExercisePreferences: (prefs: Partial<OnboardingState['exercisePreferences']>) => void;
  setMealExceptions: (exceptions: string[]) => void;
  setSupplements: (supplements: string[]) => void;
  setCalorieGoal: (goal: number) => void;
  setSleepQuality: (quality: string) => void;
  setMeasurements: (measurements: Partial<OnboardingState['measurements']>) => void;
  setTimelineWeeks: (weeks: number) => void;
  setJourney: (journey: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  gender: null,
  age: null,
  weight: { value: null, unit: 'kg' },
  fitnessLevel: 3,
  primaryGoal: null,
  secondaryGoal: null,
  physicalLimitations: [],
  daysPerWeek: 3,
  exercisePreferences: { location: null, equipment: null, cardio: null },
  mealExceptions: [],
  supplements: [],
  calorieGoal: null,
  sleepQuality: null,
  measurements: { height: null, waist: null, bodyFat: null },
  timelineWeeks: null,
  journey: null,
  onboardingComplete: false,

  setGender: (gender) => set({ gender, primaryGoal: null, secondaryGoal: null }),
  setAge: (age) => set({ age }),
  setWeight: (value, unit) => set({ weight: { value, unit } }),
  setFitnessLevel: (fitnessLevel) => set({ fitnessLevel }),
  setPrimaryGoal: (primaryGoal) => set({ primaryGoal }),
  setSecondaryGoal: (secondaryGoal) => set({ secondaryGoal }),
  setPhysicalLimitations: (physicalLimitations) => set({ physicalLimitations }),
  setDaysPerWeek: (daysPerWeek) => set({ daysPerWeek }),
  setExercisePreferences: (prefs) => set((state) => ({ exercisePreferences: { ...state.exercisePreferences, ...prefs } })),
  setMealExceptions: (mealExceptions) => set({ mealExceptions }),
  setSupplements: (supplements) => set({ supplements }),
  setCalorieGoal: (calorieGoal) => set({ calorieGoal }),
  setSleepQuality: (sleepQuality) => set({ sleepQuality }),
  setMeasurements: (measurements) => set((state) => ({ measurements: { ...state.measurements, ...measurements } })),
  setTimelineWeeks: (timelineWeeks) => set({ timelineWeeks }),
  setJourney: (journey) => set({ journey }),
  completeOnboarding: () => set({ onboardingComplete: true }),
  resetOnboarding: () => set({
    gender: null,
    age: null,
    weight: { value: null, unit: 'kg' },
    fitnessLevel: 3,
    primaryGoal: null,
    secondaryGoal: null,
    physicalLimitations: [],
    daysPerWeek: 3,
    exercisePreferences: { location: null, equipment: null, cardio: null },
    mealExceptions: [],
    supplements: [],
    calorieGoal: null,
    sleepQuality: null,
    measurements: { height: null, waist: null, bodyFat: null },
    timelineWeeks: null,
    journey: null,
    onboardingComplete: false,
  }),
}));
