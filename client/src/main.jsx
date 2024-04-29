import React from 'react';
import App from './components/App.jsx';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css';
import Team from './components/Team.jsx';
const root = createRoot(document.getElementById('root'))
root.render(
    <div className='h-screen w-screen flex flex-col'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App className="App"/>} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </BrowserRouter>
    </div>
);
