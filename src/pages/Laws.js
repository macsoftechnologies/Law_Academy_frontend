import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import LawForm from "../forms/LawForm";
import Swal from "sweetalert2";
import { getLaws, deleteLaws } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Laws = () => {
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
        const res = await getLaws(page, limit);

        let data = [];
        let pages = 1;

        if (res && Array.isArray(res.data)) {
          data = res.data;
          pages = res.totalPages || 1;
        }
        const mappedData = data.map((item) => ({
          ...item,
          category_name: item.categoryId?.[0]?.category_name || "—",
          subcategory_name: item.subcategory_id?.[0]?.title || "—",
        }));

        setList(mappedData);
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch laws", "error");
      }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const handleView = (id) => {
    const item = list.find((row) => row.lawId === id);
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleEdit = (id) => {
    const item = list.find((row) => row.lawId === id);
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This law will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteLaws({ lawId: id });

      Swal.fire({
        toast: true,
        icon: "success",
        title: res.message || "Law deleted successfully",
        position: "top-end",
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#8f1e1e",
      });

      fetchData(currentPage, pageLimit);
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Title", accessor: "title" },
    { header: "Category", accessor: "category_name" },
    { header: "Subcategory", accessor: "subcategory_name" },
    { header: "Image", accessor: "law_image" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    sno: index + 1,
    law_image: item.law_image ? (
      <img
        src={`${process.env.REACT_APP_API_BASE_URL}/${item.law_image}`}
        alt="law"
        style={{ height: "50px", objectFit: "cover" }}
      />
    ) : "—",
    actions: (
      <div className="actions">
        <button className="icon-btn view" onClick={() => handleView(item.lawId)}>
          <FaEye />
        </button>
        <button className="icon-btn edit" onClick={() => handleEdit(item.lawId)}>
          <FaEdit />
        </button>
        <button
          className="icon-btn delete"
          onClick={() => handleDelete(item.lawId)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h2>LAWS</h2>
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
          <Button text="+ Add Law" onClick={() => setOpen(true)} />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Law" size="lg">
        <LawForm onClose={() => setOpen(false)} onSubmit={fetchData} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Law" size="lg">
        <LawForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={fetchData}
        />
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Law Details" size="lg">
        {selectedItem && (
          <div className="container">
            <p><b>Title:</b> {selectedItem.title}</p>
            <p><b>Category:</b> {selectedItem.category_name}</p>
            <p><b>Subcategory:</b> {selectedItem.subcategory_name}</p>
            <b>Law Image:</b>
            {selectedItem.law_image && (
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.law_image}`}
                alt="law"
                className="img-fluid mt-2"
                style={{ maxHeight: "200px", borderRadius: "8px" }}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Laws;
