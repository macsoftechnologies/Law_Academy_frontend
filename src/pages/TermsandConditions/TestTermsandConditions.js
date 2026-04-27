import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import Table from "../../components/Table";
// import Button from "../components/Button";
import Modal from "../../components/Modal";

import TestTermsandConditionsForm from "../../forms/TermsandConditions/TestTermsandConditionsForm";

import {
  addTestTerms,
  getTestTerms,
  updateTestTerms,
  deleteTestTerms,
} from "../../services/authService";

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../../components/CommonHeader";

const TestTermsandConditions = () => {
  const [open, setOpen]               = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);

  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termsList, setTermsList]       = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [pageLimit, setPageLimit]     = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTerms = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true);
      try {
        const res = await getTestTerms(page, limit);
        setTermsList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch test terms", "error");
        setTermsList([]);
        setTotalPages(1);
      }finally {
    setIsLoading(false);    
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchTerms(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchTerms]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "2-digit",
    });
  };

  // Truncate array or string for table preview
  const truncateList = (arr, maxChars = 60) => {
    if (!Array.isArray(arr) || arr.length === 0) return "N/A";
    const first = arr[0] || "";
    return first.length > maxChars ? first.slice(0, maxChars) + "..." : first;
  };

  const handleView = (item, index) => {
    setSelectedTerm({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    setViewOpen(true);
  };

  const handleEdit = (item, index) => {
    setSelectedTerm({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This test term record will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6c1e1e",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteTestTerms(item.test_term_id);
      fetchTerms(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!", text: "Test term removed successfully", icon: "success",
        toast: true, position: "top-end", timer: 4000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#6c1e1e", color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedTerm && editOpen) {
        await updateTestTerms(formData);
        setEditOpen(false);
        setSelectedTerm(null);
        fetchTerms(currentPage, pageLimit);
        Swal.fire({
          title: "Updated!", text: "Test term updated successfully", icon: "success",
          toast: true, position: "top-end", timer: 5000,
          showConfirmButton: false, background: "#28a745", color: "#ffffff",
        });
        return;
      }
      await addTestTerms(formData);
      setOpen(false);
      fetchTerms(currentPage, pageLimit);
      Swal.fire({
        title: "Added!", text: "Test term added successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, background: "#28a745", color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No",               accessor: "serial" },
    { header: "Test Type",          accessor: "testType" },
    { header: "Terms & Conditions", accessor: "termsPreview" },
    { header: "Instructions",       accessor: "instructionsPreview" },
    // { header: "Created At",         accessor: "createdAtFormatted" },
    { header: "Actions",            accessor: "actions" },
  ];

  const tableData = termsList.map((item, index) => ({
    ...item,
    serial:               (currentPage - 1) * pageLimit + index + 1,
    termsPreview:         truncateList(item.terms_conditions),
    instructionsPreview:  truncateList(item.instructions),
    // createdAtFormatted:   formatDate(item.createdAt),
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" onClick={() => handleView(item, index)}><FaEye /></button>
        <button className="icon-btn edit me-2" onClick={() => handleEdit(item, index)}><FaEdit /></button>
        <button className="icon-btn delete"    onClick={() => handleDelete(item)}><FaTrash /></button>
      </div>
    ),
  }));

  return (
    <div>
      <CommonHeader
        title="TEST TERMS & CONDITIONS"
        count={termsList.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        setCurrentPage={setCurrentPage}
        onChange={fetchTerms}
        buttonText="+ Add Test Term"
        buttonColor="secondary"
        onButtonClick={() => setOpen(true)}
      />

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* ── Add Modal ── */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Test Term" size="lg">
        <TestTermsandConditionsForm
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedTerm(null); }}
        title="Edit Test Term"
        size="lg"
      >
        <TestTermsandConditionsForm
          isEdit
          initialData={selectedTerm}
          onClose={() => { setEditOpen(false); setSelectedTerm(null); }}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedTerm(null); }}
        title="Test Term Details"
        size="lg"
      >
        {selectedTerm ? (
          <div className="container">

            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Test Type:</b>
                <div className="mt-1">{selectedTerm.testType || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>Created At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedTerm.createdAt)}
                </div>
              </div>
            </div>

            {/* Row 2 - Terms & Conditions */}
            <div className="row mb-3">
              <div className="col-md-12">
                <b>Terms &amp; Conditions:</b>
                <div
                  className="mt-2 p-2"
                  style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}
                >
                  {Array.isArray(selectedTerm.terms_conditions) && selectedTerm.terms_conditions.length > 0 ? (
                    <ul className="mb-0 ps-3">
                      {selectedTerm.terms_conditions.map((term, idx) => (
                        <li key={idx} style={{ fontSize: "13px", marginBottom: "6px" }}>{term}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3 - Instructions */}
            <div className="row mb-3">
              <div className="col-md-12">
                <b>Instructions:</b>
                <div
                  className="mt-2 p-2"
                  style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}
                >
                  {Array.isArray(selectedTerm.instructions) && selectedTerm.instructions.length > 0 ? (
                    <ol className="mb-0 ps-3">
                      {selectedTerm.instructions.map((inst, idx) => (
                        <li key={idx} style={{ fontSize: "13px", marginBottom: "6px" }}>{inst}</li>
                      ))}
                    </ol>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4 - Updated At */}
            {/* <div className="row mb-3">
              <div className="col-md-6">
                <b>Updated At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedTerm.updatedAt)}
                </div>
              </div>
            </div> */}

            <hr />
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedTerm(null); }}
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

export default TestTermsandConditions;