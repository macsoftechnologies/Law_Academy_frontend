import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./ProfileDropdown.css";

const ProfileDropdown = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d6831",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Clear session
        localStorage.clear();
        // ✅ Redirect to admin login page
        navigate("/", { replace: true });
      }
    });
  };

  return (
    <div className="profile-dropdown">
      <img
        src="/law-02.jpg"
        alt="Profile"
        className="profile-thumb"
        data-bs-toggle="dropdown"
      />

      <ul className="dropdown-menu dropdown-menu-end">
        <li className="profile-header text-center">
          <img
            src="/law-02.jpg"
            className="profile-img"
            alt="Profile"
          />
          {/* <h6 className="profile-name">Jane</h6>
          <p className="profile-email">jane@jane.com</p>
          <small className="profile-updated">
            Last updated 3 mins ago
          </small> */}
        </li>

        {/* <li><a className="dropdown-item" href="#">Profile</a></li> */}
        <li>
          <button
            className="dropdown-item"
            onClick={handleLogout}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;
