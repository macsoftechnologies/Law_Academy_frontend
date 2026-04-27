import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { superadminForgotPassword } from "../../services/authService";
import '../Auth/Login.css';

export default function SuperAdminForgotPassword() {
  const navigate = useNavigate();

  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!emailOrMobile || !password) {
      Swal.fire("Warning", "All fields are required", "warning");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: emailOrMobile,          // ✅ send same value to both
        mobile_number: emailOrMobile,  // ✅ backend checks either one
        password: password,
      };

      const res = await superadminForgotPassword(payload);

      if (res.statusCode !== 200) {
        Swal.fire("Error", res.message || "Password update failed", "error");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Password Updated Successfully",
        text: "Please login with your new password",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/admin", { replace: true });
      });
    } catch (error) {
      Swal.fire("Error", "Server error. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="law-login-page">
      <div className="law-login-box">
        <div className="law-brand">
          <span>E-LEARNING LAW</span>
        </div>

        <h4 className="law-login-title">Forgot Password</h4>

        <form onSubmit={handleForgotPassword}>

          <label>Email / Mobile Number</label>
          <input
            type="text"
            placeholder="Enter Email or Mobile Number"
            value={emailOrMobile}
            onChange={(e) => setEmailOrMobile(e.target.value)}
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
              onClick={() => navigate("/admin")}
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