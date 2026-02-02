import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { addCategories, updateCategories } from "../services/authService";
import "./form.css";

function CategoriesForm({ onClose, isEdit, initialData, onSubmit }) {
  const [categoryName, setCategoryName] = useState("");
  const [tagText, setTagText] = useState("");
  const [presentationFile, setPresentationFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && initialData) {
      setCategoryName(initialData.category_name || "");
      setTagText(initialData.tag_text || "");
      setPresentationFile(null); // optional
    }
  }, [isEdit, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      Swal.fire("Validation Error", "Category name is required", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("category_name", categoryName);
    formData.append("tag_text", tagText);
    if (presentationFile) formData.append("presentation_file", presentationFile);

    try {
      setLoading(true);

      let response;
      if (isEdit && initialData?.categoryId) {
        formData.append("categoryId", initialData.categoryId);
        response = await updateCategories(formData);
      } else {
        response = await addCategories(formData);
      }

      Swal.fire({
        title: isEdit ? "Updated!" : "Added!",
        text: response.message || (isEdit ? "Updated successfully" : "Added successfully"),
        icon: "success",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#35a542",
      });

      onSubmit();
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Category Name</label>
        <input
          type="text"
          className="form-control"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter Category Name"
          required
        />
      </div>

      <div className="mb-3">
        <label>Tag Text</label>
        <input
          type="text"
          className="form-control"
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="Enter Tag Text"
        />
      </div>

      <div className="mb-3">
        <label>Presentation File</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => setPresentationFile(e.target.files[0])}
          required={!isEdit}
        />
      </div>

      <div className="text-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default CategoriesForm;
