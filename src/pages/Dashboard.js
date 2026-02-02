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

export default function LawDashboard() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const revenueData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: [50000, 65000, 58000, 70000, 68000, 75000],
        backgroundColor: "#1d4ed8",
        borderRadius: 6,
      },
    ],
  };

  const casesData = {
    labels: months,
    datasets: [
      {
        label: "New Cases",
        data: [20, 35, 30, 40, 38, 50],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lawTypeData = {
    labels: ["Criminal", "Civil", "Corporate", "Family"],
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
        <h3 className="law-dashboard-title mb-4">Law Dashboard</h3>
      </div>

      <div className="law-content-card">
        <div className="law-row g-4 mb-4">
          <div className="law-col-md-3">
            <div className="law-stat-box blue">
              <p>Total Revenue</p>
              <h3>₹4,23,000</h3>
              <p>This Month</p>
            </div>
          </div>

          <div className="law-col-md-3">
            <div className="law-stat-box yellow">
              <p>Total Cases</p>
              <h3>213</h3>
              <p>This Month</p>
            </div>
          </div>

          <div className="law-col-md-3">
            <div className="law-stat-box green">
              <p>Active Lawyers</p>
              <h3>25</h3>
              <p>Currently</p>
            </div>
          </div>

          <div className="law-col-md-3">
            <div className="law-stat-box purple">
              <p>Available Courses</p>
              <h3>12</h3>
              <p>Legal Learning</p>
            </div>
          </div>
        </div>

        <div className="law-row g-4">
          <div className="law-col-md-6">
            <div className="law-chart-box">
              <h5>Monthly Revenue</h5>
              <Bar data={revenueData} />
            </div>
          </div>

          <div className="law-col-md-6">
            <div className="law-chart-box">
              <h5>New Cases</h5>
              <Line data={casesData} />
            </div>
          </div>
        </div>

        <div className="law-row g-4">
          <div className="law-col-md-4">
            <div className="law-chart-box text-center">
              <h5>Case Type Distribution</h5>
              <Doughnut data={lawTypeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
