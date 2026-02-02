import React, { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import SubCategoriesForm from "../forms/SubCategoriesForm";
import Swal from "sweetalert2";
import { getSubCategories, deleteSubCategories } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const SubCategories = () => {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetchData = useCallback(async (page = 1, limit = pageLimit) => {
    try {
      const res = await getSubCategories(page, limit);
      setList(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setList([]);
      setTotalPages(1);
      Swal.fire("Error", "Failed to fetch subcategories", "error");
    }
  }, [pageLimit]);

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const handleView = (id) => {
    const item = list.find((row) => row.subcategory_id === id);
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleEdit = (id) => {
    const item = list.find((row) => row.subcategory_id === id);
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This sub category will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteSubCategories({ subcategory_id: id });
      Swal.fire({
        title: "Deleted!",
        text: res.message || "Sub Category deleted successfully",
        icon: "success",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
        timer: 6000,
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

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Title", accessor: "title" },
    { header: "Category", accessor: "category_name" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,
    category_name: item.categoryId?.[0]?.category_name || "—",
    actions: (
      <div className="actions">
        <button className="icon-btn view" onClick={() => handleView(item.subcategory_id)}>
          <FaEye />
        </button>
        <button className="icon-btn edit" onClick={() => handleEdit(item.subcategory_id)}>
          <FaEdit />
        </button>
        <button className="icon-btn delete" onClick={() => handleDelete(item.subcategory_id)}>
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h2>SUB CATEGORIES</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
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
          <Button text="+ Add SubCategory" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add SubCategory" size="lg">
        <SubCategoriesForm onClose={() => setOpen(false)} onSubmit={fetchData} />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit SubCategory" size="lg">
        <SubCategoriesForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={fetchData}
        />
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="SubCategory Details" size="lg">
        {selectedItem && (
          <div className="container">
            <div className="row mb-2">
              <div className="col-md-6">
                <b>Title:</b> {selectedItem.title}
              </div>
              <div className="col-md-6">
                <b>Category:</b> {selectedItem.categoryId?.[0]?.category_name || "—"}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-12">
                <b>About Course:</b> {selectedItem.about_course}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-12">
                <b>Terms & Conditions:</b> {selectedItem.terms_conditions}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-6">
                <b>Presentation Image:</b>
                {selectedItem.presentation_image ? (
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.presentation_image}`}
                    alt="presentation"
                    className="img-fluid mt-2"
                    style={{ maxHeight: "150px" }}
                  />
                ) : (
                  <span className="ms-2">No Image</span>
                )}
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default SubCategories;
