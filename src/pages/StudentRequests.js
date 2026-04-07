import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";
import {
  getStudentRequestlist,
  completeStudentRequest,
} from "../services/authService";

function StudentRequests() {
  const [requestsList, setRequestsList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 Fetch requests wrapped in useCallback
  const fetchRequests = useCallback(async (page = 1, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const res = await getStudentRequestlist(page, limit);

      let data = [];
      let pages = 1;

      if (res && Array.isArray(res.data)) {
        data = res.data;
        pages = res.totalPages || 1;
      }

      setRequestsList(data);
      setTotalPages(pages);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch student requests", "error");
      setRequestsList([]);
      setTotalPages(1);
    }finally {
    setIsLoading(false);    
  }
  }, [pageLimit]);

  useEffect(() => {
    fetchRequests(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchRequests]);

  const handleView = (request) => {
    setSelectedRequest({
      detailsId: request.detailsId,
      name: request.name,
      email: request.email,
      mobile_number: request.mobile_number,
      status: request.status,
    });
    setViewOpen(true);
  };

  const handleComplete = async (detailsId) => {
    try {
      await completeStudentRequest(detailsId);
      Swal.fire("Success", "Request marked as Completed", "success");
      setViewOpen(false);
      fetchRequests(currentPage, pageLimit);
    } catch (error) {
      Swal.fire("Error", "Failed to complete request", "error");
    }
  };

  const getStatusStyle = (status) => {
    if (status === "pending") return { color: "#ff9800", fontWeight: "bold" };
    if (status === "completed") return { color: "#4caf50", fontWeight: "bold" };
    return {};
  };

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Mobile", accessor: "mobile_number" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = requestsList.map((req, index) => {
    const user = req.userId?.[0];

    return {
      sno: (currentPage - 1) * pageLimit + index + 1,
      id: req.detailsId,
      name: user?.name || "-",
      email: user?.email || "-",
      mobile_number: user?.mobile_number || "-",
      status: <span style={getStatusStyle(req.status)}>{req.status}</span>,
      actions: (
        <div className="actions">
          <button
            className="icon-btn view"
            onClick={() => handleView(req)}
            title="View"
          >
            <FaEye />
          </button>
        </div>
      ),
    };
  });

  return (
    <div>
      {/* Header + Records per page */}
      <div className="d-flex justify-content-between mb-3">
        <h2>STUDENT REQUESTS</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
            style={{
              border: "2px solid #872026",
              padding: "2px",
              cursor: "pointer",
            }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchRequests(1, limit);
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

      {/* View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Student Change Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="container">
            <div className="row mb-2">
              <div className="col-md-6"><b>Name:</b> {selectedRequest.name}</div>
              <div className="col-md-6"><b>Email:</b> {selectedRequest.email}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><b>Mobile:</b> {selectedRequest.mobile_number}</div>
              <div className="col-md-6">
                <b>Status:</b>{" "}
                <span style={getStatusStyle(selectedRequest.status)}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>
            <div className="text-end mt-4">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setViewOpen(false)}
              >
                Cancel
              </button>
              {selectedRequest.status === "pending" && (
                <button
                  className="btn btn-success"
                  onClick={() =>
                    handleComplete(selectedRequest.detailsId)
                  }
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentRequests;
