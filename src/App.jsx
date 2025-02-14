

//import React from "react";

import CalendlyWidget from "./components/CalendlyWidjet";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Book a Yoga Session</h1>
      <CalendlyWidget />
    </div>
  );
};

export default App;

