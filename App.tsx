import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { LiveTutor } from './components/LiveTutor';
import { AppMode, Scenario } from './types';
import { User } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Dashboard);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  const handleScenarioSelect = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setMode(AppMode.Chat);
  };

  const handleBackToDash = () => {
    setActiveScenario(null);
    setMode(AppMode.Dashboard);
  };

  // Simple Profile Placeholder
  const ProfileView = () => (
    <div className="p-8 flex flex-col items-center justify-center h-full space-y-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            <User size={48} />
        </div>
        <h2 className="text-xl font-bold">Guest Learner</h2>
        <div className="w-full space-y-4">
            <div className="flex justify-between p-4 bg-white rounded-xl shadow-sm">
                <span>Subscription</span>
                <span className="font-bold text-blue-600">Free Plan</span>
            </div>
            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg">
                Upgrade to Pro
            </button>
        </div>
    </div>
  );

  const renderContent = () => {
    switch (mode) {
      case AppMode.Dashboard:
        return <Dashboard onSelectScenario={handleScenarioSelect} />;
      case AppMode.Chat:
        return <ChatInterface scenario={activeScenario} onBack={handleBackToDash} />;
      case AppMode.Live:
        return <LiveTutor />;
      case AppMode.Profile:
        return <ProfileView />;
      default:
        return <Dashboard onSelectScenario={handleScenarioSelect} />;
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;