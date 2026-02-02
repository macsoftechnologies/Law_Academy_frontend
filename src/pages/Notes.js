import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import SplashScreenForm from "../forms/SplashScreenForm";

function Notes() {
  const [open, setOpen] = useState(false);       
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false); 

  const [selectedScreen, setSelectedScreen] = useState(null);
  const [screensList, setScreensList] = useState([]);

  // Sample Data
  useEffect(() => {
    const sampleData = [
      { id: 1, title: "Welcome", subtitle: "Start your journey", imagePreview: null },
      { id: 2, title: "Get Fit", subtitle: "Join our Yoga classes", imagePreview: null },
    ];
    setScreensList(sampleData);
  }, []);

  // VIEW
  const handleView = (item) => {
    setSelectedScreen(item);
    setViewOpen(true);
  };

  // EDIT
  const handleEdit = (item) => {
    setSelectedScreen(item);
    setEditOpen(true);
  };

  // DELETE
  const handleDelete = (id) => {
    if (!window.confirm("Delete this splash screen?")) return;
    setScreensList(screensList.filter((s) => s.id !== id));
  };

  // ADD / UPDATE
  const handleSubmit = (data) => {
    if (selectedScreen && editOpen) {
      // Update existing
      setScreensList(
        screensList.map((s) => (s.id === selectedScreen.id ? { ...s, ...data } : s))
      );
    } else {
      // Add new
      const newId = screensList.length ? screensList[screensList.length - 1].id + 1 : 1;
      setScreensList([...screensList, { id: newId, ...data }]);
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Subtitle", accessor: "subtitle" },
    { header: "Image", accessor: "imagePreview" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = screensList.map((item) => ({
    ...item,
    imagePreview: item.imagePreview ? (
      <img
        src={item.imagePreview}
        alt="Splash"
        style={{ width: "100px", borderRadius: "5px" }}
      />
    ) : (
      "No Image"
    ),
    actions: (
      <div className="actions">
        <button className="view" onClick={() => handleView(item)}>View</button>
        <button className="edit" onClick={() => handleEdit(item)}>Edit</button>
        <button className="delete" onClick={() => handleDelete(item.id)}>Delete</button>
      </div>
    ),
  }));

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h2>SPLASH SCREEN LIST</h2>
        <Button text="+ Add Splash Screen" color="orange" onClick={() => setOpen(true)} />
      </div>

      {/* Table */}
      <Table columns={columns} data={tableData} rowsPerPage={5} />

      {/* ADD MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Splash Screen" size="lg">
        <SplashScreenForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Splash Screen" size="lg">
        <SplashScreenForm
          onClose={() => setEditOpen(false)}
          initialData={selectedScreen}
          isEdit
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Splash Screen Details" size="md">
        {selectedScreen && (
          <div style={{ padding: "10px" }}>
            <p><b>Title:</b> {selectedScreen.title}</p>
            <p><b>Subtitle:</b> {selectedScreen.subtitle}</p>
            <p>
              <b>Image:</b><br />
              {selectedScreen.imagePreview ? (
                <img
                  src={selectedScreen.imagePreview}
                  alt="Splash"
                  style={{ width: "200px", borderRadius: "5px" }}
                />
              ) : "No Image"}
            </p>
            <button className="btn btn-secondary mt-2" onClick={() => setViewOpen(false)}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Notes;
