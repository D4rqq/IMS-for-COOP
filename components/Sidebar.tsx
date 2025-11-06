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
    className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 ${
      isActive
        ? 'bg-psu-gold/20 text-white font-bold border-l-4 border-psu-gold'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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

      <aside className={`fixed md:relative inset-y-0 left-0 bg-psu-maroon text-white w-64 space-y-6 py-7 px-2 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col`}>
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <img src="https://dhvsu.edu.ph/images/about_pampanga_state_u/pampanga-state-u-logo-small.png" alt="PSU Logo" className="h-12 w-12" />
            <div className="flex flex-col">
              <span className="text-white text-lg font-extrabold tracking-wider">PSU Coop</span>
              <span className="text-xs text-psu-gold font-semibold">IMS Portal</span>
            </div>
          </div>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <MenuCloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-grow">
          <NavLink icon={<DashboardIcon />} label="Dashboard" isActive={currentPage === 'Dashboard'} onClick={() => handleNavigation('Dashboard')} />
          <NavLink icon={<ProductsIcon />} label="Products" isActive={currentPage === 'Products'} onClick={() => handleNavigation('Products')} />
          <NavLink icon={<SalesIcon />} label="Sales" isActive={currentPage === 'Sales'} onClick={() => handleNavigation('Sales')} />
          {/* Add other links here as needed, disabling them for now */}
          <a href="#" className="flex items-center px-4 py-3 text-lg text-gray-500 cursor-not-allowed">
            <ReportsIcon />
            <span className="mx-4">Reports</span>
          </a>
        </nav>
        
        <div className="px-4 py-2 mt-auto">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} PSU Cooperative</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;