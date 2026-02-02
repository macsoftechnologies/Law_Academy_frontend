import React, { useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ClientForm from "../forms/ClientForm";

function CouresCombo() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [clients, setClients] = useState([
    {
      id: 1,
      name: "Ramesh Kumar",
      mobileNumber: "9876543210",
      email: "ramesh@gmail.com",
      gender: "Male",
      age: 32,
      healthPreferences: "Back pain",
    },
  ]);

  const handleView = (item) => {
    setSelectedClient(item);
    setViewOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedClient(item);
    setEditOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete client?")) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Mobile", accessor: "mobileNumber" },
    { header: "Gender", accessor: "gender" },
    { header: "Age", accessor: "age" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = clients.map((item) => ({
    ...item,
    actions: (
      <div className="actions">
        <button className="view" onClick={() => handleView(item)}>
          View
        </button>
        <button className="edit" onClick={() => handleEdit(item)}>
          Edit
        </button>
        <button className="delete" onClick={() => handleDelete(item.id)}>
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h2>CLIENT LIST</h2>
        <Button text="+ Add Client" color="orange" onClick={() => setOpen(true)} />
      </div>

      {/* Table */}
      <Table columns={columns} data={data} />

      {/* ADD MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Client" size="lg">
        <ClientForm onClose={() => setOpen(false)} />
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Client" size="lg">
        <ClientForm
          onClose={() => setEditOpen(false)}
          initialData={selectedClient}
          isEdit
        />
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Client Details">
        {selectedClient && (
          <>
            <p><b>Name:</b> {selectedClient.name}</p>
            <p><b>Mobile:</b> {selectedClient.mobileNumber}</p>
            <p><b>Email:</b> {selectedClient.email}</p>
            <p><b>Gender:</b> {selectedClient.gender}</p>
            <p><b>Age:</b> {selectedClient.age}</p>
            <p><b>Health Preferences:</b> {selectedClient.healthPreferences}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default CouresCombo;
