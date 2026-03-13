import React, { useState, useEffect, useRef } from "react";
import "../forms/form.css";

const moduleOptions = [
  { value: "admins",              label: "Admins" },
  { value: "students",            label: "Students" },
  { value: "student_requests",    label: "Student Requests" },

  { value: "categories",          label: "Categories" },
  { value: "subcategories",       label: "Sub Categories" },
  { value: "laws",                label: "Laws" },
  { value: "subjects",            label: "Subjects" },
  { value: "lectures",            label: "Lectures" },
  { value: "gestlectures",        label: "Guest Lectures" },

  { value: "plans",               label: "Plans" },
  { value: "coupons",             label: "Coupons" },

  { value: "prelims",             label: "Prelims" },
  { value: "pqapaper",            label: "PQA Papers" },
  { value: "swmockstests",        label: "SW Mock Tests" },
  { value: "grandtests",          label: "Grand Tests" },
  { value: "quizzes",             label: "Quizzes" },

  { value: "mains",               label: "Mains" },
  { value: "mainsqa",             label: "Mains Q&A" },
  { value: "manisessaytrans",     label: "Essay & Translation" },
  { value: "mainstestseries",     label: "Mains Test Series" },
  { value: "mainssubjecttests",   label: "Mains Subject Tests" },
  { value: "mainstestsattempts",  label: "Mains Tests Attempts" },
  { value: "mainsresults",        label: "Mains Results" },

  { value: "notes",               label: "Notes" },
  { value: "subjectnotes",        label: "Subject Notes" },
  { value: "printednotesorders",  label: "Printed Notes Orders" },

  { value: "courescombo",         label: "Course Combo" },
  { value: "npmcombo",            label: "Notes / Prelims / Mains" },

  { value: "banners",             label: "Banners" },
  { value: "results",             label: "Results" },
];


function AdminForm({ onClose, initialData, isEdit, onSubmit }) {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [accessModules, setAccessModules] = useState([]);
  const [password, setPassword] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (isEdit && initialData) {
      setEmail(initialData.emailId || "");
      setMobile(initialData.mobileNumber || "");
      setRole(initialData.role || "");
      setAccessModules(initialData.access_modules || []);
      setPassword("");
    }
  }, [initialData, isEdit]);

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleModule = (value) => {
    if (accessModules.includes(value)) {
      setAccessModules(accessModules.filter((v) => v !== value));
    } else {
      setAccessModules([...accessModules, value]);
    }
  };

  // Toggle all modules
  const handleSelectAll = () => {
    if (accessModules.length === moduleOptions.length) {
      setAccessModules([]); 
    } else {
      setAccessModules(moduleOptions.map((m) => m.value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      emailId: email,
      mobileNumber: mobile,
      role,
      access_modules: accessModules,
    };
    if (!isEdit || password) payload.password = password || "123456";
    if (isEdit && initialData?.adminId) payload.adminId = initialData.adminId;
    onSubmit && onSubmit(payload);
    onClose();
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* Email */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            required
          />
        </div>

        {/* Mobile */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            className="form-control"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter Mobile Number"
            required
          />
        </div>

        {/* Role */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Role</label>
          <select
            style={{cursor:"pointer"}}
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="teachers">Teachers</option>
            <option value="support">Support</option>
          </select>
        </div>

        {/* Password */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            {isEdit
              ? "Password (leave blank to keep unchanged)"
              : "Password"}
          </label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              isEdit
                ? "Enter new password if you want to change"
                : "Enter password"
            }
            required={!isEdit}
          />
        </div>

        {/* Access Modules */}
        <div className="col-md-12 mb-3" ref={dropdownRef}>
          <label className="form-label">Access Modules</label>
          <div
            className="multi-select-input"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {accessModules.length > 0
              ? accessModules.join(", ")
              : "Select Modules"}
            <span className="arrow">{dropdownOpen ? "▲" : "▼"}</span>
          </div>
          {dropdownOpen && (
            <div className="multi-select-options">
              {/* Select All checkbox */}
              <label className="option-item">
                <input
                  type="checkbox"
                  checked={accessModules.length === moduleOptions.length}
                  onChange={handleSelectAll}
                />
                <b>All</b>
              </label>

              {/* Individual module checkboxes */}
              {moduleOptions.map((option) => (
                <label key={option.value} className="option-item">
                  <input
                    type="checkbox"
                    checked={accessModules.includes(option.value)}
                    onChange={() => toggleModule(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="text-end mt-3">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Admin" : "Add Admin"}
        </button>
      </div>
    </form>
  );
}

export default AdminForm;
