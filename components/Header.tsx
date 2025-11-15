import React from 'react';
import type { Page } from '../types';
import { MenuOpenIcon, UserCircleIcon, LogoutIcon } from './icons/Icons';

interface HeaderProps {
    currentPage: Page;
    setSidebarOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setSidebarOpen, onLogout }) => {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button 
                            className="md:hidden mr-4 text-slate-500 hover:text-slate-700"
                            onClick={() => setSidebarOpen(true)}
                        >
                          <MenuOpenIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-800">{currentPage}</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="text-right mr-4 hidden sm:block">
                            <p className="font-semibold text-slate-700">Admin User</p>
                            <p className="text-xs text-slate-500">Coop Manager</p>
                        </div>
                        <UserCircleIcon className="h-10 w-10 text-psu-maroon" />
                         <button
                          onClick={onLogout}
                          className="ml-2 p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
                          title="Logout"
                          aria-label="Logout"
                        >
                          <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
