import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { adminlogin, superadminlogin } from "../services/authService";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!role) {
      Swal.fire("Error", "Please select Admin or Super Admin", "error");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (role === "admin") {
        const data = {
          emailId: email,
          mobileNumber: email,
          password: pwd,
        };
        res = await adminlogin(data);
      } else if (role === "superadmin") {
        const data = {
          emailId: email,
          password: pwd,
        };
        res = await superadminlogin(data);
      }

      if (!res || res.statusCode !== 200) {
        Swal.fire("Error", res?.message || "Invalid credentials", "error");
        return;
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", role);

      if (role === "admin") {
        localStorage.setItem(
          "access_modules",
          JSON.stringify(res.data?.access_modules || [])
        );
      } else {
        localStorage.removeItem("access_modules");
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard", { replace: true });
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Login failed", "error");
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

        <h4 className="law-login-title">Login to Dashboard</h4>

        <form onSubmit={handleLogin}>
          <label>Email / Mobile</label>
          <input
            type="text"
            placeholder="Email or Phone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />

          <div className="law-options">
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin / Teachers / Support
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="superadmin"
                checked={role === "superadmin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Super Admin
            </label>
          </div>

          <div className="law-options">
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                if (role === "superadmin") {
                  navigate("/superadmin-forgot-password");
                } else {
                  navigate("/admin-forgot-password");
                }
              }}
            >
              Forgot password?
            </button>
          </div>

          <button className="law-login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
