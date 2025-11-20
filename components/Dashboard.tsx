import React from 'react';
import { GERMAN_SCENARIOS } from '../constants';
import { Scenario, UserLevel } from '../types';
import { ArrowRight, Star, Clock, Zap } from 'lucide-react';

interface DashboardProps {
  onSelectScenario: (scenario: Scenario) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectScenario }) => {
  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Guten Morgen!</h1>
        <p className="text-gray-500">Ready to continue your German journey?</p>
      </div>

      {/* Daily Progress Card */}
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Daily Goal</h3>
          <span className="text-blue-600 font-bold text-sm">15/30 min</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
           <div className="bg-blue-600 h-3 rounded-full w-1/2"></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
           <div className="flex items-center space-x-1"><Zap size={14} className="text-yellow-500"/> <span>5 day streak</span></div>
           <div className="flex items-center space-x-1"><Star size={14} className="text-orange-500"/> <span>Level 4</span></div>
        </div>
      </div>

      {/* Scenarios Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
           <h2 className="text-xl font-bold text-gray-900">Roleplay Scenarios</h2>
           <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Premium Free Trial</span>
        </div>
        
        <div className="space-y-4 pb-20">
          {GERMAN_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform active:scale-98 hover:shadow-md text-left group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                scenario.difficulty === UserLevel.Beginner ? 'bg-green-100 text-green-600' :
                scenario.difficulty === UserLevel.Intermediate ? 'bg-orange-100 text-orange-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {/* Rudimentary icon mapping based on constants */}
                <span className="text-xl font-bold">
                    {scenario.id === 'coffee-shop' ? '☕' : 
                     scenario.id === 'train-station' ? '🚆' : '🏥'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{scenario.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{scenario.description}</p>
              </div>
              <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};