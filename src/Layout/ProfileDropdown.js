import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SuperAdminandAdminLogout } from "../services/authService";
import "./ProfileDropdown.css";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await SuperAdminandAdminLogout();
        } catch (err) {
          console.warn("Logout API error:", err);
        } finally {
          localStorage.clear();
          navigate("/", { replace: true });
        }
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
          <img src="/law-02.jpg" className="profile-img" alt="Profile" />
          <p className="profile-name">
            {role === "superadmin" ? "Super Admin" : "Admin"}
          </p>
          <span className="profile-role-badge">{role}</span>
        </li>

        <div className="profile-menu-body">
          <div className="dropdown-divider" />
          <li>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <i className="ti ti-logout" aria-hidden="true"></i>
              Logout
            </button>
          </li>
        </div>
      </ul>
    </div>
  );
};

export default ProfileDropdown;