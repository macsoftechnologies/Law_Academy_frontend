import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
// import Button from "../components/Button";
import Modal from "../components/Modal";
import SubjectForm from "../forms/SubjectForm";
import Swal from "sweetalert2";
import { getSubjects, deleteSubjects } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../components/CommonHeader";

const Subjects = () => {
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
        const res = await getSubjects(page, limit);
        console.log("Subjects API response:", res);

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
          law_title: item.law_id?.[0]?.title || "—",
          category_name: item.categoryId?.[0]?.category_name || "—",
          subcategory_name: item.subcategory_id?.[0]?.title || "—",
        }));

        setList(mappedData);
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
        setList([]);
        setTotalPages(1);
        Swal.fire("Error", "Failed to fetch subjects", "error");
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
      text: "This subject will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteSubjects({ subjectId: id });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "Subject deleted successfully",
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
    { header: "Law Title", accessor: "law_title" },
    { header: "Category", accessor: "category_name" },
    { header: "Subcategory", accessor: "subcategory_name" },
    { header: "Image", accessor: "subject_image" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: index + 1,
    subject_image: item.subject_image ? (
      <img
        src={`${process.env.REACT_APP_API_BASE_URL}/${item.subject_image}`}
        alt="subject"
        style={{ height: "50px", width: "50px", objectFit: "cover" }}
      />
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
          onClick={() => handleDelete(item.subjectId)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
        <CommonHeader
        title="SUBJECTS"
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
        buttonText="+ Add Subject"
        buttonColor="orange"
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
      <Modal open={open} onClose={() => setOpen(false)} title="Add Subject" size="lg">
        <SubjectForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Subject" size="lg">
        <SubjectForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Subject Details" size="lg">
        {selectedItem && (
          <div className="container">
            <p>
              <b>Title:</b> {selectedItem.title}
            </p>
            <p>
              <b>Law Title:</b> {selectedItem.law_title}
            </p>
            <p>
              <b>Category:</b> {selectedItem.category_name}
            </p>
            <p>
              <b>Subcategory:</b> {selectedItem.subcategory_name}
            </p>
            <b>Subject Image:</b>
            {selectedItem.subject_image ? (
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.subject_image}`}
                className="img-fluid mt-2"
                style={{ maxHeight: "200px", borderRadius: "8px" }}
                alt="subject"
              />
            ) : (
              <p>No Image</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Subjects;
