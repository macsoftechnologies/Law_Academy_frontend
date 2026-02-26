import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  addSubCategories,
  updateSubCategories,
  getCategories,
} from "../services/authService";
import "./form.css";

const SubCategoriesForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [terms, setTerms] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories(1, 1000);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Category fetch failed", err);
    }
  };

  useEffect(() => {
  if (isEdit && initialData) {
    setCategoryId(
      initialData.categoryId?.[0]?.categoryId || ""
    );
    setTitle(initialData.title || "");
    setAboutCourse(initialData.about_course || "");
    setTerms(initialData.terms_conditions || "");
  }
}, [isEdit, initialData]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId || !title) {
      Swal.fire("Validation Error", "Category & Title are required", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("title", title);
    formData.append("about_course", aboutCourse);
    formData.append("terms_conditions", terms);
    if (image) formData.append("presentation_image", image);

    try {
      setLoading(true);
      let res;

      if (isEdit) {
        formData.append("subcategory_id", initialData.subcategory_id);
        res = await updateSubCategories(formData);
      } else {
        res = await addSubCategories(formData);
      }

      Swal.fire({
        title: isEdit ? "Updated!" : "Added!",
        text: res.message || (isEdit ? "Updated successfully" : "Added successfully"),
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
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
  <form className="custom-form" onSubmit={handleSubmit}>
    <div className="row">
      {/* Category */}
        <div className="col-md-6 mb-3">
          <label>Category</label>
          <select
            style={{cursor:"pointer"}}
            className="form-control"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

      {/* Title */}
      <div className="col-md-6 mb-3">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* About Course – FULL WIDTH */}
      <div className="col-md-12 mb-3">
        <label>About Course</label>
        <textarea
          className="form-control"
          rows="3"
          value={aboutCourse}
          onChange={(e) => setAboutCourse(e.target.value)}
        />
      </div>

      {/* Terms & Conditions – FULL WIDTH */}
      <div className="col-md-12 mb-3">
        <label>Terms & Conditions</label>
        <textarea
          className="form-control"
          rows="3"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        />
      </div>

      {/* Image */}
      <div className="col-md-6 mb-3">
        <label>Presentation Image</label>

        {/* ✅ Show previous image in edit mode */}
        {isEdit && initialData?.presentation_image && (
          <div className="mb-2">
            <img
              src={`${process.env.REACT_APP_API_BASE_URL}/${initialData.presentation_image}`}
              alt="Previous"
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
          required={!isEdit}   // ✅ only required for Add
        />
      </div>

    </div>

    {/* Buttons */}
    <div className="text-end mt-3">
      <button
        type="button"
        className="btn btn-secondary me-2"
        onClick={onClose}
      >
        Cancel
      </button>
      <button className="btn btn-success" disabled={loading}>
        {loading ? "Saving..." : isEdit ? "Update" : "Save"}
      </button>
    </div>
  </form>


  );
};

export default SubCategoriesForm;
