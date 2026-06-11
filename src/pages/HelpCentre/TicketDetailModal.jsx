import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import Button from "../../components/Button";
import {
  getTicketDetails,
  addAdminMessage,
  assignTicket,
  markAdminMessagesRead,
  updateCallStatus,
  deleteAdminMessage,
} from "../../services/authService";
import { FaTrash, FaPhone, FaPhoneSlash } from "react-icons/fa";

const CALL_STATUS_OPTIONS = ["none", "scheduled", "completed", "cancelled"];

const TicketDetailModal = ({ ticket, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [callStatus, setCallStatus] = useState("none");
  const [updatingCall, setUpdatingCall] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDetail = useCallback(async () => {
  try {
    const res = await getTicketDetails(ticket.ticketId);
    const data = res?.data || res;
    setDetail(data);
    setCallStatus(data?.callStatus || "none");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to load ticket details", "error");
  } finally {
    setIsLoading(false);
  }
}, [ticket.ticketId]);

 useEffect(() => {
  fetchDetail();
  markAdminMessagesRead({ ticketId: ticket.ticketId }).catch(console.error);
}, [fetchDetail, ticket.ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [detail]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const senderId = localStorage.getItem("adminId") || "";
      await addAdminMessage({
        ticketId: ticket.ticketId,
        senderId,
        message: message.trim(),
      });
      setMessage("");
      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to send message",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async () => {
    if (!assigneeId.trim()) return;
    try {
      await assignTicket({
        ticketId: ticket.ticketId,
        assigneeId: assigneeId.trim(),
      });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "Ticket assigned",
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#1a4731",
      });
      setAssigneeId("");
      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Assign failed",
        "error"
      );
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const result = await Swal.fire({
      title: "Delete message?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#2e3f66",
      confirmButtonText: "Delete",
      background: "#1a2744",
      color: "#fff",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteAdminMessage(ticket.ticketId, messageId);
      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  const handleUpdateCallStatus = async () => {
    setUpdatingCall(true);
    try {
      await updateCallStatus({
        ticketId: ticket.ticketId,
        callStatus,
      });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "Call status updated",
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#1a4731",
      });
      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    } finally {
      setUpdatingCall(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div style={{ color: "#8ab4d4", padding: "20px", textAlign: "center" }}>
        Loading ticket details...
      </div>
    );
  }

  const messages = detail?.messages || [];
  const isClosed =
    detail?.status === "resolved" || detail?.status === "closed";

  const labelStyle = { color: "#8ab4d4", fontWeight: 600 };
  const valueStyle = { color: "#fff" };
  const sectionBoxStyle = {
    background: "#1a2744",
    border: "1px solid #2e3f66",
    borderRadius: "8px",
    padding: "12px",
  };
  const sectionTitleStyle = {
    color: "#8ab4d4",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "#fff" }}>

      {/* Info Row */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          background: "#1a2744",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "13px",
        }}
      >
        <div>
          <span style={labelStyle}>Title: </span>
          <span style={valueStyle}>{detail?.title || ticket.title}</span>
        </div>
        <div>
          <span style={labelStyle}>Type: </span>
          <span style={{ ...valueStyle, textTransform: "capitalize" }}>
            {detail?.ticket_type || ticket.ticket_type || "—"}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Status: </span>
          <span style={{ ...valueStyle, textTransform: "capitalize" }}>
            {detail?.status?.replace("_", " ") || "—"}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Assignee: </span>
          <span style={valueStyle}>
            {detail?.assigneeId?.name ||
              detail?.assigneeId?.emailId ||
              "Unassigned"}
          </span>
        </div>
        {detail?.unreadCountAdmin > 0 && (
          <div>
            <span
              style={{
                background: "#e74c3c",
                color: "#fff",
                borderRadius: "10px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {detail.unreadCountAdmin} unread
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {detail?.description && (
        <div
          style={{
            background: "#1a2744",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#c8d6e5",
            borderLeft: "3px solid #35a542",
          }}
        >
          <span style={labelStyle}>Description: </span>
          {detail.description}
        </div>
      )}

      {/* Chat Box */}
      <div
        style={{
          background: "#0f1a33",
          border: "1px solid #2e3f66",
          borderRadius: "8px",
          height: "320px",
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#4a6080", textAlign: "center", marginTop: "40px" }}>
            No messages yet.
          </div>
        )}
        {messages.map((msg, i) => {
          const isAdmin = msg.senderRole !== "student";
          return (
            <div
              key={msg._id || i}
              style={{
                alignSelf: isAdmin ? "flex-end" : "flex-start",
                maxWidth: "75%",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#8ab4d4",
                  marginBottom: "3px",
                  textAlign: isAdmin ? "right" : "left",
                  display: "flex",
                  justifyContent: isAdmin ? "flex-end" : "flex-start",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {msg.senderName || (isAdmin ? "Admin" : "Student")}
                {isAdmin && !msg.isDeleted && (
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer",
                      padding: "0 2px",
                      fontSize: "11px",
                      lineHeight: 1,
                    }}
                    title="Delete message"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div
                style={{
                  background: isAdmin ? "#35a542" : "#1a2744",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: isAdmin
                    ? "12px 12px 0 12px"
                    : "12px 12px 12px 0",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {msg.isDeleted ? (
                  <em style={{ color: "#aaa" }}>Message deleted</em>
                ) : (
                  msg.message
                )}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#4a6080",
                  marginTop: "3px",
                  textAlign: isAdmin ? "right" : "left",
                }}
              >
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleString("en-IN")
                  : ""}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Box */}
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
        <textarea
          rows={2}
          style={{
            flex: 1,
            background: "#1a2744",
            border: "1px solid #2e3f66",
            borderRadius: "6px",
            color: "#fff",
            padding: "8px 10px",
            resize: "none",
            fontSize: "13px",
          }}
          placeholder={
            isClosed
              ? "Ticket is closed — no further replies"
              : "Type a reply… (Enter to send)"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isClosed}
        />
        <Button
          text={sending ? "Sending…" : "Send"}
          variant="primary"
          size="medium"
          disabled={sending || !message.trim() || isClosed}
          onClick={handleSend}
        />
      </div>

      {/* Call Status Section */}
      <div style={sectionBoxStyle}>
        <div style={sectionTitleStyle}>
          {detail?.callScheduled ? (
            <FaPhone color="#35a542" />
          ) : (
            <FaPhoneSlash color="#636e72" />
          )}
          Call Status
          <span
            style={{
              marginLeft: "4px",
              padding: "2px 8px",
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: 700,
              background: detail?.callScheduled ? "#1a4731" : "#2e3f66",
              color: detail?.callScheduled ? "#55efc4" : "#636e72",
            }}
          >
            {detail?.callScheduled ? "True" : "False"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "12px" }}>
          {CALL_STATUS_OPTIONS.map((s) => (
            <label
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "13px",
                color: callStatus === s ? "#fff" : "#8ab4d4",
                fontWeight: callStatus === s ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name="callStatus"
                value={s}
                checked={callStatus === s}
                onChange={(e) => setCallStatus(e.target.value)}
                style={{
                  accentColor: "#35a542",
                  width: "15px",
                  height: "15px",
                  cursor: "pointer",
                }}
              />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </label>
          ))}
        </div>

        <Button
          text={updatingCall ? "Saving…" : "Save"}
          variant="success"
          size="medium"
          disabled={updatingCall}
          onClick={handleUpdateCallStatus}
        />
      </div>

      {/* Assign Section */}
      <div style={sectionBoxStyle}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                color: "#8ab4d4",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Assign to Admin (paste adminId)
            </label>
            <input
              type="text"
              style={{
                background: "#0f1a33",
                border: "1px solid #2e3f66",
                borderRadius: "6px",
                color: "#fff",
                padding: "7px 10px",
                fontSize: "13px",
                width: "100%",
              }}
              placeholder="Enter assigneeId UUID"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            />
          </div>
          <Button
            text="Assign"
            variant="secondary"
            size="medium"
            disabled={!assigneeId.trim()}
            onClick={handleAssign}
          />
        </div>
      </div>

    </div>
  );
};

export default TicketDetailModal;