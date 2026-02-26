import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  addSubjectnotes,
  updateSubjectnotes,
  getSubCategoriesByCategory,
  getLaswsBySubCategory,
  getNotes,
  getCategories,
} from "../services/authService";

const SubjectNotesForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  const [notesId, setNotesId] = useState("");
  const [notesList, setNotesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [laws, setLaws] = useState([]);
  const [lawId, setLawId] = useState("");
  const [title, setTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    const res = await getNotes();
    setNotesList(res.data || []);
  }, []);

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
    fetchNotes();
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  useEffect(() => {
    if (isEdit && initialData) {
      const note = initialData?.notes_id?.[0]?.notes_id || "";
      const catId = initialData?.categoryId?.[0]?.categoryId || "";
      const subId = initialData?.subcategory_id?.[0]?.subcategory_id || "";
      setNotesId(note);
      setCategoryId(catId);
      setSubcategoryId(subId);
      setLawId(initialData?.law_id?.[0]?.lawId || "");
      setTitle(initialData.title || "");
      setPdfUrl(initialData.pdf_url || "");
      if (catId) fetchSubCategories(catId, true);
      if (subId) fetchLaws(subId, true);
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
    formData.append("notes_id", notesId);
    formData.append("law_id", lawId);
    formData.append("title", title);
    formData.append("pdf_url", pdfUrl);
    if (image) formData.append("presentation_image", image);

    try {
      setLoading(true);
      if (isEdit) {
        formData.append("subject_notes_id", initialData.subject_notes_id);
        await updateSubjectnotes(formData);
      } else {
        await addSubjectnotes(formData);
      }

      Swal.fire({
        toast: true,
        icon: "success",
        title: isEdit ? "Updated successfully" : "Added successfully",
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
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
          <label>Notes</label>
          <select
            style={{ cursor: "pointer" }}
            className="form-control"
            value={notesId}
            onChange={(e) => setNotesId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">Select Notes</option>
            {notesList.map((n) => (
              <option key={n.notes_id} value={n.notes_id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label>Category</label>
          <select
            style={{ cursor: "pointer" }}
            className="form-control"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategories([]);
              setSubcategoryId("");
              setLaws([]);
              setLawId("");
            }}
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
            style={{ cursor: "pointer" }}
            className="form-control"
            value={subcategoryId}
            onChange={(e) => {
              setSubcategoryId(e.target.value);
              setLaws([]);
              setLawId("");
            }}
            disabled={isEdit || !categoryId}
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
            style={{ cursor: "pointer" }}
            className="form-control"
            value={lawId}
            onChange={(e) => setLawId(e.target.value)}
            disabled={isEdit || !subcategoryId}
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
          <label>PDF URL</label>
          <input
            type="text"
            className="form-control"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Presentation Image</label>
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
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
              } else {
                setImage(null);
              }
            }}
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

export default SubjectNotesForm;