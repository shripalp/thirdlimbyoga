//import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
    {/* Hero Section */}
    <div className="h-screen flex flex-col items-center justify-center text-center bg-cover bg-center" 
         style={{ backgroundImage: "url('/yoga-bg.jpg')" }}>
      <h1 className="text-4xl font-bold text-white">Welcome to My Yoga Classes</h1>
      <p className="mt-4 text-lg text-white">
        Join my yoga sessions to enhance your mind, body, and soul.
      </p>
      <Link
        to="/booking"
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold"
      >
        Book a Session with Shripal
      </Link>
    </div>
     {/* About Section */}
     <section className="py-16 px-6 md:px-20 bg-white text-gray-800">
     <div className="max-w-4xl mx-auto text-center">
       <h2 className="text-4xl font-bold">About Me</h2>
       <p className="mt-4 text-lg">
         I am a passionate yoga instructor dedicated to helping people achieve mental and physical well-being.
         Whether you are a beginner or an experienced yogi, my classes will help you reconnect with yourself.
       </p>
     </div>
   </section>

   {/* Services Section */}
   <section className="py-16 px-6 md:px-20 bg-gray-200">
     <div className="max-w-5xl mx-auto text-center">
       <h2 className="text-4xl font-bold text-gray-800">Our Services</h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
         <div className="bg-white p-6 rounded-lg shadow-lg">
           <h3 className="text-2xl font-semibold">Private Yoga Sessions</h3>
           <p className="mt-2 text-gray-600">One-on-one customized sessions tailored to your needs.</p>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-lg">
           <h3 className="text-2xl font-semibold">Group Yoga Classes</h3>
           <p className="mt-2 text-gray-600">Practice yoga in a community setting with like-minded individuals.</p>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-lg">
           <h3 className="text-2xl font-semibold">Online Yoga Workshops</h3>
           <p className="mt-2 text-gray-600">Join virtual yoga workshops from the comfort of your home.</p>
         </div>
       </div>
     </div>
   </section>
    {/* Footer */}
    <footer className="py-6 bg-gray-800 text-center text-white">
        <p>&copy; 2025 Third Limb Yoga. All rights reserved.</p>
      </footer>
    
    </>
    
  );
};

export default Home;
