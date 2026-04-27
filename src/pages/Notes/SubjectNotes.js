import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
// import Button from "../components/Button";
import Modal from "../../components/Modal";
import SubjectNotesForm from "../../forms/Notes/SubjectNotesForm";
import Swal from "sweetalert2";
import { getSubjectnotes, deleteSubjectnotes } from "../../services/authService";
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

        const mappedData = data.map((item) => ({
          ...item,
          // lawId is an array in API response
          law_name: item.lawId?.[0]?.title || "—",
          notes_name: item.notes_id?.[0]?.title || "—",
        }));

        setList(mappedData);
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
        setList([]);
        setTotalPages(1);
        Swal.fire("Error", "Failed to fetch subject notes", "error");
      }finally {
    setIsLoading(false);    
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const handleView = (item) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

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
      await deleteSubjectnotes({ subject_notes_id: id });

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

  const handleSubmit = () => {
    fetchData(currentPage, pageLimit);
    setOpen(false);
    setEditOpen(false);
    setSelectedItem(null);
  };

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Notes", accessor: "notes_name" },
    { header: "Law", accessor: "law_name" },
    { header: "Title", accessor: "title" },
    { header: "PDF URL", accessor: "pdf_url" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,
    pdf_url: item.pdf_url ? (
      <a href={item.pdf_url} target="_blank" rel="noreferrer">
        View File
      </a>
    ) : "—",
    actions: (
      <div className="actions">
        <button className="icon-btn view" onClick={() => handleView(item)}>
          <FaEye />
        </button>
        <button className="icon-btn edit" onClick={() => handleEdit(item)}>
          <FaEdit />
        </button>
        <button
          className="icon-btn delete"
          onClick={() => handleDelete(item.subject_notes_id)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <CommonHeader
      title="Subject Notes"
      count={list.length}
      totalPages={totalPages}
      pageLimit={pageLimit}
      setPageLimit={setPageLimit}
      setCurrentPage={setCurrentPage}
      onChange={(page, limit) => fetchData(page, limit)}
      buttonText="+ Add Subject Notes"
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

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Subject Notes" size="lg">
        <SubjectNotesForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Subject Notes" size="lg">
        <SubjectNotesForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Subject Notes Details" size="lg">
        {selectedItem && (
          <div className="container">
            <div className="row">

              {/* Notes */}
              <div className="col-md-6 mb-3">
                <b>Notes:</b>
                <p className="mt-1">{selectedItem.notes_id?.[0]?.title || "—"}</p>
              </div>

              {/* Law */}
              <div className="col-md-6 mb-3">
                <b>Law:</b>
                <p className="mt-1">{selectedItem.lawId?.[0]?.title || "—"}</p>
              </div>

              {/* Title */}
              <div className="col-md-6 mb-3">
                <b>Title:</b>
                <p className="mt-1">{selectedItem.title || "—"}</p>
              </div>

              {/* PDF File */}
              <div className="col-md-6 mb-3">
                <b>PDF File:</b>
                <p className="mt-1">
                  {selectedItem.pdf_url ? (
                    <a
                      href={selectedItem.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#872026", fontWeight: "bold" }}
                    >
                      View File
                    </a>
                  ) : "—"}
                </p>
              </div>

              {/* Presentation Image */}
              <div className="col-md-6 mb-3">
                <b>Presentation Image:</b>
                <br />
                {selectedItem.presentation_image ? (
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.presentation_image}`}
                    alt="Presentation"
                    className="img-fluid mt-2"
                    style={{ maxHeight: "200px", borderRadius: "8px" }}
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