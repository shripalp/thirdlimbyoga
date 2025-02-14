//import React from "react";

const Booking = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="mt-8 text-3xl font-bold text-gray-800">Book a Yoga Session</h2>
      <p className="mt-4 text-lg text-gray-600">Schedule your session using the link below.</p>
      <iframe
        src="https://calendly.com/shripalp"
        width="50%"
        height="600px"
        className="mt-6 rounded-lg shadow-lg"
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default Booking;
