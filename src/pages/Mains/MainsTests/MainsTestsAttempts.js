import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Table from "../../../components/Table";
import Modal from "../../../components/Modal";

import {
  getMainsTestsAttempts,
  getMainsTestsAttemptsById,
} from "../../../services/authService";

import { FaEye } from "react-icons/fa";
import CommonHeader from "../../../components/CommonHeader";

const MainsTestsAttempts = () => {
  const navigate = useNavigate();

  const [viewOpen,    setViewOpen]    = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptsList,    setAttemptsList]    = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [pageLimit,   setPageLimit]   = useState(10);

  const [isLoading, setIsLoading] = useState(false);

  const fetchAttempts = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true);
      try {
        const res = await getMainsTestsAttempts(page, limit);
        setAttemptsList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch {
        Swal.fire("Error", "Failed to fetch mains test attempts", "error");
        setAttemptsList([]);
        setTotalPages(1);
      }finally {
    setIsLoading(false);
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchAttempts(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchAttempts]);

  const statusBadge = (status, attemptId) => {
    const map = {
      result:   "success",
      pending:  "warning",
      reviewed: "info",
    };
    const color = map[status?.toLowerCase()] || "secondary";
    const isPending = status?.toLowerCase() === "pending";
    return (
      <span
        className={`badge bg-${color}`}
        style={{ fontSize: "11px", cursor: isPending ? "pointer" : "default" }}
        onClick={() => isPending && navigate(`/mains-result/${attemptId}`)}
      >
        {status || "N/A"}
      </span>
    );
  };

  const handleView = async (item, index) => {
    setViewOpen(true);
    setViewLoading(true);
    setSelectedAttempt(null);
    try {
      const res = await getMainsTestsAttemptsById(item.mains_attempt_id);
      const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};
      setSelectedAttempt({ ...d, serial: (currentPage - 1) * pageLimit + index + 1 });
    } catch {
      setSelectedAttempt({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    } finally {
      setViewLoading(false);
    }
  };

  const columns = [
    { header: "S.No",       accessor: "serial"       },
    { header: "Student",    accessor: "studentName"  },
    { header: "Subject",    accessor: "subjectTitle" },
    { header: "Test",       accessor: "testTitle"    },
    { header: "Date",       accessor: "date"         },
    { header: "Attempt No", accessor: "attempt_no"   },
    { header: "Status",     accessor: "statusBadge"  },
    { header: "Actions",    accessor: "actions"      },
  ];

  const tableData = attemptsList.map((item, index) => ({
    ...item,
    serial:       (currentPage - 1) * pageLimit + index + 1,
    studentName:  item.user?.name || "N/A",
    subjectTitle: item.subject?.title || "N/A",
    testTitle:    item.mainsTest?.title || "N/A",
    statusBadge:  statusBadge(item.status, item.mains_attempt_id),
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view" onClick={() => handleView(item, index)}>
          <FaEye />
        </button>
      </div>
    ),
  }));

  return (
    <div>
     <CommonHeader
        title="MAINS TESTS ATTEMPTS"
        count={attemptsList.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={(limit) => {
          setPageLimit(limit);
          setCurrentPage(1);
        }}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => {
          setCurrentPage(page);
          setPageLimit(limit);
        }}
      />

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
        onClose={() => { setViewOpen(false); setSelectedAttempt(null); }}
        title="Mains Test Attempt Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Loading details...</p>
          </div>
        ) : selectedAttempt ? (
          <div className="container">

            <h6 className="mb-3" style={{ color: "#2b377b", fontWeight: "bold" }}>👤 Student Info</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Name:</b>
                <div className="mt-1">{selectedAttempt.user?.name || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>Email:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.user?.email || "N/A"}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Mobile:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.user?.mobile_number || "N/A"}
                </div>
              </div>
              <div className="col-md-6">
                <b>Status:</b>
                <div className="mt-1">{statusBadge(selectedAttempt.status, selectedAttempt.mains_attempt_id)}</div>
              </div>
            </div>

            <hr />

            <h6 className="mb-3" style={{ color: "#2b377b", fontWeight: "bold" }}>📋 Attempt Info</h6>
            <div className="row mb-3">
              <div className="col-md-4">
                <b>Date:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.date || "N/A"}
                </div>
              </div>
              <div className="col-md-4">
                <b>Time:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.time || "N/A"}
                </div>
              </div>
              <div className="col-md-4">
                <b>Attempt No:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.attempt_no || "N/A"}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-12">
                <b>Answer Script:</b>
                <div className="mt-1">
                  {selectedAttempt.answer_script_file ? (
                    <a
                      href={selectedAttempt.answer_script_file}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#872026", wordBreak: "break-all", fontSize: "13px" }}
                    >
                      {selectedAttempt.answer_script_file}
                    </a>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            <hr />

            <h6 className="mb-3" style={{ color: "#2b377b", fontWeight: "bold" }}>📝 Subject Test Info</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Subject Title:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.subject?.title || "N/A"}
                </div>
              </div>
              <div className="col-md-2">
                <b>No of Qs:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.subject?.no_of_qos || "N/A"}
                </div>
              </div>
              <div className="col-md-2">
                <b>Duration:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.subject?.duration || "N/A"}
                </div>
              </div>
              <div className="col-md-2">
                <b>Marks:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.subject?.marks || "N/A"}
                </div>
              </div>
            </div>

            <hr />

            <h6 className="mb-3" style={{ color: "#2b377b", fontWeight: "bold" }}>⚖️ Mains Test Info</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Test Title:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.mainsTest?.title || "N/A"}
                </div>
              </div>
              <div className="col-md-3">
                <b>No of Questions:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.mainsTest?.no_of_qs || "N/A"}
                </div>
              </div>
              <div className="col-md-3">
                <b>No of Subjects:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedAttempt.mainsTest?.no_of_subjects || "N/A"}
                </div>
              </div>
            </div>
            {selectedAttempt.mainsTest?.presentation_image && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <b>Presentation Image:</b>
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedAttempt.mainsTest.presentation_image}`}
                      alt="Presentation"
                      style={{ maxHeight: "120px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedAttempt.result && (
              <>
                <hr />
                <h6 className="mb-3" style={{ color: "#2b377b", fontWeight: "bold" }}>🏆 Result Info</h6>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <b>Marks Scored:</b>
                    <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                      {selectedAttempt.result.marks_scored ?? "N/A"}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <b>Overall %:</b>
                    <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                      {selectedAttempt.result.overall_percentage != null
                        ? `${selectedAttempt.result.overall_percentage}%`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <b>Date of Submission:</b>
                    <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                      {selectedAttempt.result.date_of_submission || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <b>Date of Evaluation:</b>
                    <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                      {selectedAttempt.result.date_of_evaluation || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <b>Feedback:</b>
                    <div
                      className="mt-1 p-2"
                      style={{
                        fontSize: "13px", whiteSpace: "pre-wrap",
                        background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef",
                      }}
                    >
                      {selectedAttempt.result.feedback || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Strengths:</b>
                    <div
                      className="mt-1 p-2"
                      style={{ background: "#f0fff4", borderRadius: "6px", border: "1px solid #d4edda" }}
                    >
                      {Array.isArray(selectedAttempt.result.strengths) && selectedAttempt.result.strengths.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {selectedAttempt.result.strengths.map((s, i) => (
                            <li key={i} style={{ fontSize: "13px", color: "#155724" }}>{s}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <b>To Improve:</b>
                    <div
                      className="mt-1 p-2"
                      style={{ background: "#fff8f0", borderRadius: "6px", border: "1px solid #fde8c8" }}
                    >
                      {Array.isArray(selectedAttempt.result.to_improve) && selectedAttempt.result.to_improve.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {selectedAttempt.result.to_improve.map((s, i) => (
                            <li key={i} style={{ fontSize: "13px", color: "#856404" }}>{s}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <hr />
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedAttempt(null); }}
              >
                Close
              </button>
            </div>

          </div>
        ) : (
          <p className="text-center text-muted py-4">No data available.</p>
        )}
      </Modal>
    </div>
  );
};

export default MainsTestsAttempts;