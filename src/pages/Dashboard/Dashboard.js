import React, { useState } from "react";
import "./Dashboard.css";
import {
  FaRupeeSign,
  FaUserGraduate,
  FaBookOpen,
  FaChartLine,
  FaShoppingCart,
  FaTrophy,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    // API call or logic to filter by date would go here
    console.log("Filtering from", startDate, "to", endDate);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  // 📊 Revenue Trend (Line Chart)
  const revenueData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: [120000, 150000, 130000, 180000, 160000, 210000],
        borderColor: "#C9A227",
        backgroundColor: "rgba(201, 162, 39, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#1A3C8B",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // 📈 Enrollments vs Completed (Bar Chart)
  const enrollmentsData = {
    labels: months,
    datasets: [
      {
        label: "New Enrollments",
        data: [120, 180, 150, 210, 190, 250],
        backgroundColor: "#1A3C8B",
        borderRadius: 6,
      },
      {
        label: "Completed Courses",
        data: [80, 110, 95, 140, 130, 180],
        backgroundColor: "#6C1E1E",
        borderRadius: 6,
      },
    ],
  };



  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          color: '#333',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };



  return (
    <div className="law-dashboard-wrapper">
      <div className="dashboard-header-section">
        <div>
          <h2 className="dashboard-title">Business Overview</h2>
          <p className="dashboard-subtitle">Monitor your academy's growth, revenue, and student engagement.</p>
        </div>
      </div>

      {/* 📅 Date Filter Section */}
      <div style={{ padding: "16px", background: "#fff", margin: "0 0 24px 0", borderRadius: "12px", boxShadow: "0 5px 20px rgba(0,0,0,0.03)" }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Start Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>End Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div className="col-md-6 d-flex justify-content-end gap-2">
            <button className="btn btn-secondary px-4" onClick={handleClear}>Clear</button>
            <button className="btn text-white px-4" onClick={handleSearch} style={{ background: "#1A3C8B", borderColor: "#1A3C8B" }}>Search</button>
          </div>
        </div>
      </div>

      {/* 🚀 Key Performance Indicators (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card glass-blue">
          <div className="kpi-icon-wrapper"><FaRupeeSign /></div>
          <div className="kpi-details">
            <p className="kpi-label">Total Revenue</p>
            <h3 className="kpi-value">₹ 24,50,000</h3>
          </div>
        </div>

        <div className="kpi-card glass-gold">
          <div className="kpi-icon-wrapper"><FaUserGraduate /></div>
          <div className="kpi-details">
            <p className="kpi-label">Active Students</p>
            <h3 className="kpi-value">4,820</h3>
          </div>
        </div>

        <div className="kpi-card glass-red">
          <div className="kpi-icon-wrapper"><FaShoppingCart /></div>
          <div className="kpi-details">
            <p className="kpi-label">Total Subscriptions</p>
            <h3 className="kpi-value">3,150</h3>
          </div>
        </div>

      </div>

      {/* 📊 Analytics Section */}
      <div className="analytics-grid-single">
        <div className="analytics-card">
          <div className="card-header">
            <h4>Revenue Growth</h4>
            <span className="badge-monthly">Monthly</span>
          </div>
          <div className="chart-container">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 📈 Secondary Analytics */}
      <div className="analytics-grid mt-4">
        <div className="analytics-card col-span-2">
          <div className="card-header">
            <h4>Enrollments vs Completions</h4>
          </div>
          <div className="chart-container">
            <Bar data={enrollmentsData} options={chartOptions} />
          </div>
        </div>

        <div className="analytics-card bg-highlight">
          <div className="card-header">
            <h4>Top Performing Course</h4>
          </div>
          <div className="top-course-content">
            <div className="trophy-icon"><FaTrophy /></div>
            <h3>Judiciary Target 2024</h3>
            <p className="course-stats">1,240 Enrolled • ₹ 8,50,000 Revenue</p>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '85%' }}></div>
            </div>
            <p className="conversion-text">85% Conversion Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}