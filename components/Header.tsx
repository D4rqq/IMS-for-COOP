import React from 'react';
import type { Page } from '../types';
import { MenuOpenIcon, UserCircleIcon } from './icons/Icons';

interface HeaderProps {
    currentPage: Page;
    setSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setSidebarOpen }) => {
    return (
        <header className="bg-white shadow-sm z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button 
                            className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
                            onClick={() => setSidebarOpen(true)}
                        >
                          <MenuOpenIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">{currentPage}</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="text-right mr-4 hidden sm:block">
                            <p className="font-semibold text-gray-700">Admin User</p>
                            <p className="text-xs text-gray-500">Coop Manager</p>
                        </div>
                        <UserCircleIcon className="h-10 w-10 text-psu-maroon" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;