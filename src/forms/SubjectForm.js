import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  addSubjects,
  updateSubjects,
  getCategories,
  getSubCategoriesByCategory,
  getLaswsBySubCategory,
} from "../services/authService";

const SubjectForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [laws, setLaws] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [lawId, setLawId] = useState("");
  const [title, setTitle] = useState("");
  const [subjectImage, setSubjectImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await getCategories(1, 1000);
    setCategories(res.data || []);
  }, []);

  const fetchSubCategories = useCallback(
    async (id, isPrefill = false) => {
      const res = await getSubCategoriesByCategory({ categoryId: id });
      setSubcategories(res.data || []);

      if (isPrefill && initialData?.subcategory_id?.[0]?.subcategory_id) {
        setSubcategoryId(initialData.subcategory_id[0].subcategory_id);
      }
    },
    [initialData]
  );

  const fetchLaws = useCallback(
    async (subId, isPrefill = false) => {
      const res = await getLaswsBySubCategory({ subcategory_id: subId });
      setLaws(res.data || []);

      if (isPrefill && initialData?.law_id?.[0]?.lawId) {
        setLawId(initialData.law_id[0].lawId);
      }
    },
    [initialData]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setCategoryId(initialData.categoryId?.[0]?.categoryId || "");
      setSubcategoryId(initialData.subcategory_id?.[0]?.subcategory_id || "");
      setLawId(initialData.law_id?.[0]?.lawId || "");

      if (initialData.categoryId?.[0]?.categoryId) {
        fetchSubCategories(initialData.categoryId[0].categoryId, true);
      }

      if (initialData.subcategory_id?.[0]?.subcategory_id) {
        fetchLaws(initialData.subcategory_id[0].subcategory_id, true);
      }
    }
  }, [isEdit, initialData, fetchSubCategories, fetchLaws]);

  useEffect(() => {
    if (!isEdit && categoryId) {
      fetchSubCategories(categoryId);
      setSubcategoryId("");
      setLawId("");
      setLaws([]);
    }
  }, [categoryId, isEdit, fetchSubCategories]);

  useEffect(() => {
    if (!isEdit && subcategoryId) {
      fetchLaws(subcategoryId);
      setLawId("");
    }
  }, [subcategoryId, isEdit, fetchLaws]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("subcategory_id", subcategoryId);
    formData.append("law_id", lawId);
    formData.append("title", title);
    if (subjectImage) formData.append("subject_image", subjectImage);

    try {
      setLoading(true);
      let response;

      if (isEdit) {
        formData.append("subjectId", initialData.subjectId);
        response = await updateSubjects(formData);
      } else {
        response = await addSubjects(formData);
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: response.message || (isEdit ? "Updated successfully" : "Added successfully"),
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#35a542",
      });

      onSubmit();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">
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
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label>Sub Category</label>
          <select
            style={{cursor:"pointer"}}
            className="form-control"
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

        <div className="col-md-6 mb-3">
          <label>Law</label>
          <select
            style={{cursor:"pointer"}}
            className="form-control"
            value={lawId}
            onChange={(e) => setLawId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">Select Law</option>
            {laws.map((l) => (
              <option key={l.lawId} value={l.lawId}>
                {l.title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Subject Image</label>

          {isEdit && initialData?.subject_image && (
            <div className="mb-2">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${initialData.subject_image}`}
                alt="Previous Subject"
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
            onChange={(e) => setSubjectImage(e.target.files[0])}
          />
        </div>
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
};

export default SubjectForm;
