import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";                                                          
import { adminForgotPassword } from "../../services/authService";
import { showSuccess, showError } from "../../components/alertService"; 
import '../Auth/Login.css'; 
import logo from '../../assets/Raos-law-logo-02.png';

export default function AdminForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      showError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        emailId: email,
        mobileNumber: email,
        password: password,
      };

      const res = await adminForgotPassword(payload);

      if (res.statusCode !== 200) {
        showError(res.message || "Password update failed");
        return;
      }

      showSuccess("Password Updated. Please login with your new password");

      // Delay navigation to allow toast to show properly
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 1500);

    } catch (error) {
      showError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="law-login-page">
      <div className="law-login-box">
        <div className="sidebar-header">
          <div className="law-login-brand">
            <img
              src={logo}
              alt="Rao's Law Academy"
              className="law-brand-logo"
            />
          </div>
        </div>

        <h4 className="law-login-title">Forgot Password</h4>

        <form onSubmit={handleForgotPassword}>
          <label>Email / Mobile Number</label>
          <input
            type="text"
            placeholder="Email / Mobile Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="law-options">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>
          </div>

          <button
            className="law-login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "UPDATE PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}