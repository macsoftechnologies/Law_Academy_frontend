import React, { useEffect, useState, useCallback } from "react";
// import Swal from "sweetalert2";
import { showSuccess, showError, showDeleteConfirm, showDeleteSuccess } from "../components/alertService";
import Table from "../components/Table";
// import Button from "../components/Button";
import Modal from "../components/Modal";
import AdminForm from "../forms/AdminForm";
import { getadmins, addAdmin, updateAdmin, deleteAdmin } from "../services/authService";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../components/CommonHeader";

const Admins = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdminList = useCallback(async (page = 1, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const res = await getadmins(page, limit);
      setAdminList(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Fetch admins error:", err);
      setAdminList([]);
      setTotalPages(1);
      showError("Failed to fetch admins");
    }finally {
    setIsLoading(false);    
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
    const result = await showDeleteConfirm();

    if (!result.isConfirmed) return;

    await deleteAdmin(item.adminId);

    fetchAdminList(currentPage, pageLimit);

    showDeleteSuccess();
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedAdmin && editOpen) {
        formData.adminId = selectedAdmin.adminId;
        await updateAdmin(formData);
        setEditOpen(false);
        setSelectedAdmin(null);
        fetchAdminList(currentPage, pageLimit);
        showSuccess("Admin updated successfully");
        return;
      }
      await addAdmin(formData);
      setOpen(false);
      fetchAdminList(currentPage, pageLimit);
      showSuccess("Admin added successfully");
    } catch (err) {
      showError("Operation failed");
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
     <CommonHeader
      title="ADMINS LIST"
      count={adminList.length}
      totalPages={totalPages}
      pageLimit={pageLimit}
      setPageLimit={(limit) => {
        setPageLimit(limit);
        setCurrentPage(1);
        fetchAdminList(1, limit);
      }}
      setCurrentPage={setCurrentPage}
      onChange={(page, limit) => fetchAdminList(page, limit)}
      buttonText="+ Add Admin"
      buttonColor="orange"
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
