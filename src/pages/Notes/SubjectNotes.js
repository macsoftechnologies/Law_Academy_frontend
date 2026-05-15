import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import SubjectNotesForm from "../../forms/Notes/SubjectNotesForm";
import Swal from "sweetalert2";
import {
  getSubjectnotes,
  deleteSubjectnotes,
} from "../../services/authService";

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../../components/CommonHeader";

const SubjectNotes = () => {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const [isLoading, setIsLoading] = useState(false);

  // ───────────────── FETCH DATA ─────────────────
  const fetchData = useCallback(
  async (page = 1, limit = pageLimit) => {
    setIsLoading(true);

    try {
      const res = await getSubjectnotes(page, limit);

      let data = [];
      let pages = 1;

      if (res && Array.isArray(res.data)) {
        data = res.data;
        pages = res.totalPages || 1;
      } else if (Array.isArray(res)) {
        data = res;
      }

      // PLACE HERE
      const mappedData = data.map((item) => ({
        ...item,

        notes_name:
          item.notes_id?.[0]?.title || "—",

        subject_name:
          item.subjectId?.[0]?.title || "—",

        law_name:
          item.lawId?.[0]?.title || "—",
      }));

      setList(mappedData);
      setTotalPages(pages);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  },
  [pageLimit]
);

  // ───────────────── LOAD ─────────────────
  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  // ───────────────── VIEW ─────────────────
  const handleView = (item) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  // ───────────────── EDIT ─────────────────
  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  // ───────────────── DELETE ─────────────────
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This subject note will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteSubjectnotes({
        subject_notes_id: id,
      });

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Subject note deleted successfully",
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#8f1e1e",
      });

      fetchData(currentPage, pageLimit);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  // ───────────────── SUBMIT ─────────────────
  const handleSubmit = () => {
    fetchData(currentPage, pageLimit);

    setOpen(false);
    setEditOpen(false);

    setSelectedItem(null);
  };

  // ───────────────── TABLE COLUMNS ─────────────────
  const columns = [
    { header: "S.No", accessor: "sno" },

    { header: "Notes", accessor: "notes_name" },

    // NEW SUBJECT COLUMN
    { header: "Subject", accessor: "subject_name" },

    { header: "Law", accessor: "law_name" },

    { header: "Title", accessor: "title" },

    { header: "PDF URL", accessor: "pdf_url" },

    { header: "Actions", accessor: "actions" },
  ];

  // ───────────────── TABLE DATA ─────────────────
  const tableData = list.map((item, index) => ({
    ...item,

    sno:
      (currentPage - 1) * pageLimit +
      index +
      1,

    pdf_url: item.pdf_url ? (
      <a
        href={item.pdf_url}
        target="_blank"
        rel="noreferrer"
      >
        View File
      </a>
    ) : (
      "—"
    ),

    actions: (
      <div className="actions">
        {/* VIEW */}
        <button
          className="icon-btn view"
          onClick={() => handleView(item)}
        >
          <FaEye />
        </button>

        {/* EDIT */}
        <button
          className="icon-btn edit"
          onClick={() => handleEdit(item)}
        >
          <FaEdit />
        </button>

        {/* DELETE */}
        <button
          className="icon-btn delete"
          onClick={() =>
            handleDelete(item.subject_notes_id)
          }
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      {/* HEADER */}
      <CommonHeader
        title="Subject Notes"
        count={list.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) =>
          fetchData(page, limit)
        }
        buttonText="+ Add Subject Notes"
        buttonColor="secondary"
        onButtonClick={() => setOpen(true)}
      />

      {/* TABLE */}
      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* ───────────────── ADD MODAL ───────────────── */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Subject Notes"
        size="lg"
      >
        <SubjectNotesForm
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ───────────────── EDIT MODAL ───────────────── */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Subject Notes"
        size="lg"
      >
        <SubjectNotesForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ───────────────── VIEW MODAL ───────────────── */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Subject Notes Details"
        size="lg"
      >
        {selectedItem && (
          <div className="container">
            <div className="row">

              {/* NOTES */}
              <div className="col-md-6 mb-3">
                <b>Notes:</b>

                <p className="mt-1">
                  {selectedItem.notes_id?.[0]
                    ?.title || "—"}
                </p>
              </div>

              {/* SUBJECT */}
              <div className="col-md-6 mb-3">
                <b>Subject:</b>

                <p className="mt-1">
                  {selectedItem.subjectId?.[0]?.title || "—"}
                </p>
              </div>

              {/* LAW */}
              <div className="col-md-6 mb-3">
                <b>Law:</b>

                <p className="mt-1">
                  {selectedItem.lawId?.[0]?.title || "—"}
                </p>
              </div>

              {/* TITLE */}
              <div className="col-md-6 mb-3">
                <b>Title:</b>

                <p className="mt-1">
                  {selectedItem.title || "—"}
                </p>
              </div>

              {/* PDF FILE */}
              <div className="col-md-6 mb-3">
                <b>PDF File:</b>

                <p className="mt-1">
                  {selectedItem.pdf_url ? (
                    <a
                      href={selectedItem.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#872026",
                        fontWeight: "bold",
                      }}
                    >
                      View File
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {/* PRESENTATION IMAGE */}
              <div className="col-md-6 mb-3">
                <b>Presentation Image:</b>

                <br />

                {selectedItem.presentation_image ? (
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.presentation_image}`}
                    alt="Presentation"
                    className="img-fluid mt-2"
                    style={{
                      maxHeight: "200px",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <p>No Image</p>
                )}
              </div>

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubjectNotes;