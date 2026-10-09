import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OutletProvider } from './context/OutletContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <OutletProvider>
        <AppRoutes />
      </OutletProvider>
    </BrowserRouter>
  );
}
