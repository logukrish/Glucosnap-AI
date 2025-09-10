
import React from 'react';
import type { View } from '../types';
import { ChartBarIcon, ClipboardDocumentListIcon, HomeIcon, SparklesIcon } from './icons';
import { APP_NAME } from '../constants';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col sm:flex-row items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow'
          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-2xl font-bold text-gray-800 tracking-tight">{APP_NAME}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <NavItem label="Dashboard" icon={<HomeIcon className="h-5 w-5"/>} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavItem label="A1c Log" icon={<ChartBarIcon className="h-5 w-5"/>} isActive={currentView === 'a1c'} onClick={() => setView('a1c')} />
            <NavItem label="History" icon={<ClipboardDocumentListIcon className="h-5 w-5"/>} isActive={currentView === 'history'} onClick={() => setView('history')} />
          </div>
        </div>
      </nav>
      {/* Mobile Nav */}
       <div className="sm:hidden grid grid-cols-3 gap-1 p-1 bg-gray-100">
          <NavItem label="Dashboard" icon={<HomeIcon className="h-5 w-5"/>} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem label="A1c Log" icon={<ChartBarIcon className="h-5 w-5"/>} isActive={currentView === 'a1c'} onClick={() => setView('a1c')} />
          <NavItem label="History" icon={<ClipboardDocumentListIcon className="h-5 w-5"/>} isActive={currentView === 'history'} onClick={() => setView('history')} />
      </div>
    </header>
  );
};
