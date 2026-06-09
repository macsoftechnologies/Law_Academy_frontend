import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getUsersList, sendnotifications } from "../../services/authService";
import "../../forms/form.css";

const getInitial = (name = "") => name.charAt(0).toUpperCase() || "?";

function Notifications() {
  const [users, setUsers]                 = useState([]);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [title, setTitle]                 = useState("");
  const [message, setMessage]             = useState("");
  const [type, setType]                   = useState("");
  const [loading, setLoading]             = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    setFetchingUsers(true);
    getUsersList(1, 100)
      .then((data) => setUsers(data?.data || data?.users || []))
      .catch(() => setUsers([]))
      .finally(() => setFetchingUsers(false));
  }, []);

  const toggleUser = (uid) =>
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );

  const handleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === users.length ? [] : users.map((u) => u.userId || u._id)
    );

  const handleSend = async () => {
    if (!type) {
      Swal.fire("Validation Error", "Please select a type.", "warning");
      return;
    }
    if (!title.trim()) {
      Swal.fire("Validation Error", "Title is required.", "warning");
      return;
    }
    if (!message.trim()) {
      Swal.fire("Validation Error", "Message is required.", "warning");
      return;
    }
    if (selectedIds.length === 0) {
      Swal.fire("Validation Error", "Select at least one user.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await sendnotifications({
        title:   title.trim(),
        message: message.trim(),
        type:    type,
        userId:  selectedIds,
      });
      Swal.fire({
        title: "Sent!",
        text: res?.message || "Notification sent successfully!",
        icon: "success",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#35a542",
      });
      setTitle("");
      setMessage("");
      setType("");
      setSelectedIds([]);
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to send. Try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-form">

      <h4 className="form-label fw-bold mb-4" style={{ fontSize: 20, letterSpacing: 1 }}>
        PUSH NOTIFICATIONS
      </h4>

      {/* ── Type ── */}
      <div className="mb-3">
        <label className="form-label">Type</label>
        <select
          className="form-select"
          style={{ cursor: "pointer" }}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="referral">Referral</option>
          <option value="goal_reached">Goal Reached</option>
          <option value="enrollment">Enrollment</option>
          <option value="announcement">Announcement</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* ── User Checkbox List ── */}
      <div className="mb-3">
        <label className="form-label">
          Select Users{" "}
          {users.length > 0 && (
            <span style={{ color: "#C9A227", fontWeight: 700 }}>
              ({selectedIds.length}/{users.length})
            </span>
          )}
        </label>

        {/* plain bordered box — no z-index conflict with toast */}
        <div style={{
          border: "2px solid #C9A227",
          borderRadius: 9,
          maxHeight: 300,
          overflowY: "auto",
          background: "#fff",
          position: "relative",   // stays in normal flow, never above toast
          zIndex: 1,
        }}>
          {fetchingUsers ? (
            <div style={{ padding: "14px 16px", color: "#888", fontSize: 14 }}>
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "14px 16px", color: "#888", fontSize: 14 }}>
              No users found.
            </div>
          ) : (
            <>
              {/* Select All row */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background: "#f7f9ff",
                borderBottom: "1px solid #eef2fb",
                cursor: "pointer",
                fontWeight: 700,
                color: "#1A3C8B",
                userSelect: "none",
              }}>
                <input
                  type="checkbox"
                  style={{ width: 16, height: 16, accentColor: "#1A3C8B", cursor: "pointer" }}
                  checked={users.length > 0 && selectedIds.length === users.length}
                  onChange={handleSelectAll}
                />
                Select All
              </label>

              {/* User rows */}
              {users.map((user) => {
                const uid       = user.userId || user._id;
                const isChecked = selectedIds.includes(uid);
                const name      = user.name || user.fullName || user.email || "Unknown";
                const phone     = user.mobile_number || user.mobileNumber || user.phone || "";

                return (
                  <label
                    key={uid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      borderBottom: "1px solid #f5f0e8",
                      cursor: "pointer",
                      userSelect: "none",
                      background: isChecked ? "#fdefc9" : "#ffffff",
                      transition: "background 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: 16, height: 16, accentColor: "#1A3C8B", cursor: "pointer", flexShrink: 0 }}
                      checked={isChecked}
                      onChange={() => toggleUser(uid)}
                    />
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      background: "#1A3C8B",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {getInitial(name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{name}</div>
                      {phone && <div style={{ fontSize: 12, color: "#888" }}>{phone}</div>}
                    </div>
                  </label>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Title ── */}
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* ── Message ── */}
      <div className="mb-3">
        <label className="form-label">Message</label>
        <textarea
          className="form-control"
          placeholder="Enter notification message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* ── Send Button ── */}
      <div className="text-end mt-3">
        <button
          type="button"
          className="btn-submit"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending…" : "Send Notification"}
        </button>
      </div>

    </div>
  );
}

export default Notifications;