import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PlansForm from "../forms/PlansForm";
import {
  addPlans,
  getPlans,
  updatePlans,
  deletePlans,
} from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Plans = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetchPlans = useCallback(async (page = 1, limit = pageLimit) => {
    try {
      const res = await getPlans(page, limit);
      setPlansList(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      Swal.fire("Error", "Failed to fetch plans", "error");
    }
  }, [pageLimit]);

  useEffect(() => {
    fetchPlans(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchPlans]);

  const handleView = (item) => {
  setSelectedPlan(item);
  setViewOpen(true);
};

  const handleEdit = (item) => {
    setSelectedPlan(item);
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This plan will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await deletePlans(item.planId);
      fetchPlans(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!",
        text: "Plan deleted successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        color: "#ffffff",
        background: "#8f1e1e",
      });
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editOpen) {
        await updatePlans(formData);
        setEditOpen(false);
        Swal.fire({
          title: "Updated!",
          text: "Plan updated successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 4000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: "#35a542",
          color: "#ffffff",
        });
      } else {
        await addPlans(formData);
        setOpen(false);
        Swal.fire({
          title: "Added!",
          text: "Plan added successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 4000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: "#35a542",
          color: "#ffffff",
        });
      }
      fetchPlans(currentPage, pageLimit);
    } catch {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "serial" },
    { header: "Course Type", accessor: "course_type" },
    { header: "Course Title", accessor: "courseTitle" },
    { header: "Original Price", accessor: "original_price" },
    { header: "Strike Price", accessor: "strike_price" },
    { header: "Duration", accessor: "duration" },
    { header: "Handling Fee", accessor: "handling_fee" },
    { header: "Discount", accessor: "discount_percent" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = plansList.map((item, index) => ({
    ...item,
    serial: (currentPage - 1) * pageLimit + index + 1,
    courseTitle: item.courseDetails?.title || "-",
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" onClick={() => handleView(item)}>
          <FaEye />
        </button>
        <button className="icon-btn edit me-2" onClick={() => handleEdit(item)}>
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
        <h2>PLANS</h2>
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
              fetchPlans(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Plan" className="secondary" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add Plan" size="lg">
        <PlansForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Plan" size="lg">
        <PlansForm
          isEdit
          initialData={selectedPlan}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

     <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Plan Details" size="lg">
      {selectedPlan && (
        <div className="container">
          <div className="row mb-2">
            <div className="col-md-6"><b>Course Type:</b> {selectedPlan.course_type}</div>
            <div className="col-md-6"><b>Course Title:</b> {selectedPlan.courseDetails?.title || "-"}</div>
          </div>
          <div className="row mb-2">
            <div className="col-md-6"><b>Original Price:</b> {selectedPlan.original_price}</div>
            <div className="col-md-6"><b>Strike Price:</b> {selectedPlan.strike_price}</div>
          </div>
          <div className="row mb-2">
            <div className="col-md-6"><b>Duration:</b> {selectedPlan.duration}</div>
            <div className="col-md-6"><b>Handling Fee:</b> {selectedPlan.handling_fee}%</div>
          </div>
          <div className="row mb-2">
            <div className="col-md-6"><b>Discount:</b> {selectedPlan.discount_percent}%</div>
          </div>
        </div>
      )}
    </Modal>
    </div>
  );
};

export default Plans;
