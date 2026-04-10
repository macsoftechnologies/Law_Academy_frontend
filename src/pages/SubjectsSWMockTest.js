import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
// import Button from "../components/Button";
import Modal from "../components/Modal";
import SubjectsSWMockTestForm from "../forms/SubjectsSWMockTestForm";
import Swal from "sweetalert2";
import { getMockTestSubject, deleteMockTestSubject, getMockTestSubjectById } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../components/CommonHeader";

const SubjectsSWMockTest = () => {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [viewLoading, setViewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true);
      try {
        const res = await getMockTestSubject(page, limit);
        console.log("MockTestSubject API response:", res);

        let data = [];
        let pages = 1;

        if (res && Array.isArray(res.data)) {
          data = res.data;
          pages = res.totalPages || 1;
        } else if (Array.isArray(res)) {
          data = res;
        }

        setList(data);
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
        setList([]);
        setTotalPages(1);
        Swal.fire("Error", "Failed to fetch mock test subjects", "error");
      }finally {
    setIsLoading(false);    
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const handleView = async (item) => {
    setViewOpen(true);
    setSelectedItem(null);
    setViewLoading(true);
    try {
      const res = await getMockTestSubjectById(item.mocktest_subject_id);
      // API returns { data: [...], message, statusCode }
      // data is an array — pick first item
      const detail = Array.isArray(res.data) ? res.data[0] : res.data || res;
      setSelectedItem(detail);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch details", "error");
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This mock test subject will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteMockTestSubject({ mocktest_subject_id: id });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "Mock test subject deleted successfully",
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#8f1e1e",
      });
      fetchData(currentPage, pageLimit);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
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
    { header: "Title", accessor: "title" },
    { header: "No. of Questions", accessor: "no_of_qos" },
    { header: "Duration (mins)", accessor: "duration" },
    { header: "Image", accessor: "presentation_image" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,
    presentation_image: item.presentation_image ? (
      <img
        src={`${process.env.REACT_APP_API_BASE_URL}/${item.presentation_image}`}
        alt="mock test subject"
        style={{ height: "50px", width: "50px", objectFit: "cover", borderRadius: "4px" }}
      />
    ) : (
      "—"
    ),
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
          onClick={() => handleDelete(item.mocktest_subject_id)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
     <CommonHeader
      title="Mock Test Subjects"
      count={list.length}
      totalPages={totalPages}
      pageLimit={pageLimit}
      setPageLimit={(limit) => {
        setPageLimit(limit);
        setCurrentPage(1);
        fetchData(1, limit);
      }}
      setCurrentPage={setCurrentPage}
      onChange={(page, limit) => fetchData(page, limit)}
      buttonText="+ Add Mock Test Subject"
      buttonColor="primary"
      onButtonClick={() => setOpen(true)}
    />

      {/* Table */}
      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Mock Test Subject" size="lg">
        <SubjectsSWMockTestForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Mock Test Subject" size="lg">
        <SubjectsSWMockTestForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedItem(null);
        }}
        title="Mock Test Subject Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-2">Loading details...</p>
          </div>
        ) : selectedItem ? (
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <p>
                  <b>Title:</b> {selectedItem.title || "—"}
                </p>
                <p>
                  <b>No. of Questions:</b> {selectedItem.no_of_qos || "—"}
                </p>
                <p>
                  <b>Duration (mins):</b> {selectedItem.duration || "—"}
                </p>
                <p>
                  <b>Prelims:</b> {selectedItem.prelimes?.title || selectedItem.prelimes_id || "—"}
                </p>
                <p>
                  <b>Law:</b> {selectedItem.law?.title || selectedItem.lawId || "—"}
                </p>
                <p>
                  <b>Course:</b> {selectedItem.course?.title || "—"}
                </p>
              </div>
              <div className="col-md-6">
                <b>Presentation Image:</b>
                {selectedItem.presentation_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.presentation_image}`}
                      className="img-fluid"
                      style={{
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                      alt="mock test subject"
                    />
                  </div>
                ) : (
                  <p className="mt-1">No Image</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default SubjectsSWMockTest;