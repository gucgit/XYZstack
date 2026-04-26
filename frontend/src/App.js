import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="brand-icon">✓</span>
            TaskManager
          </div>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/tasks">All Tasks</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/"       element={<Dashboard />} />
            <Route path="/tasks"  element={<TaskList />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>TaskManager — DevOps Portfolio Project | umeshchandraguc</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
