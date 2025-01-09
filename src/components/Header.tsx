import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calculator, Users, Calendar, Image, CheckSquare, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const RingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-rose-500"
  >
    <circle cx="9" cy="12" r="4" />
    <circle cx="15" cy="12" r="4" />
    <path d="M17.7 14.7a6 6 0 0 1-11.4 0" />
    <path d="M6.3 9.3a6 6 0 0 1 11.4 0" />
  </svg>
);

const navItems = [
  { path: '/', label: 'Início', icon: RingsIcon },
  { path: '/budget', label: 'Orçamento', icon: Calculator },
  { path: '/suppliers', label: 'Fornecedores', icon: Users },
  { path: '/schedule', label: 'Agenda', icon: Calendar },
  { path: '/gallery', label: 'Galeria', icon: Image },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <RingsIcon />
              <span className="text-2xl font-serif text-gray-900">Vows4Ever</span>
            </Link>
          </div>
          
          <nav className="hidden sm:flex sm:space-x-8 items-center">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive
                      ? 'border-rose-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {typeof Icon === 'function' ? <Icon /> : <Icon className="h-4 w-4 mr-2" />}
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </nav>

          <div className="sm:hidden flex items-center">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
            >
              <span className="sr-only">Abrir menu principal</span>
              <svg
                className={`${showMobileMenu ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${showMobileMenu ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`${showMobileMenu ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`${
                  isActive
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setShowMobileMenu(false)}
              >
                <div className="flex items-center">
                  {typeof Icon === 'function' ? <Icon /> : <Icon className="h-5 w-5 mr-3" />}
                  {label}
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => {
              handleLogout();
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}