import React, { useState, useEffect } from "react";
import "./form.css";

function StudentForm({ onClose, initialData, isEdit, onSubmit }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [purchases, setPurchases] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("Active");
  const [courseProgress, setCourseProgress] = useState("0%");
  const [examPerformance, setExamPerformance] = useState("0%");
  const [referralEarnings, setReferralEarnings] = useState("$0");
  const [loginHistory, setLoginHistory] = useState("");

  // Prefill in edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      setName(initialData.name || "");
      setMobile(initialData.mobile || "");
      setEmail(initialData.email || "");
      setPurchases(initialData.purchases || "");
      setSubscriptionStatus(initialData.subscriptionStatus || "Active");
      setCourseProgress(initialData.courseProgress || "0%");
      setExamPerformance(initialData.examPerformance || "0%");
      setReferralEarnings(initialData.referralEarnings || "$0");
      setLoginHistory(initialData.loginHistory || "");
    }
  }, [initialData, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name,
      mobile,
      email,
      purchases,
      subscriptionStatus,
      courseProgress,
      examPerformance,
      referralEarnings,
      loginHistory,
    };

    if (onSubmit) onSubmit(payload);

    onClose();
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      {/* Row 1 */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Student Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Student Name"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Mobile</label>
          <input
            type="text"
            className="form-control"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter Mobile Number"
            required
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="row">
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
        <div className="col-md-6 mb-3">
          <label className="form-label">Purchases</label>
          <input
            type="text"
            className="form-control"
            value={purchases}
            onChange={(e) => setPurchases(e.target.value)}
            placeholder="Enter Purchased Courses"
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Subscription Status</label>
          <select
            className="form-select"
            value={subscriptionStatus}
            onChange={(e) => setSubscriptionStatus(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Course Progress (%)</label>
          <input
            type="text"
            className="form-control"
            value={courseProgress}
            onChange={(e) => setCourseProgress(e.target.value)}
            placeholder="e.g., 50%"
          />
        </div>
      </div>

      {/* Row 4 */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Exam Performance (%)</label>
          <input
            type="text"
            className="form-control"
            value={examPerformance}
            onChange={(e) => setExamPerformance(e.target.value)}
            placeholder="e.g., 75%"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Referral Earnings ($)</label>
          <input
            type="text"
            className="form-control"
            value={referralEarnings}
            onChange={(e) => setReferralEarnings(e.target.value)}
            placeholder="e.g., $50"
          />
        </div>
      </div>

      {/* Row 5 */}
      <div className="row">
        <div className="col-md-12 mb-3">
          <label className="form-label">Login History</label>
          <input
            type="text"
            className="form-control"
            value={loginHistory}
            onChange={(e) => setLoginHistory(e.target.value)}
            placeholder="Last login info"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Student" : "Save Student"}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
