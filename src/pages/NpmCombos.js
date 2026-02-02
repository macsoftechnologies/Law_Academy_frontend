import React, { useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import TrainerForm from "../forms/TrainerForm";
import "../forms/form.css";


function NpmCombos() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [trainers, setTrainers] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      mobileNumber: "9876543210",
      email: "alex@gmail.com",
      gender: "Male",
      age: 30,
      healthPreferences: "Back pain",
      status: "Pending",
    },
    {
      id: 2,
      name: "Priya Sharma",
      mobileNumber: "9876543211",
      email: "priya@gmail.com",
      gender: "Female",
      age: 28,
      healthPreferences: "None",
      status: "Approved",
    },
  ]);

  const handleView = (item) => {
    setSelectedTrainer(item);
    setViewOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedTrainer(item);
    setEditOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete trainer?")) {
      setTrainers(trainers.filter((t) => t.id !== id));
    }
  };

  const handleAddTrainer = (data) => {
    const newTrainer = { ...data, id: Date.now(), status: "Pending" }; // Default Pending
    setTrainers([...trainers, newTrainer]);
  };

  const handleUpdateTrainer = (data) => {
    setTrainers(
      trainers.map((t) =>
        t.id === selectedTrainer.id ? { ...t, ...data } : t
      )
    );
  };

  const handleToggleStatus = (id) => {
    setTrainers(
      trainers.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Pending" ? "Approved" : "Pending" }
          : t
      )
    );
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Mobile", accessor: "mobileNumber" },
    { header: "Email", accessor: "email" },
    { header: "Gender", accessor: "gender" },
    { header: "Age", accessor: "age" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = trainers.map((item) => ({
    ...item,
    actions: (
      <div className="actions">
        <button className="view" onClick={() => handleView(item)}>
          View
        </button>
        <button className="edit" onClick={() => handleEdit(item)}>
          Edit
        </button>
        <button
          className={item.status === "Approved" ? "approved" : "pending"}
          onClick={() => handleToggleStatus(item.id)}
        >
          {item.status}
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
        <h2>TRAINER LIST</h2>
        <Button text="+ Add Trainer" color="orange" onClick={() => setOpen(true)} />
      </div>

      {/* Table */}
      <Table columns={columns} data={data} />

      {/* ADD MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Trainer" size="lg">
        <TrainerForm onClose={() => setOpen(false)} onSubmit={handleAddTrainer} />
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Trainer" size="lg">
        <TrainerForm
          onClose={() => setEditOpen(false)}
          initialData={selectedTrainer}
          isEdit
          onSubmit={handleUpdateTrainer}
        />
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Trainer Details">
        {selectedTrainer && (
          <>
            <p><b>Name:</b> {selectedTrainer.name}</p>
            <p><b>Mobile:</b> {selectedTrainer.mobileNumber}</p>
            <p><b>Email:</b> {selectedTrainer.email}</p>
            <p><b>Gender:</b> {selectedTrainer.gender}</p>
            <p><b>Age:</b> {selectedTrainer.age}</p>
            <p><b>Health Preferences:</b> {selectedTrainer.healthPreferences}</p>
            <p><b>Status:</b> {selectedTrainer.status}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default NpmCombos;
