import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import AdminForm from "../forms/AdminForm";
import { getadmins, addAdmin, updateAdmin, deleteAdmin } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Admins = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetchAdminList = useCallback(async (page = 1, limit = pageLimit) => {
    try {
      const res = await getadmins(page, limit);
      setAdminList(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Fetch admins error:", err);
      setAdminList([]);
      setTotalPages(1);
      Swal.fire("Error", "Failed to fetch admins", "error");
    }
  }, [pageLimit]);

  useEffect(() => {
    fetchAdminList(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchAdminList]);

  const handleView = (item, index) => {
    setSelectedAdmin({
      ...item,
      serial: (currentPage - 1) * pageLimit + index + 1,
    });
    setViewOpen(true);
  };

  const handleEdit = (item, index) => {
    setSelectedAdmin({
      ...item,
      serial: (currentPage - 1) * pageLimit + index + 1,
    });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This admin will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAdmin(item.adminId);
      fetchAdminList(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!",
        text: "Admin removed successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#8f1e1e",
      });
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedAdmin && editOpen) {
        formData.adminId = selectedAdmin.adminId;
        await updateAdmin(formData);
        setEditOpen(false);
        setSelectedAdmin(null);
        fetchAdminList(currentPage, pageLimit);

        Swal.fire({
          title: "Updated!",
          text: "Admin updated successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: true,
          background: "#28a745",
          color: "#ffffff",
        });
        return;
      }

      await addAdmin(formData);
      setOpen(false);
      fetchAdminList(currentPage, pageLimit);

      Swal.fire({
        title: "Added!",
        text: "Admin added successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        background: "#28a745",
        color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "serial" },
    { header: "Email", accessor: "emailId" },
    { header: "Mobile Number", accessor: "mobileNumber" },
    { header: "Role", accessor: "role" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = adminList.map((item, index) => ({
    ...item, 
    serial: (currentPage - 1) * pageLimit + index + 1,
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" onClick={() => handleView(item, index)}>
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
        <h2>ADMINS LIST</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchAdminList(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Admin" className="secondary" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add Admin" size="lg">
        <AdminForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Admin" size="lg">
        <AdminForm
          isEdit
          initialData={selectedAdmin}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Admin Details" size="md">
        {selectedAdmin && (
          <div>
            <p><b>Email:</b> {selectedAdmin.emailId}</p>
            <p><b>Mobile Number:</b> {selectedAdmin.mobileNumber}</p>
            <p><b>Role:</b> {selectedAdmin.role}</p>
            <ul>
              {selectedAdmin.access_modules?.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admins;
