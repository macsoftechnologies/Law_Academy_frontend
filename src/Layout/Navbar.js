import React from 'react';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar navbar-light bg-light px-3 d-flex align-items-center">

    <button className="orange-btn me-3" onClick={toggleSidebar}>
      <i className="bi bi-list"></i>
    </button>


      <input type="text" placeholder="Search..." className="form-control w-50" />

      <div className="ms-auto">
        <ProfileDropdown />
      </div>

    </nav>
  );
};

export default Navbar;
