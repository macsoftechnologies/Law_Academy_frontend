import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import CategoriesForm from "../forms/CategoriesForm";
import Swal from "sweetalert2";
import { getCategories, getCategoriesById, deleteCategories } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

function Categories() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async (page = 1, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const res = await getCategories(page, limit);
      let listData = [];
      let pages = 1;
      if (res && Array.isArray(res.data)) {
        listData = res.data;
        pages = res.totalPages || 1;
      } else if (Array.isArray(res)) {
        listData = res;
      }

      const transformed = listData.map((item) => ({
        categoryId: item.categoryId,
        category_name: item.category_name,
        tag_text: item.tag_text,
        presentation_file: item.presentation_file,
      }));

      setList(transformed);
      setTotalPages(pages);
    } catch (error) {
      console.error("Fetch error:", error);
      setList([]);
      setTotalPages(1);
    }finally {
    setIsLoading(false);    
  }
  }, [pageLimit]);

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const handleView = async (categoryId) => {
    try {
      const res = await getCategoriesById(categoryId);
      setSelectedItem({
        category_name: res.data.category_name,
        tag_text: res.data.tag_text,
        presentation_file: res.data.presentation_file,
      });
      setViewOpen(true);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to fetch details",
        "error"
      );
    }
  };

  const handleEdit = async (categoryId) => {
    try {
      const res = await getCategoriesById(categoryId);
      setSelectedItem({
        categoryId: res.data.categoryId,
        category_name: res.data.category_name,
        tag_text: res.data.tag_text,
        presentation_file: res.data.presentation_file,
      });
      setEditOpen(true);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to fetch edit details",
        "error"
      );
    }
  };

  const deleteItem = async (categoryId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#ff7a00",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteCategories({ categoryId });
      Swal.fire({
        title: "Deleted!",
        text: res.message || "Category deleted successfully",
        icon: "success",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#8f1e1e",
      });
      await fetchData(currentPage, pageLimit);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  const handleSubmit = async () => {
    await fetchData(currentPage, pageLimit);
    setSelectedItem(null);
    setOpen(false);
    setEditOpen(false);
  };

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Category Name", accessor: "category_name" },
    { header: "Tag Text", accessor: "tag_text" },
    { header: "Image", accessor: "presentation_file" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,
    // ✅ Show image in table
    presentation_file: item.presentation_file ? (
      <img
        src={`${process.env.REACT_APP_API_BASE_URL}/${item.presentation_file}`}
        alt="category"
        style={{
          height: "45px",
          width: "60px",
          objectFit: "cover",
          borderRadius: "6px",
          border: "1px solid #ddd",
        }}
      />
    ) : "N/A",
    actions: (
      <div className="actions">
        <button
          className="icon-btn view"
          title="View"
          onClick={() => handleView(item.categoryId)}
        >
          <FaEye />
        </button>
        <button
          className="icon-btn edit"
          title="Edit"
          onClick={() => handleEdit(item.categoryId)}
        >
          <FaEdit />
        </button>
        <button
          className="icon-btn delete"
          title="Delete"
          onClick={() => deleteItem(item.categoryId)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      {/* Header + Records per page */}
      <div className="d-flex justify-content-between mb-3">
        <h2>CATEGORIES LIST</h2>
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
          <Button text="+ Add Category" className="secondary" onClick={() => setOpen(true)} />
        </div>
      </div>

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
      <Modal open={open} onClose={() => setOpen(false)} title="Add Category" size="md">
        <CategoriesForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Category" size="md">
        <CategoriesForm
          onClose={() => setEditOpen(false)}
          initialData={selectedItem}
          isEdit
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Category Details" size="md">
        {selectedItem && (
          <div style={{ padding: "10px" }}>
            <p><b>Category Name:</b> {selectedItem.category_name}</p>
            <p><b>Tag Text:</b> {selectedItem.tag_text}</p>
            <p><b>Image:</b></p>
            {/* ✅ Show image in view modal */}
            {selectedItem.presentation_file ? (
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.presentation_file}`}
                alt="category"
                style={{
                  height: "150px",
                  width: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginTop: "6px",
                }}
              />
            ) : (
              <span>N/A</span>
            )}
            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Categories;