import React, { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import LecturesForm from "../forms/LecturesForm";
import Swal from "sweetalert2";
import { getLectures, deleteLectures } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Lectures = () => {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetchData = useCallback(
    async (page = 1, limit = pageLimit) => {
      try {
        const res = await getLectures(page, limit);
        setList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch lectures", "error");
      }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Lecture will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteLectures({ lectureId: id });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Deleted successfully",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#8f1e1e",
      });
      fetchData(currentPage, pageLimit);
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Title", accessor: "title" },
    { header: "Subject Title", accessor: "subject_title" },
    { header: "Law Title", accessor: "law_title" },
    { header: "Category", accessor: "category_name" },
    { header: "Subcategory", accessor: "subcategory_name" },
    { header: "Author", accessor: "author" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,
    title: item.title || "-",
    subject_title: item.subjectId?.[0]?.title || "-",
    law_title: item.lawId?.[0]?.title || "-",
    category_name: item.categoryId?.[0]?.category_name || "-",
    subcategory_name: item.subcategory_id?.[0]?.title || "-",
    author: item.author || "-",
    actions: (
      <div className="actions">
        <button
          className="icon-btn view"
          onClick={() => {
            setSelectedItem(item);
            setViewOpen(true);
          }}
        >
          <FaEye />
        </button>
        <button
          className="icon-btn edit"
          onClick={() => {
            setSelectedItem(item);
            setEditOpen(true);
          }}
        >
          <FaEdit />
        </button>
        <button
          className="icon-btn delete"
          onClick={() => handleDelete(item.lectureId)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Lectures</h4>
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
              fetchData(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Lecture" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Lecture" size="lg">
        <LecturesForm
          onClose={() => setOpen(false)}
          onSubmit={() => fetchData(currentPage, pageLimit)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lecture" size="lg">
        <LecturesForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={() => fetchData(currentPage, pageLimit)}
        />
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Lecture Details" size="lg">
        {selectedItem && (
          <div className="container">
            <div className="row mb-2">
              <div className="col-md-6"><strong>Title:</strong> {selectedItem.title}</div>
              <div className="col-md-6"><strong>Subject:</strong> {selectedItem.subjectId?.[0]?.title}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><strong>Law:</strong> {selectedItem.lawId?.[0]?.title}</div>
              <div className="col-md-6"><strong>Category:</strong> {selectedItem.categoryId?.[0]?.category_name}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><strong>Subcategory:</strong> {selectedItem.subcategory_id?.[0]?.title}</div>
              <div className="col-md-6"><strong>Author:</strong> {selectedItem.author}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><strong>Lecture No:</strong> {selectedItem.lecture_no}</div>
            </div>
            <div className="row mb-2">
              <div className="col-12"><strong>Description:</strong> {selectedItem.description}</div>
            </div>

            <div className="row mb-2">
              <div className="col-12">
                <hr />
                <strong>Resources:</strong>
                <ul>
                  {selectedItem.video_url && (
                    <li>
                      <b>Video:</b>{" "}
                      <a href={selectedItem.video_url} target="_blank" rel="noopener noreferrer">
                        View Video
                      </a>
                    </li>
                  )}
                  {selectedItem.thumbnail_image_url && (
                    <li>
                      <b>Thumbnail:</b>{" "}
                      <a href={selectedItem.thumbnail_image_url} target="_blank" rel="noopener noreferrer">
                        View Image
                      </a>
                    </li>
                  )}
                  {selectedItem.notes_pdf_url && (
                    <li>
                      <b>Notes PDF:</b>{" "}
                      <a href={selectedItem.notes_pdf_url} target="_blank" rel="noopener noreferrer">
                        View PDF
                      </a>
                    </li>
                  )}
                  {!selectedItem.video_url && !selectedItem.thumbnail_image_url && !selectedItem.notes_pdf_url && (
                    <p>No resources available</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Lectures;
