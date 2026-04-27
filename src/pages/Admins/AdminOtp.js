import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { verifyAdmin } from "../../services/authService";
import "./Login.css";

const AdminOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminId = localStorage.getItem("adminId");

      const payload = {
        adminId,
        otp,
      };

      const res = await verifyAdmin(payload);

      if (res.statusCode !== 200) {
        Swal.fire("Invalid OTP", res.message, "error");
        return;
      }

      // token after OTP success
      localStorage.setItem("token", res.token);
      localStorage.setItem("admin", JSON.stringify(res.data));

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard", { replace: true });

    } catch (err) {
      Swal.fire("Error", "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={handleVerify}>
          <div className="card-logo">
            <img src="/Yoga-icon-01.png" alt="Yoga Bharat" className="logo" />
          </div>

          <h4 className="login-title">Verify OTP</h4>

          <label>Enter OTP</label>
          <input
            type="password"
            placeholder="******"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "VERIFY OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOtp;
