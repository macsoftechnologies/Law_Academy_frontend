import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  addLaws,
  updateLaws,
  getCategories,
  getSubCategoriesByCategory,
} from "../services/authService";

const LawForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState(""); 
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryId) fetchSubCategories(categoryId);
  }, [categoryId]);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");

      setCategoryId(
        initialData.categoryId?.[0]?.categoryId || ""
      );

      setSubcategoryId(
        initialData.subcategory_id?.[0]?.subcategory_id || ""
      );
    }
  }, [isEdit, initialData]);

  const fetchCategories = async () => {
    const res = await getCategories(1, 1000);
    setCategories(res.data || []);
  };

  const fetchSubCategories = async (id) => {
    const res = await getSubCategoriesByCategory({ categoryId: id });
    setSubcategories(res.data || []);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("title", title);

  if (image) {
    formData.append("law_image", image);
  }

  try {
    setLoading(true);
    let response;

    if (isEdit) {
      // ✅ correct ID for update
      formData.append("lawId", initialData.lawId);
      response = await updateLaws(formData);
    } else {
      formData.append("categoryId", categoryId);
      formData.append("subcategory_id", subcategoryId);
      response = await addLaws(formData);
    }

    // ✅ UPDATED SWEETALERT (as requested)
    Swal.fire({
      title: isEdit ? "Updated!" : "Added!",
      text: response.message || "Success",
      icon: "success",
      toast: true,
      position: "top-end",
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
      err.response?.data?.message || "Save failed",
      "error"
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* CATEGORY */}
        <div className="col-md-6 mb-3">
          <label>Category</label>
          <select
            style={{cursor:"pointer"}}
            className="form-control form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* SUB CATEGORY */}
        <div className="col-md-6 mb-3">
          <label>Sub Category</label>
          <select
            style={{cursor:"pointer"}}
            className="form-control form-select"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">Select Sub Category</option>
            {subcategories.map((s) => (
              <option key={s.subcategory_id} value={s.subcategory_id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* TITLE */}
        <div className="col-md-6 mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* IMAGE */}
        <div className="col-md-6 mb-3">
          <label>Law Image</label>

          {/* ✅ Show previous image when editing */}
          {isEdit && initialData?.law_image && (
            <div className="mb-2">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${initialData.law_image}`}
                alt="Previous Law"
                style={{
                  height: "80px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}

          <input
            type="file"
            className="form-control"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>


      </div>

      <div className="text-end">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Cancel
        </button>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default LawForm;
