import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getSubCategories, getNotesById } from "../services/authService";
import "./form.css";

function NotesForm({ onClose, initialData, isEdit, onSubmit, userId }) {
  const [title, setTitle]                         = useState("");
  const [subTitle, setSubTitle]                   = useState("");
  const [isPrintAvail, setIsPrintAvail]           = useState(false);
  const [presentationImage, setPresentationImage] = useState(null);
  const [printNotesImage, setPrintNotesImage]     = useState(null);
  const [termsConditions, setTermsConditions]     = useState("");
  const [subcategoryId, setSubcategoryId]         = useState("");
  const [subcategories, setSubcategories]         = useState([]);

  // about_book
  const [aboutBookDescription, setAboutBookDescription] = useState("");
  const [sections, setSections] = useState([{ title: "", topics: [""] }]);

  // for showing existing images in edit mode
  const [existingPresentationImage, setExistingPresentationImage] = useState(null);
  const [existingPrintNotesImage, setExistingPrintNotesImage]     = useState(null);

  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(false);

  // ─── Fetch Subcategories Dropdown ─────────────────────────────
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await getSubCategories(1, 1000);
        setSubcategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch subcategories", err);
      }
    };
    fetchSubCategories();
  }, []);

  // ─── Helper: parse & apply about_book ─────────────────────────
  const applyAboutBook = (aboutBook) => {
    if (!aboutBook) return;
    let parsed = aboutBook;
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { return; }
    }
    setAboutBookDescription(parsed.description || "");
    setSections(
      parsed.sections && parsed.sections.length > 0
        ? parsed.sections.map((s) => ({
            title: s.title || "",
            topics: s.topics && s.topics.length > 0 ? s.topics : [""],
          }))
        : [{ title: "", topics: [""] }]
    );
  };

  // ─── Prefill on Edit — fetch full record by notes_id ──────────
  useEffect(() => {
    if (!isEdit || !initialData) return;

    const loadFullRecord = async () => {
      setFetching(true);
      try {
        // Fetch the complete record so about_book & images are present
        const res = await getNotesById(initialData.notes_id);
        const d   = res.data || {};

        setTitle(d.title || "");
        setSubTitle(d.sub_title || "");
        setIsPrintAvail(d.isPrintAvail || false);
        setTermsConditions(d.terms_conditions || "");
        setSubcategoryId(d.subcategory_id || "");

        // existing image paths (try both possible key names from backend)
        setExistingPresentationImage(
          d.presentation_image || d.presentationImage || null
        );
        setExistingPrintNotesImage(
          d.printNotes_image || d.print_notes_image || d.printNotesImage || null
        );

        // reset file pickers
        setPresentationImage(null);
        setPrintNotesImage(null);

        applyAboutBook(d.about_book);
      } catch (err) {
        console.error("Failed to load note details", err);
        // fallback to whatever is in initialData
        setTitle(initialData.title || "");
        setSubTitle(initialData.sub_title || "");
        setIsPrintAvail(initialData.isPrintAvail || false);
        setTermsConditions(initialData.terms_conditions || "");
        setSubcategoryId(initialData.subcategory_id || "");
        setExistingPresentationImage(initialData.presentation_image || null);
        setExistingPrintNotesImage(
          initialData.printNotes_image || initialData.print_notes_image || null
        );
        applyAboutBook(initialData.about_book);
      } finally {
        setFetching(false);
      }
    };

    loadFullRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.notes_id, isEdit]);

  // ─── Section Helpers ──────────────────────────────────────────
  const addSection = () =>
    setSections([...sections, { title: "", topics: [""] }]);

  const removeSection = (sIdx) =>
    setSections(sections.filter((_, i) => i !== sIdx));

  const updateSectionTitle = (sIdx, val) =>
    setSections(sections.map((s, i) => (i === sIdx ? { ...s, title: val } : s)));

  const addTopic = (sIdx) =>
    setSections(
      sections.map((s, i) =>
        i === sIdx ? { ...s, topics: [...s.topics, ""] } : s
      )
    );

  const removeTopic = (sIdx, tIdx) =>
    setSections(
      sections.map((s, i) =>
        i === sIdx
          ? { ...s, topics: s.topics.filter((_, j) => j !== tIdx) }
          : s
      )
    );

  const updateTopic = (sIdx, tIdx, val) =>
    setSections(
      sections.map((s, i) =>
        i === sIdx
          ? { ...s, topics: s.topics.map((t, j) => (j === tIdx ? val : t)) }
          : s
      )
    );

  // ─── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const aboutBook = {
      description: aboutBookDescription,
      sections: sections.map((s) => ({
        title: s.title,
        topics: s.topics.filter((t) => t.trim() !== ""),
      })),
    };

    const formData = new FormData();

    // IDs
    if (isEdit && initialData?.notes_id)
      formData.append("notes_id", initialData.notes_id);
    if (userId) formData.append("userId", userId);

    // Text fields  (keys match your Postman screenshot)
    formData.append("title", title);
    formData.append("sub_title", subTitle);
    formData.append("subcategory_id", subcategoryId);
    formData.append("about_book", JSON.stringify(aboutBook));
    formData.append("terms_conditions", termsConditions);
    formData.append("isPrintAvail", isPrintAvail);  

    // File fields
    if (presentationImage) formData.append("presentation_image", presentationImage);
    if (printNotesImage)   formData.append("printNotes_image", printNotesImage);

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Inline Styles ────────────────────────────────────────────
  const sectionBox = {
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "14px",
    background: "#f9f9f9",
  };

  const plusBtn = {
    border: "none",
    background: "none",
    color: "#28a745",
    fontWeight: "bold",
    fontSize: "20px",
    cursor: "pointer",
    lineHeight: 1,
    padding: "0 4px",
  };

  const minusBtn = {
    border: "none",
    background: "none",
    color: "#dc3545",
    fontWeight: "bold",
    fontSize: "20px",
    cursor: "pointer",
    lineHeight: 1,
    padding: "0 4px",
  };

  // ─── Render ───────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <div className="mt-2 text-muted">Loading note details...</div>
      </div>
    );
  }

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        {/* Title */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>

        {/* Sub Title */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Sub Title</label>
          <input
            className="form-control"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="Enter sub title"
          />
        </div>

        {/* Sub Category Dropdown */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Sub Category</label>
          <select
            className="form-control form-select"
            style={{ cursor: "pointer" }}
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={isEdit}
            required
          >
            <option value="">Select Sub Category</option>
            {subcategories.map((s) => (
              <option key={s.subcategory_id} value={s.subcategory_id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* isPrintAvail */}
        <div className="col-md-6 mb-3 d-flex align-items-center">
          <div className="form-check mt-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="isPrintAvail"
              checked={isPrintAvail}
              onChange={(e) => setIsPrintAvail(e.target.checked)}
            />
            <label className="form-check-label fw-semibold" htmlFor="isPrintAvail">
              Is Print Available?
            </label>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="col-md-12 mb-3">
          <label className="form-label">Terms &amp; Conditions</label>
          <textarea
            className="form-control"
            rows={3}
            value={termsConditions}
            onChange={(e) => setTermsConditions(e.target.value)}
            placeholder="Enter terms and conditions"
          />
        </div>

        {/* Presentation Image */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Presentation Image</label>
          {isEdit && existingPresentationImage && (
            <div className="mb-2">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${existingPresentationImage}`}
                alt="Current"
                style={{ height: "70px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
              <div style={{ fontSize: "11px", color: "#888" }}>Current image</div>
            </div>
          )}
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setPresentationImage(e.target.files[0])}
            required={!isEdit}
          />
        </div>

        {/* Print Notes Image */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Print Notes Image</label>
          {isEdit && existingPrintNotesImage && (
            <div className="mb-2">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${existingPrintNotesImage}`}
                alt="Current"
                style={{ height: "70px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
              <div style={{ fontSize: "11px", color: "#888" }}>Current image</div>
            </div>
          )}
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setPrintNotesImage(e.target.files[0])}
            required={!isEdit}
          />
        </div>

      </div>

      {/* ══════════════ ABOUT BOOK ══════════════ */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ fontSize: "15px" }}>
          About Book
        </label>

        {/* Description */}
        <textarea
          className="form-control mb-3"
          rows={3}
          placeholder="Enter book description..."
          value={aboutBookDescription}
          onChange={(e) => setAboutBookDescription(e.target.value)}
        />

        {/* Sections Label + Add Button */}
        <div className="d-flex align-items-center mb-2 gap-2">
          <span className="fw-semibold">Sections</span>
          <button
            type="button"
            style={plusBtn}
            onClick={addSection}
            title="Add Section"
          >
            +
          </button>
        </div>

        {/* Section Cards */}
        {sections.map((section, sIdx) => (
          <div key={sIdx} style={sectionBox}>

            {/* Section Title Row */}
            <div className="d-flex align-items-center mb-3 gap-2">
              <div style={{ flex: 1 }}>
                <label className="form-label mb-1" style={{ fontSize: "13px", color: "#555" }}>
                  Section {sIdx + 1} — Title
                </label>
                <input
                  className="form-control"
                  placeholder={`e.g. Civil Laws`}
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                />
              </div>
              {sections.length > 1 && (
                <button
                  type="button"
                  style={{ ...minusBtn, marginTop: "22px" }}
                  onClick={() => removeSection(sIdx)}
                  title="Remove this section"
                >
                  −
                </button>
              )}
            </div>

            {/* Topics */}
            <div className="ms-1">
              <div className="d-flex align-items-center mb-2 gap-2">
                <small className="fw-semibold text-muted">Topics</small>
                <button
                  type="button"
                  style={plusBtn}
                  onClick={() => addTopic(sIdx)}
                  title="Add Topic"
                >
                  +
                </button>
              </div>

              {section.topics.map((topic, tIdx) => (
                <div key={tIdx} className="d-flex align-items-center mb-2 gap-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder={`Topic ${tIdx + 1}`}
                    value={topic}
                    onChange={(e) => updateTopic(sIdx, tIdx, e.target.value)}
                  />
                  {section.topics.length > 1 && (
                    <button
                      type="button"
                      style={minusBtn}
                      onClick={() => removeTopic(sIdx, tIdx)}
                      title="Remove topic"
                    >
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* ══════════════ END ABOUT BOOK ══════════════ */}

      {/* Action Buttons */}
      <div className="text-end mt-3">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Notes" : "Add Notes"}
        </button>
      </div>
    </form>
  );
}

export default NotesForm;