import React from "react";
import "./Dashboard.css";

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
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  // 📊 Revenue from Courses
  const revenueData = {
    labels: months,
    datasets: [
      {
        label: "Course Revenue (₹)",
        data: [40000, 52000, 48000, 60000, 58000, 67000],
        backgroundColor: "#1d4ed8",
        borderRadius: 6,
      },
    ],
  };

  // 📈 Student Enrollments
  const enrollmentsData = {
    labels: months,
    datasets: [
      {
        label: "Student Enrollments",
        data: [50, 70, 65, 80, 75, 90],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 🎓 Course Categories
  const courseTypeData = {
    labels: ["Criminal Law", "Civil Law", "Corporate Law", "Family Law"],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ["#1d4ed8", "#16a34a", "#f59e0b", "#9333ea"],
      },
    ],
  };

  return (
    <div className="law-page-wrapper">
      <div className="law-page-header">
        <h3 className="law-dashboard-title mb-4">
          Learning Dashboard
        </h3>
      </div>

      <div className="law-content-card">
        
        {/* 🔢 Stats */}
        <div className="law-row g-4 mb-4">
          
          <div className="law-col-md-3">
            <div className="law-stat-box blue">
              <p>Total Revenue</p>
              <h3>₹3,25,000</h3>
              <p>From Courses</p>
            </div>
          </div>

          <div className="law-col-md-3">
            <div className="law-stat-box yellow">
              <p>Total Students</p>
              <h3>1,240</h3>
              <p>Enrolled</p>
            </div>
          </div>

          <div className="law-col-md-3">
            <div className="law-stat-box green">
              <p>Total Test Series</p>
              <h3>18</h3>
              <p>Active</p>
            </div>
          </div>

          <div className="law-col-md-3">
            <div className="law-stat-box purple">
              <p>Total Courses</p>
              <h3>22</h3>
              <p>Available</p>
            </div>
          </div>

        </div>

        {/* 📊 Charts */}
        <div className="law-row g-4">
          
          <div className="law-col-md-6">
            <div className="law-chart-box">
              <h5>Course Revenue</h5>
              <Bar data={revenueData} />
            </div>
          </div>

          <div className="law-col-md-6">
            <div className="law-chart-box">
              <h5>Student Enrollments</h5>
              <Line data={enrollmentsData} />
            </div>
          </div>

        </div>

        {/* 🍩 Course Distribution */}
        <div className="law-row g-4">
          
          <div className="law-col-md-4">
            <div className="law-chart-box text-center">
              <h5>Course Category Distribution</h5>
              <Doughnut data={courseTypeData} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}