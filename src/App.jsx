//import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Booking from "./pages/Booking";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-blue-500 p-4 text-white flex justify-between">
        <Link to="/" className="text-xl font-bold">Third Limg Yoga</Link>
        <div>
          <Link to="/" className="mx-4">Home</Link>
          <Link to="/booking" className="mx-4">Book a Session</Link>
        </div>
      </nav>

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </div>
  );
};

export default App;
