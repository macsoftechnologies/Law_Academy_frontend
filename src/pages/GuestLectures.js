import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import GuestLecturesForm from "../forms/GuestLecturesForm";
import {
  getGusestLectures,
  addGuestLectures,
  updateGuestLectures,
  deleteGuestLectures,
  getGuestLecturesById,
} from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const GuestLectures = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureList, setLectureList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLectureList = useCallback(async (page = 1, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const res = await getGusestLectures(page, limit);
      setLectureList(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch guest lectures", "error");
    }finally {
    setIsLoading(false);    
  }
  }, [pageLimit]);

  useEffect(() => {
    fetchLectureList(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchLectureList]);

  const handleView = async (item) => {
    try {
      const res = await getGuestLecturesById(item.guest_lecture_id);
      setSelectedLecture(res.data || {});
      setViewOpen(true);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch lecture details", "error");
    }
  };

  const handleEdit = (item, index) => {
    setSelectedLecture({
      ...item,
      serial: (currentPage - 1) * pageLimit + index + 1,
    });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This lecture will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteGuestLectures({ guest_lecture_id: item.guest_lecture_id });
      fetchLectureList(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!",
        text: "Lecture removed successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 6000,
        showConfirmButton: false,
        color: "#ffffff",
        background: "#8f1e1e",
      });
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedLecture && editOpen) {
        formData.append("guest_lecture_id", selectedLecture.guest_lecture_id);
        await updateGuestLectures(formData);
        fetchLectureList(currentPage, pageLimit);
        setEditOpen(false);
        setSelectedLecture(null);
        Swal.fire({
          title: "Updated!",
          text: "Lecture updated successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 6000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: "#35a542",
          color: "#ffffff",
        });
        return;
      }

      await addGuestLectures(formData);
      fetchLectureList(currentPage, pageLimit);
      setOpen(false);
      Swal.fire({
        title: "Added!",
        text: "Lecture added successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 6000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#35a542",
        color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "serial" },
    { header: "Title", accessor: "title" },
    { header: "Author", accessor: "author" },
    { header: "Duration", accessor: "duration" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = lectureList.map((item, index) => ({
    ...item,
    serial: (currentPage - 1) * pageLimit + index + 1,
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" onClick={() => handleView(item)}>
          <FaEye />
        </button>
        <button className="icon-btn edit me-2" onClick={() => handleEdit(item, index)}>
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
        <h2>GUEST LECTURES</h2>
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
              fetchLectureList(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Lecture" className="secondary" onClick={() => setOpen(true)} />
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

      <Modal open={open} onClose={() => setOpen(false)} title="Add Lecture" size="lg">
        <GuestLecturesForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lecture" size="lg">
        <GuestLecturesForm
          onClose={() => setEditOpen(false)}
          initialData={selectedLecture}
          isEdit={true}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Lecture Details" size="lg">
        {selectedLecture ? (
          <div className="container">
            <div className="row mb-2">
              <div className="col-md-6">
                <b>Title:</b> {selectedLecture.title}
              </div>
              <div className="col-md-6">
                <b>Author:</b> {selectedLecture.author}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-6">
                <b>Duration:</b> {selectedLecture.duration}
              </div>
              <div className="col-md-6">
                <b>Video URL:</b>{" "}
                {selectedLecture.video_url ? (
                  <a href={selectedLecture.video_url} target="_blank" rel="noopener noreferrer" className="ms-1">
                    View Video
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-12">
                <b>About Class:</b>
                <div>{selectedLecture.about_class || "N/A"}</div>
              </div>
              <div className="col-md-12">
                <b>About Lecture:</b>
                <div>{selectedLecture.about_lecture || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <hr />
                <b>Presentation Image:</b>
                {selectedLecture.presentation_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedLecture.presentation_image}`}
                      alt="Presentation"
                      style={{ maxHeight: "200px", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1">No Image Available</p>
                )}
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
};

export default GuestLectures;
