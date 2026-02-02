import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { adminForgotPassword } from "../services/authService";
import "./Login.css";

export default function AdminForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      Swal.fire("Warning", "All fields are required", "warning");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        emailId: email,
        mobileNumber: email, // ✅ SAME as login
        password: password,
      };

      const res = await adminForgotPassword(payload);

      if (res.statusCode !== 200) {
        Swal.fire("Error", res.message || "Password update failed", "error");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Password Updated",
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
