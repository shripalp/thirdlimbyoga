//import React from "react";

const CalendlyWidget = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <iframe
        src="https://calendly.com/shripalp" 
        width="100%"
        height="600px"
        className="rounded-lg shadow-lg"
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default CalendlyWidget;
