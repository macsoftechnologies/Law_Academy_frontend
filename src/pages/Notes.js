import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import NotesForm from "../forms/NotesForm";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import {
  addNotes,
  getNotes,
  getNotesById,
  updateNotes,
  deleteNotes,
  getSubCategories,
} from "../services/authService";

function Notes() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notesList, setNotesList] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const userId =
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.userId ||
    "";

  const fetchNotes = useCallback(
    async (page = 1, limit = pageLimit) => {
       setIsLoading(true);
      try {
        const res = await getNotes(page, limit);
        console.log("Notes API response:", res);
        setNotesList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch notes", "error");
      }finally {
    setIsLoading(false);    
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchNotes(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchNotes]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await getSubCategories(1, 1000);
        setSubcategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch subcategories", err);
      }
    };
    fetchSubCategories();
  }, []);

  const getSubCategoryName = (subcategory_id) =>
    subcategories.find((s) => s.subcategory_id === subcategory_id)?.title || "N/A";

  const handleView = async (item) => {
    setViewOpen(true);
    setViewLoading(true);
    setSelectedNote(null);
    try {
      const res = await getNotesById(item.notes_id);
      setSelectedNote(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch note details", "error");
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedNote(item);
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteNotes(item.notes_id);
      fetchNotes(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!",
        text: "Note removed successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        color: "#ffffff",
        background: "#8f1e1e",
      });
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editOpen && selectedNote) {
        await updateNotes(formData);
        setEditOpen(false);
        setSelectedNote(null);
        Swal.fire({
          title: "Updated!",
          text: "Note updated successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 4000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: "#35a542",
          color: "#ffffff",
        });
      } else {
        await addNotes(formData);
        setOpen(false);
        Swal.fire({
          title: "Added!",
          text: "Note added successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 4000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: "#35a542",
          color: "#ffffff",
        });
      }
      fetchNotes(currentPage, pageLimit);
    } catch (err) {
      throw err;
    }
  };

  const renderAboutBook = (aboutBook) => {
    if (!aboutBook) return <p className="text-muted">N/A</p>;
    let parsed = aboutBook;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return <p>{aboutBook}</p>;
      }
    }
    return (
      <div>
        {parsed.description && (
          <p className="mb-2 text-muted" style={{ fontSize: "14px" }}>
            {parsed.description}
          </p>
        )}
        {parsed.sections &&
          parsed.sections.map((sec, i) => (
            <div key={i} className="mb-3">
              <strong style={{ color: "#872026" }}>{sec.title}</strong>
              <ul className="mt-1 mb-0" style={{ fontSize: "13px" }}>
                {sec.topics && sec.topics.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
            </div>
          ))}
      </div>
    );
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-IN") : "N/A";

  const formatRemainingDuration = (days) => {
    if (days === null || days === undefined) return <span className="text-muted">N/A</span>;
    if (days <= 0) return <span className="badge bg-danger">Expired</span>;
    if (days <= 30) return <span className="badge bg-warning text-dark">{days}d left</span>;
    return <span className="badge bg-success">{days}d left</span>;
  };

  const columns = [
    { header: "S.No",         accessor: "serial" },
    { header: "Title",        accessor: "title" },
    { header: "Sub Title",    accessor: "sub_title" },
    { header: "Sub Category", accessor: "subCategoryName" },
    { header: "Actions",      accessor: "actions" },
  ];

  const tableData = notesList.map((item, index) => ({
    ...item,
    serial: (currentPage - 1) * pageLimit + index + 1,

    imagePreview: item.presentation_image ? (
      <img
        src={`${process.env.REACT_APP_API_BASE_URL}/${item.presentation_image}`}
        alt="presentation"
        style={{ height: "45px", borderRadius: "5px", border: "1px solid #ddd" }}
      />
    ) : (
      <span className="text-muted" style={{ fontSize: "12px" }}>No Image</span>
    ),

    subCategoryName: (
      <span style={{ fontSize: "13px", color: "#555" }}>
        {getSubCategoryName(item.subcategory_id)}
      </span>
    ),

    printAvail: item.isPrintAvail ? (
      <span className="badge bg-success">Yes</span>
    ) : (
      <span className="badge bg-secondary">No</span>
    ),

    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" onClick={() => handleView(item)}>
          <FaEye />
        </button>
        <button className="icon-btn edit me-2" onClick={() => handleEdit(item)}>
          <FaEdit />
        </button>
        <button className="icon-btn delete" onClick={() => handleDelete(item)}>
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>NOTES LIST</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
            style={{ border: "2px solid #872026", padding: "2px", cursor: "pointer" }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchNotes(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Notes" className="secondary" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Notes" size="lg">
        <NotesForm
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          userId={userId}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedNote(null); }}
        title="Edit Notes"
        size="lg"
      >
        <NotesForm
          onClose={() => { setEditOpen(false); setSelectedNote(null); }}
          initialData={selectedNote}
          isEdit={true}
          onSubmit={handleSubmit}
          userId={userId}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedNote(null); }}
        title="Note Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Loading note details...</p>
          </div>
        ) : selectedNote ? (
          <div className="container">

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Title:</b>
                <div className="mt-1">{selectedNote.title || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>Sub Title:</b>
                <div className="mt-1">{selectedNote.sub_title || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Print Available:</b>
                <div className="mt-1">
                  {selectedNote.isPrintAvail ? (
                    <span className="badge bg-success">Yes</span>
                  ) : (
                    <span className="badge bg-secondary">No</span>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <b>Sub Category Name:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {getSubCategoryName(selectedNote.subcategory_id)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Enrolled:</b>
                <div className="mt-1">
                  {selectedNote.isEnrolled ? (
                    <span className="badge bg-primary">Enrolled</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Not Enrolled</span>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <b>Remaining Duration:</b>
                <div className="mt-1">
                  {formatRemainingDuration(selectedNote.remaining_duration)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Enroll Date:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedNote.enroll_date ? formatDate(selectedNote.enroll_date) : "N/A"}
                </div>
              </div>
              <div className="col-md-6">
                <b>Expiry Date:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {selectedNote.expiry_date ? formatDate(selectedNote.expiry_date) : "N/A"}
                </div>
              </div>
            </div>

            {/* <div className="row mb-3">
              <div className="col-md-6">
                <b>Created At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedNote.createdAt)}
                </div>
              </div>
              <div className="col-md-6">
                <b>Updated At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedNote.updatedAt)}
                </div>
              </div>
            </div> */}

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Presentation Image:</b>
                {selectedNote.presentation_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedNote.presentation_image}`}
                      alt="Presentation"
                      style={{ maxHeight: "150px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-muted">No Image</p>
                )}
              </div>
              <div className="col-md-6">
                <b>Print Notes Image:</b>
                {selectedNote.printNotes_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedNote.printNotes_image}`}
                      alt="Print Notes"
                      style={{ maxHeight: "150px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-muted">No Image</p>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>About Book:</b>
                <div
                  className="mt-2 p-2"
                  style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}
                >
                  {renderAboutBook(selectedNote.about_book)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>Terms &amp; Conditions:</b>
                <div
                  className="mt-1 p-2"
                  style={{
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  {selectedNote.terms_conditions || "N/A"}
                </div>
              </div>
            </div>

            <hr />
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedNote(null); }}
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
}

export default Notes;