import React from 'react';

const Navbar = () => {
  return (
    <div className="h-[80px] w-full flex items-center justify-between px-8 text-white">
      {/* Left: Logo */}
      <div className="logo flex items-center space-x-2">
    
        <img src="Logo.png" alt="Logo" className="h-10 w-auto" />
      </div>

      {/* Right: Profile Section */}
      <div className="flex items-center space-x-6">
        <div className="profile border-[1px] rounded-[22px] w-[80px] h-[40px] flex items-center justify-center">
          <h1>Profile</h1>
        </div>
        <div className="contact border-[1px] rounded-[22px] w-[80px] h-[40px] flex items-center justify-center">
          <h1>Contact</h1>
        </div>
        <div className="profile-pic">
          <div className="bg-red-500 h-10 w-10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;