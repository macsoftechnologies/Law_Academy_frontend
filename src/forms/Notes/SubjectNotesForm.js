import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  addSubjectnotes,
  updateSubjectnotes,
  getSubCategoriesByCategory,
  getLaswsBySubCategory,
  getNotes,
  getCategories,
} from "../../services/authService";

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
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Labels for disabled inputs in edit mode
  const [notesLabel, setNotesLabel] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [subcategoryLabel, setSubcategoryLabel] = useState("");
  const [lawLabel, setLawLabel] = useState("");

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    try {
      const res = await getNotes();
      setNotesList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories(1, 1000);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  // ── On mount ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  // ── Prefill when editing ───────────────────────────────────────────────────
  useEffect(() => {
    if (isEdit && initialData) {
      console.log("initialData full:", JSON.stringify(initialData, null, 2));

      setTitle(initialData.title || "");
      setPdfUrl(initialData.pdf_url || "");

      // Notes
      const noteObj = initialData?.notes_id?.[0];
      const note = noteObj?.notes_id || "";
      setNotesId(note);
      setNotesLabel(noteObj?.title || "");

      // Law — check lawId array first, then law_id
      const lawArr =
        Array.isArray(initialData?.lawId) && initialData.lawId.length
          ? initialData.lawId
          : Array.isArray(initialData?.law_id) && initialData.law_id.length
          ? initialData.law_id
          : [];

      const lId = lawArr[0]?.lawId || lawArr[0]?.law_id || "";
      const lTitle = lawArr[0]?.title || "";
      setLawId(lId);
      setLawLabel(lTitle);

      // Category — try direct array first
      const catArr =
        Array.isArray(initialData?.categoryId) && initialData.categoryId.length
          ? initialData.categoryId
          : [];

      let catId = catArr[0]?.categoryId || "";
      let catTitle = catArr[0]?.category_name || "";

      // Sub Category — try direct array first
      const subArr =
        Array.isArray(initialData?.subcategory_id) &&
        initialData.subcategory_id.length
          ? initialData.subcategory_id
          : [];

      let subId = subArr[0]?.subcategory_id || "";
      let subTitle = subArr[0]?.title || "";

      // Fallback subId from notes object
      if (!subId && noteObj?.subcategory_id) {
        subId = noteObj.subcategory_id;
      }

      const prefillDropdowns = async () => {
        try {
          let resolvedCatId = catId;
          let resolvedCatTitle = catTitle;
          let resolvedSubId = subId;
          let resolvedSubTitle = subTitle;

          // If catId is missing, find it by searching subcategories per category
          if (!resolvedCatId && resolvedSubId && categories.length > 0) {
            for (let i = 0; i < categories.length; i++) {
              const cat = categories[i];
              const res = await getSubCategoriesByCategory({
                categoryId: cat.categoryId,
              });
              const subList = res.data || [];
              const found = subList.find(
                (s) => s.subcategory_id === resolvedSubId
              );
              if (found) {
                resolvedCatId = cat.categoryId;
                resolvedCatTitle = cat.category_name;
                resolvedSubTitle = resolvedSubTitle || found.title;
                break;
              }
            }
          }

          setCategoryId(resolvedCatId);
          setCategoryLabel(resolvedCatTitle);

          // Fetch subcategories list for this category
          if (resolvedCatId) {
            const subRes = await getSubCategoriesByCategory({
              categoryId: resolvedCatId,
            });
            const subList = subRes.data || [];
            setSubcategories(subList);
            if (!resolvedSubTitle && resolvedSubId) {
              const found = subList.find(
                (s) => s.subcategory_id === resolvedSubId
              );
              resolvedSubTitle = found?.title || "";
            }
          }

          setSubcategoryId(resolvedSubId);
          setSubcategoryLabel(resolvedSubTitle);

          // Fetch laws list for this subcategory
          if (resolvedSubId) {
            const lawRes = await getLaswsBySubCategory({
              subcategory_id: resolvedSubId,
            });
            const lawList = lawRes.data || [];
            setLaws(lawList);
            if (!lTitle && lId) {
              const found = lawList.find((l) => l.lawId === lId);
              setLawLabel(found?.title || "");
            }
          }

          setLawId(lId);
        } catch (err) {
          console.error("Prefill failed:", err);
        }
      };

      prefillDropdowns();
    }
  }, [isEdit, initialData, categories]); // eslint-disable-line

  // ── Manual change handlers (ADD mode only) ────────────────────────────────
  const handleCategoryChange = async (e) => {
    const val = e.target.value;
    setCategoryId(val);
    setSubcategoryId("");
    setLawId("");
    setSubcategories([]);
    setLaws([]);
    if (val) {
      const res = await getSubCategoriesByCategory({ categoryId: val });
      setSubcategories(res.data || []);
    }
  };

  const handleSubcategoryChange = async (e) => {
    const val = e.target.value;
    setSubcategoryId(val);
    setLawId("");
    setLaws([]);
    if (val) {
      const res = await getLaswsBySubCategory({ subcategory_id: val });
      setLaws(res.data || []);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!notesId) {
      Swal.fire("Validation", "Please select a Note", "warning");
      return;
    }
    if (!lawId) {
      Swal.fire("Validation", "Please select a Law", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("notes_id", notesId);
    formData.append("law_id", lawId);
    formData.append("lawId", lawId);
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        {/* Notes */}
        <div className="col-md-6 mb-3">
          <label>Notes</label>
          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={notesLabel}
              disabled
              style={{ cursor: "not-allowed", backgroundColor: "#e9ecef" }}
            />
          ) : (
            <select
              style={{ cursor: "pointer" }}
              className="form-control form-select"
              value={notesId}
              onChange={(e) => setNotesId(e.target.value)}
            >
              <option value="">Select Notes</option>
              {notesList.map((n) => (
                <option key={n.notes_id} value={n.notes_id}>
                  {n.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Category */}
        <div className="col-md-6 mb-3">
          <label>Category</label>
          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={categoryLabel}
              disabled
              style={{ cursor: "not-allowed", backgroundColor: "#e9ecef" }}
            />
          ) : (
            <select
              style={{ cursor: "pointer" }}
              className="form-control form-select"
              value={categoryId}
              onChange={handleCategoryChange}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.category_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sub Category */}
        <div className="col-md-6 mb-3">
          <label>Sub Category</label>
          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={subcategoryLabel}
              disabled
              style={{ cursor: "not-allowed", backgroundColor: "#e9ecef" }}
            />
          ) : (
            <select
              style={{ cursor: "pointer" }}
              className="form-control form-select"
              value={subcategoryId}
              onChange={handleSubcategoryChange}
              disabled={!categoryId}
            >
              <option value="">Select Sub Category</option>
              {subcategories.map((s) => (
                <option key={s.subcategory_id} value={s.subcategory_id}>
                  {s.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Law */}
        <div className="col-md-6 mb-3">
          <label>Law</label>
          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={lawLabel}
              disabled
              style={{ cursor: "not-allowed", backgroundColor: "#e9ecef" }}
            />
          ) : (
            <select
              style={{ cursor: "pointer" }}
              className="form-control form-select"
              value={lawId}
              onChange={(e) => setLawId(e.target.value)}
              disabled={!subcategoryId}
            >
              <option value="">Select Law</option>
              {laws.map((l) => (
                <option key={l.lawId} value={l.lawId}>
                  {l.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Title */}
        <div className="col-md-6 mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* PDF URL */}
        <div className="col-md-6 mb-3">
          <label>PDF URL</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter PDF URL"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
        </div>

        {/* Presentation Image */}
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
            onChange={(e) => setImage(e.target.files[0] || null)}
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

export default SubjectNotesForm;