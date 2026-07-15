import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={
          <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#102542] text-white">
            <h1 className="text-4xl font-serif text-[#D4AF37] mb-4">404</h1>
            <p className="font-sans">Page not found</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
