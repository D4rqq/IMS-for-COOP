import React from 'react';
import type { Page } from '../types';
import { DashboardIcon, ProductsIcon, SalesIcon, ReportsIcon, MenuCloseIcon } from './icons/Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center px-4 py-3 text-base transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-psu-gold/10 text-psu-gold font-bold'
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="mx-4">{label}</span>
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen }) => {
    
  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    if(window.innerWidth < 768) { // md breakpoint
        setSidebarOpen(false);
    }
  };
    
  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed md:relative inset-y-0 left-0 bg-psu-maroon text-white w-64 space-y-6 py-7 px-4 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col`}>
        <div className="flex items-center justify-between px-4">
          <a href="#" className="flex items-center space-x-3" onClick={(e) => {e.preventDefault(); handleNavigation('Dashboard');}}>
            <img src="https://dhvsu.edu.ph/images/about_pampanga_state_u/pampanga-state-u-logo-small.png" alt="PSU Logo" className="h-10 w-10"/>
            <span className="text-xl font-bold text-white">PSU Coop IMS</span>
          </a>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <MenuCloseIcon />
          </button>
        </div>

        <nav className="flex-1">
          <NavLink icon={<DashboardIcon />} label="Dashboard" isActive={currentPage === 'Dashboard'} onClick={() => handleNavigation('Dashboard')} />
          <NavLink icon={<ProductsIcon />} label="Products" isActive={currentPage === 'Products'} onClick={() => handleNavigation('Products')} />
          <NavLink icon={<SalesIcon />} label="Sales" isActive={currentPage === 'Sales'} onClick={() => handleNavigation('Sales')} />
          <NavLink icon={<ReportsIcon />} label="Reports" isActive={currentPage === 'Reports'} onClick={() => handleNavigation('Reports')} />
        </nav>
        
        <div className="px-4 py-2 border-t border-gray-700">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} PSU Cooperative</p>
            <p className="text-xs text-gray-400">All Rights Reserved</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
