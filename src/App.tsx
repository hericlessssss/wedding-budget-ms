import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Suppliers from './pages/Suppliers';
import Schedule from './pages/Schedule';
import Gallery from './pages/Gallery';
import Tasks from './pages/Tasks';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}