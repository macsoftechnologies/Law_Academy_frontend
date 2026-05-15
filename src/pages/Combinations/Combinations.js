import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import CombinationsForm from "../../forms/Combinations/CombinationsForm";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  getCombinations,
  deleteCombinations,
} from "../../services/authService";

import { FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../../components/CommonHeader";

const Combinations = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
        const res = await getCombinations(page, limit);

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

  // ───────────────── ROW CLICK → PROFILE ─────────────────
  const handleRowClick = (item) => {
    navigate(`/combination/${item.combo_id}`);
  };

  // ───────────────── EDIT ─────────────────
  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  // ───────────────── DELETE ─────────────────
  const handleDelete = async (combo_id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This combination will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteCombinations(combo_id);

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Combination deleted successfully",
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
    { header: "S.No",        accessor: "sno"           },
    { header: "Title",       accessor: "title"         },
    { header: "Category",    accessor: "category_name" },
    { header: "Sub Category",accessor: "subcategory_name" },
    { header: "Lectures",    accessor: "lectures_flag" },
    { header: "Notes",       accessor: "notes_flag"    },
    { header: "Prelims",     accessor: "prelims_flag"  },
    { header: "Mains",       accessor: "mains_flag"    },
    { header: "Status",      accessor: "status_badge"  },
    { header: "Actions",     accessor: "actions"       },
  ];

  // ───────────────── TABLE DATA ─────────────────
  const tableData = list.map((item, index) => ({
    ...item,
    _rowonClick: () => handleRowClick(item),

    sno: (currentPage - 1) * pageLimit + index + 1,

    category_name:
      item.categoryId?.category_name || item.category?.category_name || "-",

    subcategory_name:
      item.subcategory_id?.title || item.subcategory?.title || "-",

    lectures_flag: item.includes_lectures ? (
      <span className="badge bg-success">Yes</span>
    ) : (
      <span className="badge bg-secondary">No</span>
    ),

    notes_flag: item.includes_notes ? (
      <span className="badge bg-success">Yes</span>
    ) : (
      <span className="badge bg-secondary">No</span>
    ),

    prelims_flag: item.includes_prelimes ? (
      <span className="badge bg-success">Yes</span>
    ) : (
      <span className="badge bg-secondary">No</span>
    ),

    mains_flag: item.includes_mains ? (
      <span className="badge bg-success">Yes</span>
    ) : (
      <span className="badge bg-secondary">No</span>
    ),

    status_badge: item.isActive ? (
      <span className="badge bg-success">Active</span>
    ) : (
      <span className="badge bg-danger">Inactive</span>
    ),

    actions: (
      <div
        className="actions"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* EDIT */}
        <button
          className="icon-btn edit"
          onClick={() => handleEdit(item)}
          title="Edit"
        >
          <FaEdit />
        </button>

        {/* DELETE */}
        <button
          className="icon-btn delete"
          onClick={() => handleDelete(item.combo_id)}
          title="Delete"
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
        title="Combinations"
        count={list.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => fetchData(page, limit)}
        buttonText="+ Add Combination"
        buttonColor="secondary"
        onButtonClick={() => setOpen(true)}
        infoText="💡 Click on any row to view combination details"
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
        title="Add Combination"
        size="xl"
      >
        <CombinationsForm
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ───────────────── EDIT MODAL ───────────────── */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Combination"
        size="lg"
      >
        <CombinationsForm
          isEdit
          initialData={selectedItem}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default Combinations;