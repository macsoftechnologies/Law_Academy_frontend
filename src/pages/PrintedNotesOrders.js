import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";

import Table from "../components/Table";
import Modal from "../components/Modal";

import { getPrintednotesoders, updateOrderStatus } from "../services/authService";

const STATUS_FLOW = {
  pending:          { next: "shipped",          label: "Pending",          color: "#ff9800", nextLabel: "Mark as Shipped" },
  shipped:          { next: "out_for_delivery",  label: "Shipped",          color: "#17a2b8", nextLabel: "Mark as Out for Delivery" },
  out_for_delivery: { next: "delivered",         label: "Out for Delivery", color: "#9c27b0", nextLabel: "Mark as Delivered" },
  delivered:        { next: null,                label: "Delivered",        color: "#4caf50", nextLabel: null },
  cancelled:        { next: null,                label: "Cancelled",        color: "#dc3545", nextLabel: null },
};

const getStatusStyle = (status) => ({
  color: STATUS_FLOW[status]?.color || "#333",
  fontWeight: "bold",
});


const PrintedNotesOrders = () => {
  const [viewOpen, setViewOpen]       = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersList, setOrdersList]   = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [pageLimit, setPageLimit]     = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Status transition modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget]       = useState(null);
  // statusTarget = { order_id, currentStatus, nextStatus, nextLabel }

  const fetchOrders = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true);
      try {
        const res = await getPrintednotesoders(page, limit);
        setOrdersList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch {
        Swal.fire("Error", "Failed to fetch printed notes orders", "error");
        setOrdersList([]);
        setTotalPages(1);
      }finally {
    setIsLoading(false);    
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchOrders(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchOrders]);

  const handleView = (item) => {
    setSelectedOrder(item);
    setViewOpen(true);
  };

  const handleStatusClick = (item) => {
    const flow = STATUS_FLOW[item.status];
    if (!flow?.next) return;
    setStatusTarget({
      order_id:      item.order_id,
      currentStatus: item.status,
      nextStatus:    flow.next,
      nextLabel:     flow.nextLabel,
    });
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    try {
      await updateOrderStatus({ order_id: statusTarget.order_id, status: statusTarget.nextStatus });

      const update = (o) =>
        o.order_id === statusTarget.order_id ? { ...o, status: statusTarget.nextStatus } : o;

      setOrdersList((prev) => prev.map(update));
      setSelectedOrder((prev) => (prev ? update(prev) : prev));

      setStatusModalOpen(false);
      setStatusTarget(null);

      Swal.fire({
        title: "Updated!",
        text: `Order marked as ${STATUS_FLOW[statusTarget.nextStatus].label}`,
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#28a745",
        color: "#ffffff",
      });
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const columns = [
    { header: "S.No",           accessor: "serial" },
    { header: "Name",           accessor: "user_name" },
    { header: "Notes Title",    accessor: "notes_title" },
    { header: "Mobile Number",  accessor: "mobile_number" },
    { header: "Payment Amount", accessor: "payment_amount" },
    { header: "Payment Method", accessor: "payment_method" },
    { header: "Status",         accessor: "status_badge" },
    { header: "Actions",        accessor: "actions" },
  ];

  const tableData = ordersList.map((item, index) => {
    const user   = item.userId?.[0]   || {};
    const note   = item.notes_id?.[0] || {};
    // const coupon = item.coupon_id?.[0] || {};
    const flow   = STATUS_FLOW[item.status];

    return {
      ...item,
      serial:         (currentPage - 1) * pageLimit + index + 1,
      user_name:      user.name          || "—",
      notes_title:    note.title         || "—",
      mobile_number:  user.mobile_number || "—",
      // payment_amount: coupon.offer_amount != null ? `₹${coupon.offer_amount}` : "—",
      payment_method: item.payment_method || "—",

      status_badge: flow?.next ? (
        <span
          style={{
            ...getStatusStyle(item.status),
            cursor: "pointer",
            textDecoration: "underline dotted",
          }}
          title={`Click to: ${flow.nextLabel}`}
          onClick={() => handleStatusClick(item)}
        >
          {flow.label} ▶
        </span>
      ) : (
        <span style={getStatusStyle(item.status)}>
          {flow?.label || item.status}
        </span>
      ),

      actions: (
        <div className="actions d-flex">
          <button
            className="icon-btn view me-2"
            onClick={() => handleView(item)}
          >
            <FaEye />
          </button>
        </div>
      ),
    };
  });

  const sectionHeading = (title) => (
    <div className="col-12 mt-3 mb-2">
      <h6
        style={{
          borderBottom: "1px solid #872026",
          paddingBottom: "5px",
          color: "#872026",
          fontWeight: 700,
          marginBottom: 0,
        }}
      >
        {title}
      </h6>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h2>PRINTED NOTES ORDERS</h2>

        <div className="d-flex gap-2 align-items-center">
          <label style={{ color: "#2b377b" }}>Records per page:</label>
          <select
            style={{ border: "2px solid #872026", padding: "2px", cursor: "pointer" }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchOrders(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
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

      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedOrder(null); }}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (() => {
          const user    = selectedOrder.userId?.[0]     || {};
          const note    = selectedOrder.notes_id?.[0]   || {};
          const address = selectedOrder.address_id?.[0] || {};
          const coupon  = selectedOrder.coupon_id?.[0]  || {};
          const flow    = STATUS_FLOW[selectedOrder.status];

          return (
            <div className="container">

              {sectionHeading("📄 Notes Details")}
              <div className="row mb-2 mt-2">
                <div className="col-md-6">
                  <b>Notes Title:</b>
                  <div className="mt-1">{note.title || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <b>Notes Sub Title:</b>
                  <div className="mt-1">{note.sub_title || "N/A"}</div>
                </div>
              </div>

              {sectionHeading("👤 User Details")}
              <div className="row mb-2 mt-2">
                <div className="col-md-6">
                  <b>User Name:</b>
                  <div className="mt-1">{user.name || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <b>Mobile Number:</b>
                  <div className="mt-1">{user.mobile_number || "N/A"}</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <b>Email:</b>
                  <div className="mt-1">{user.email || "N/A"}</div>
                </div>
              </div>

              {sectionHeading("📍 Address Details")}
              <div className="row mb-2 mt-2">
                <div className="col-md-6">
                  <b>Full Name:</b>
                  <div className="mt-1">{address.full_name || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <b>Address:</b>
                  <div className="mt-1">{address.address || "N/A"}</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <b>City:</b>
                  <div className="mt-1">{address.city || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <b>Region:</b>
                  <div className="mt-1">{address.region || "N/A"}</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <b>Zip Code:</b>
                  <div className="mt-1">{address.zip_code || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <b>Country:</b>
                  <div className="mt-1">{address.country || "N/A"}</div>
                </div>
              </div>

              {sectionHeading("💳 Payment Details")}
              <div className="row mb-2 mt-2">
                <div className="col-md-6">
                  <b>Payment Method:</b>
                  <div className="mt-1">{selectedOrder.payment_method || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <b>Coupon Code:</b>
                  <div className="mt-1">{coupon.coupon_code || "N/A"}</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <b>Offer Amount:</b>
                  <div className="mt-1">
                    {coupon.offer_amount != null ? `₹${coupon.offer_amount}` : "N/A"}
                  </div>
                </div>
                <div className="col-md-6">
                  <b>Order Date:</b>
                  <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                    {selectedOrder.createdAt?.split("T")[0] || "N/A"}
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <b>Status:</b>
                  <div className="mt-1">
                    <span style={getStatusStyle(selectedOrder.status)}>
                      {flow?.label || selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <hr />
              <div className="d-flex justify-content-end gap-2">
                {/* Show advance-status button only if there's a next step */}
                {flow?.next && (
                  <button
                    className="btn btn-primary"
                    style={{ background: "#2b377b", border: "none" }}
                    onClick={() => {
                      setViewOpen(false);
                      handleStatusClick(selectedOrder);
                    }}
                  >
                    {flow.nextLabel}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => { setViewOpen(false); setSelectedOrder(null); }}
                >
                  Close
                </button>
              </div>

            </div>
          );
        })()}
      </Modal>

      <Modal
        open={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setStatusTarget(null); }}
        title="Update Order Status"
        size="md"
      >
        {statusTarget && (
          <div className="container text-center py-3">
            {/* Step indicator */}
            <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: STATUS_FLOW[statusTarget.currentStatus].color + "22",
                  color: STATUS_FLOW[statusTarget.currentStatus].color,
                  fontWeight: 700,
                  fontSize: "14px",
                  border: `1.5px solid ${STATUS_FLOW[statusTarget.currentStatus].color}`,
                }}
              >
                {STATUS_FLOW[statusTarget.currentStatus].label}
              </span>

              <span style={{ fontSize: "20px", color: "#888" }}>→</span>

              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: STATUS_FLOW[statusTarget.nextStatus].color + "22",
                  color: STATUS_FLOW[statusTarget.nextStatus].color,
                  fontWeight: 700,
                  fontSize: "14px",
                  border: `1.5px solid ${STATUS_FLOW[statusTarget.nextStatus].color}`,
                }}
              >
                {STATUS_FLOW[statusTarget.nextStatus].label}
              </span>
            </div>

            <p style={{ color: "#555", fontSize: "15px" }}>
              Are you sure you want to update this order's status?
            </p>

            <div className="d-flex justify-content-center gap-2 mt-3">
              <button
                className="btn btn-primary"
                style={{ background: "#2b377b", border: "none", minWidth: "160px" }}
                onClick={handleStatusConfirm}
              >
                {statusTarget.nextLabel}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setStatusModalOpen(false); setStatusTarget(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default PrintedNotesOrders;