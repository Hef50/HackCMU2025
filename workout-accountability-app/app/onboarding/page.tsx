'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { updateUserProfileOnboarding, getGoals } from './actions';
import type { Goal, FitnessLevel, UserAvailability } from '@/lib/types';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const FITNESS_LEVELS: FitnessLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [availability, setAvailability] = useState<UserAvailability[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals on component mount
  useEffect(() => {
    async function fetchGoals() {
      const result = await getGoals();
      if (result.success) {
        setGoals(result.data);
      } else {
        setError('Failed to load fitness goals. Please refresh the page.');
      }
    }
    fetchGoals();
  }, []);

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleAvailabilityToggle = (dayOfWeek: number, timeOfDay: string) => {
    const key = `${dayOfWeek}-${timeOfDay}`;
    setAvailability(prev => {
      const exists = prev.some(slot => 
        slot.dayOfWeek === dayOfWeek && slot.timeOfDay === timeOfDay
      );
      
      if (exists) {
        return prev.filter(slot => 
          !(slot.dayOfWeek === dayOfWeek && slot.timeOfDay === timeOfDay)
        );
      } else {
        return [...prev, { dayOfWeek, timeOfDay }];
      }
    });
  };

  const isAvailabilitySelected = (dayOfWeek: number, timeOfDay: string) => {
    return availability.some(slot => 
      slot.dayOfWeek === dayOfWeek && slot.timeOfDay === timeOfDay
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedGoals.length > 0;
      case 2:
        return availability.length > 0;
      case 3:
        return fitnessLevel !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleFinish = async () => {
    if (!fitnessLevel || selectedGoals.length === 0 || availability.length === 0) {
      setError('Please complete all steps before finishing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateUserProfileOnboarding({
        fitnessLevel,
        goalIds: selectedGoals,
        availability
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to save your profile. Please try again.');
      }
    } catch (err) {
      console.error('Client-side onboarding error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What are your fitness goals?
        </h2>
        <p className="text-gray-600">
          Select all that apply. You can change these later.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleGoalToggle(goal.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedGoals.includes(goal.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{goal.name}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedGoals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedGoals.includes(goal.id) && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          When are you available?
        </h2>
        <p className="text-gray-600">
          Select your preferred workout days and times.
        </p>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">{day.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((timeSlot) => (
                <button
                  key={`${day.id}-${timeSlot}`}
                  onClick={() => handleAvailabilityToggle(day.id, timeSlot)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    isAvailabilitySelected(day.id, timeSlot)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {timeSlot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What's your fitness level?
        </h2>
        <p className="text-gray-600">
          This helps us recommend appropriate groups and workouts.
        </p>
      </div>

      <div className="space-y-4">
        {FITNESS_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setFitnessLevel(level)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              fitnessLevel === level
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium block">{level}</span>
                <span className="text-sm opacity-75">
                  {level === 'Beginner' && 'New to fitness or getting back into it'}
                  {level === 'Intermediate' && 'Regular exercise routine, some experience'}
                  {level === 'Advanced' && 'Experienced with consistent training'}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                fitnessLevel === level
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {fitnessLevel === level && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                canProceed()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRightIcon className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed() || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                canProceed() && !isLoading
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Saving...' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
