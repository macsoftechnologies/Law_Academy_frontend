import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";

import Table from "../components/Table";
import Modal from "../components/Modal";

import { getPrintednotesoders, updateOrderStatus } from "../services/authService";

const PrintedNotesOrders = () => {
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetchOrders = useCallback(
    async (page = 1, limit = pageLimit) => {
      try {
        const res = await getPrintednotesoders(page, limit);
        setOrdersList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch printed notes orders", "error");
        setOrdersList([]);
        setTotalPages(1);
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

  const handleStatusUpdate = async (orderId) => {
    const result = await Swal.fire({
      title: "Update Status?",
      text: "Are you sure you want to mark this order as Shipped?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Mark as Shipped",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2b377b",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await updateOrderStatus({ order_id: orderId, status: "shipped" });

      setOrdersList((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, status: "shipped" } : o
        )
      );

      setSelectedOrder((prev) =>
        prev ? { ...prev, status: "shipped" } : prev
      );

      Swal.fire({
        title: "Updated!",
        text: "Order marked as shipped",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#28a745",
        color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const getStatusStyle = (status) => {
    if (status === "pending") return { color: "#ff9800", fontWeight: "bold" };
    if (status === "shipped") return { color: "#17a2b8", fontWeight: "bold" };
    if (status === "delivered") return { color: "#4caf50", fontWeight: "bold" };
    if (status === "cancelled") return { color: "#dc3545", fontWeight: "bold" };
    return { fontWeight: "bold" };
  };

  const columns = [
    { header: "S.No",           accessor: "serial" },
    { header: "Name",      accessor: "user_name" },
    { header: "Notes Title",    accessor: "notes_title" },
    { header: "Mobile Number",  accessor: "mobile_number" },
    { header: "Payment Amount", accessor: "payment_amount" },
    { header: "Payment Method", accessor: "payment_method" },
    { header: "Status",         accessor: "status_badge" },
    { header: "Actions",        accessor: "actions" },
  ];

  const tableData = ordersList.map((item, index) => {
    const user   = item.userId?.[0]    || {};
    const note   = item.notes_id?.[0]  || {};
    // const coupon = item.coupon_id?.[0] || {};

    return {
      ...item,
      serial:         (currentPage - 1) * pageLimit + index + 1,
      user_name:      user.name                                         || "—",
      notes_title:    note.title                                        || "—",
      mobile_number:  user.mobile_number                                || "—",
      // payment_amount: coupon.offer_amount != null ? `₹${coupon.offer_amount}` : "—",
      payment_method: item.payment_method                               || "—",
      status_badge:
        item.status === "pending" ? (
          <span
            style={{ ...getStatusStyle("pending"), cursor: "pointer" }}
            onClick={() => handleStatusUpdate(item.order_id)}
          >
            pending ▶
          </span>
        ) : (
          <span style={getStatusStyle(item.status)}>{item.status}</span>
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

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
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
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <hr />
              <div className="d-flex justify-content-end gap-2">
                {selectedOrder.status === "pending" && (
                  <button
                    className="btn btn-primary"
                    style={{ background: "#2b377b", border: "none" }}
                    onClick={() => handleStatusUpdate(selectedOrder.order_id)}
                  >
                    Mark as Shipped
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
    </div>
  );
};

export default PrintedNotesOrders;