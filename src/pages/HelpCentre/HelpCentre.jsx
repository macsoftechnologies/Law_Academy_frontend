import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Swal from "sweetalert2";
import {
  getTickets,
  updateTicketStatus,
} from "../../services/authService";
import { FaEye, FaEdit } from "react-icons/fa";
import CommonHeader from "../../components/CommonHeader";
import TicketDetailModal from "./TicketDetailModal";
import Button from "../../components/Button";

const STATUS_OPTIONS = ["pending", "in_progress", "resolved", "closed"];

const statusBadge = (status) => {
  const colors = {
    pending:     { background: "#7c5800", color: "#ffd966" },
    in_progress: { background: "#0a3d62", color: "#74b9ff" },
    resolved:    { background: "#1a4731", color: "#55efc4" },
    closed:      { background: "#3d1a1a", color: "#ff7675" },
  };
  const style = colors[status] || { background: "#2e3f66", color: "#fff" };
  return (
    <span
      style={{
        ...style,
        padding: "3px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status?.replace("_", " ") || "—"}
    </span>
  );
};

const typeBadge = (type) => {
  const style =
    type === "course"
      ? { background: "#2d1a5e", color: "#a29bfe" }
      : { background: "#1a3a4a", color: "#81ecec" };
  return (
    <span
      style={{
        ...style,
        padding: "3px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {type || "—"}
    </span>
  );
};

// ── Inline Status Form ────────────────────────────────────────────────────────
const StatusForm = ({ item, onClose, onSubmit }) => {
  const [newStatus, setNewStatus] = useState(item?.status || "pending");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newStatus);
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-12 mb-3">
          <label className="form-label">Ticket</label>
          <input
            type="text"
            className="form-control"
            value={item?.title || ""}
            disabled
          />
        </div>

        <div className="col-md-12 mb-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-end mt-3">
        <Button
          type="button"
          text="Cancel"
          variant="outline-danger"
          size="medium"
          onClick={onClose}
          style={{ marginRight: "8px" }}
        />
        <Button
          type="submit"
          text="Update"
          variant="success"
          size="medium"
        />
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HelpCentre = () => {
  const [list, setList] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = useCallback(
    async (page = 1, limit = pageLimit, status = statusFilter) => {
      setIsLoading(true);
      try {
        const res = await getTickets(page, limit, status);
        console.log("Tickets API response:", res);

        let data = [];
        let pages = 1;

        if (res && Array.isArray(res.tickets)) {
          data = res.tickets;
          pages = res.pagination?.totalPages || 1;
        } else if (Array.isArray(res)) {
          data = res;
        }

        setList(data);
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
        setList([]);
        setTotalPages(1);
        Swal.fire("Error", "Failed to fetch tickets", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [pageLimit, statusFilter]
  );

  useEffect(() => {
    fetchData(currentPage, pageLimit, statusFilter);
  }, [currentPage, pageLimit, statusFilter, fetchData]);

  const handleView = (item) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleEditStatus = (item) => {
    setSelectedItem(item);
    setStatusOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedItem || !newStatus) return;
    try {
      await updateTicketStatus({
        ticketId: selectedItem.ticketId,
        status: newStatus,
      });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "Ticket status updated",
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#1a4731",
      });
      setStatusOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, pageLimit, statusFilter);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    }
  };

  const columns = [
    { header: "S.No",       accessor: "sno" },
    { header: "Title",      accessor: "title" },
    { header: "Type",       accessor: "ticket_type_badge" },
    { header: "Status",     accessor: "status_badge" },
    // { header: "User",       accessor: "user_name" },
    { header: "Assignee",   accessor: "assignee_name" },
    { header: "Created At", accessor: "created_at_fmt" },
    { header: "Actions",    accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,
    ticket_type_badge: typeBadge(item.ticket_type),
    status_badge: statusBadge(item.status),
    // user_name:
    //   item.userId?.name || item.userId?.email || "—",
    assignee_name:
      item.assigneeId?.name || item.assigneeId?.emailId || "Unassigned",
    created_at_fmt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-IN")
      : "—",
    actions: (
      <div className="actions">
        <button className="icon-btn view" onClick={() => handleView(item)}>
          <FaEye />
        </button>
        <button className="icon-btn edit" onClick={() => handleEditStatus(item)}>
          <FaEdit />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <CommonHeader
        title="HELP CENTRE"
        count={list.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={(limit) => {
          setPageLimit(limit);
          setCurrentPage(1);
          fetchData(1, limit, statusFilter);
        }}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => fetchData(page, limit, statusFilter)}
      />

      {/* Status Filter Tabs */}
      <div
        style={{
          padding: "0 16px 12px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {["", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
            style={{
              padding: "5px 14px",
              borderRadius: "20px",
              border: "1px solid #2e3f66",
              background: statusFilter === s ? "#35a542" : "#1a2744",
              color: "#fff",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: statusFilter === s ? 700 : 400,
              textTransform: "capitalize",
            }}
          >
            {s === "" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* View / Chat Modal */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Ticket Details"
        size="lg"
      >
        {selectedItem && (
          <TicketDetailModal
            ticket={selectedItem}
            onClose={() => {
              setViewOpen(false);
              fetchData(currentPage, pageLimit, statusFilter);
            }}
          />
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        open={statusOpen}
        onClose={() => {
          setStatusOpen(false);
          setSelectedItem(null);
        }}
        title="Update Ticket Status"
        size="sm"
      >
        {selectedItem && (
          <StatusForm
            item={selectedItem}
            onClose={() => {
              setStatusOpen(false);
              setSelectedItem(null);
            }}
            onSubmit={handleStatusUpdate}
          />
        )}
      </Modal>
    </div>
  );
};

export default HelpCentre;