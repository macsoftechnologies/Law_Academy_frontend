import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";

import PrelimsForm from "../forms/PrelimsForm";

import {
  addPrelims,
  getPrelims,
  updatePrelims,
  deletePrelims,
  getPrelimsById,
  getSubCategories,
} from "../services/authService";

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Prelims = () => {
  const [open, setOpen]               = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [selectedPrelim, setSelectedPrelim]   = useState(null);
  const [prelimList, setPrelimList]           = useState([]);
  const [subcategoryNameMap, setSubcategoryNameMap] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [pageLimit, setPageLimit]     = useState(10);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await getSubCategories(1, 1000);
        const map = {};
        (res.data || []).forEach((s) => {
          map[s.subcategory_id] = s.title;
        });
        setSubcategoryNameMap(map);
      } catch (err) {
        setSubcategoryNameMap({});
      }
    };
    fetchSubcategories();
  }, []);

  const fetchPrelims = useCallback(
    async (page = 1, limit = pageLimit) => {
      try {
        const res = await getPrelims(page, limit);
        setPrelimList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch prelims", "error");
        setPrelimList([]);
        setTotalPages(1);
      }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchPrelims(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchPrelims]);

  const getSubcategoryTitle = (subcategory_id) => {
    if (Array.isArray(subcategory_id) && subcategory_id.length > 0) {
      const first = subcategory_id[0];
      if (typeof first === "object" && first !== null) return first.title || "-";
      return subcategoryNameMap[first] || first || "-";
    }
    if (typeof subcategory_id === "object" && subcategory_id !== null) {
      return subcategory_id.title || "-";
    }
    if (typeof subcategory_id === "string" && subcategory_id) {
      return subcategoryNameMap[subcategory_id] || subcategory_id;
    }
    return "-";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "2-digit",
    });
  };

  const handleView = async (item, index) => {
    setViewOpen(true);
    setViewLoading(true);
    setSelectedPrelim(null);
    try {
      const res = await getPrelimsById(item.prelimes_id);
      const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};
      setSelectedPrelim({ ...d, serial: (currentPage - 1) * pageLimit + index + 1 });
    } catch (err) {
      setSelectedPrelim({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (item, index) => {
    setSelectedPrelim({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This prelim will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deletePrelims({ prelimes_id: item.prelimes_id });
      fetchPrelims(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!", text: "Prelim removed successfully", icon: "success",
        toast: true, position: "top-end", timer: 4000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#8f1e1e", color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedPrelim && editOpen) {
        await updatePrelims(formData);
        setEditOpen(false);
        setSelectedPrelim(null);
        fetchPrelims(currentPage, pageLimit);
        Swal.fire({
          title: "Updated!", text: "Prelim updated successfully", icon: "success",
          toast: true, position: "top-end", timer: 5000,
          showConfirmButton: false, background: "#28a745", color: "#ffffff",
        });
        return;
      }

      await addPrelims(formData);
      setOpen(false);
      fetchPrelims(currentPage, pageLimit);
      Swal.fire({
        title: "Added!", text: "Prelim added successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, background: "#28a745", color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No",         accessor: "serial" },
    { header: "Title",        accessor: "title" },
    { header: "Sub Title",    accessor: "sub_title" },
    { header: "Sub Category", accessor: "subcategoryTitle" },
    { header: "Actions",      accessor: "actions" },
  ];

  const tableData = prelimList.map((item, index) => ({
    ...item,
    serial:           (currentPage - 1) * pageLimit + index + 1,
    subcategoryTitle: getSubcategoryTitle(item.subcategory_id),
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
      <div className="d-flex justify-content-between mb-3">
        <h2>PRELIMS LIST</h2>
        <div className="d-flex gap-2 align-items-center">
          <label style={{ color: "#2b377b" }}>Records per page:</label>
          <select
            style={{ border: "2px solid #872026", padding: "2px", cursor: "pointer" }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchPrelims(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Prelim" className="secondary" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ── Add Modal ── */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Prelim" size="lg">
        <PrelimsForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedPrelim(null); }}
        title="Edit Prelim"
        size="lg"
      >
        <PrelimsForm
          isEdit
          initialData={selectedPrelim}
          onClose={() => { setEditOpen(false); setSelectedPrelim(null); }}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedPrelim(null); }}
        title="Prelim Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Loading prelim details...</p>
          </div>
        ) : selectedPrelim ? (
          <div className="container">

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Title:</b>
                <div className="mt-1">{selectedPrelim.title || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>Sub Title:</b>
                <div className="mt-1">{selectedPrelim.sub_title || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Sub Category:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {getSubcategoryTitle(selectedPrelim.subcategory_id)}
                </div>
              </div>
              <div className="col-md-6">
                <b>Presentation Image:</b>
                {selectedPrelim.presentation_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedPrelim.presentation_image}`}
                      alt="Presentation"
                      style={{ maxHeight: "150px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-muted">No Image</p>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Created At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedPrelim.createdAt)}
                </div>
              </div>
              <div className="col-md-6">
                <b>Updated At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedPrelim.updatedAt)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>About Course:</b>
                <div
                  className="mt-2 p-2"
                  style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef", fontSize: "13px" }}
                >
                  {selectedPrelim.about_course || "N/A"}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>Course Points:</b>
                <div
                  className="mt-2 p-2"
                  style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}
                >
                  {Array.isArray(selectedPrelim.course_points) && selectedPrelim.course_points.length > 0 ? (
                    <ul className="mb-0 ps-3">
                      {selectedPrelim.course_points.map((point, idx) => (
                        <li key={idx} style={{ fontSize: "13px" }}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>Terms &amp; Conditions:</b>
                <div
                  className="mt-1 p-2"
                  style={{
                    fontSize: "13px", whiteSpace: "pre-wrap",
                    background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef",
                  }}
                >
                  {selectedPrelim.terms_conditions || "N/A"}
                </div>
              </div>
            </div>

            <hr />
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedPrelim(null); }}
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

export default Prelims;