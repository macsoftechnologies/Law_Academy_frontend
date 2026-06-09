import React, { useEffect, useState, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import {
  getCategories,
  getSubCategoriesByCategory,
  getLaswsBySubCategory,
  getlawBySubjects,
  addCombinations,
  updateCombinations,
} from "../../services/authService";
import { getPrelims, getMains } from "../../services/authService";

// ── Reusable dropdown multi-select component ──────────────────────────────────
const MultiSelectDropdown = ({ label, items, selectedIds, onToggle, idKey, labelKey, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = items
    .filter((item) => selectedIds.includes(item[idKey]))
    .map((item) => item[labelKey]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="form-control d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer", minHeight: "38px", flexWrap: "wrap", gap: "4px" }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedLabels.length > 0 ? (
          <div className="d-flex flex-wrap gap-1">
            {selectedLabels.map((lbl, i) => (
              <span
                key={i}
                className="badge"
                style={{ background: "#1a3c5e", fontSize: "12px", padding: "4px 8px" }}
              >
                {lbl}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted">{placeholder || `Select ${label}`}</span>
        )}
        <span style={{ marginLeft: "8px" }}>&#9660;</span>
      </div>

      {open && (
        <div
          className="border rounded bg-white"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1050,
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {items.length === 0 ? (
            <div className="px-3 py-2 text-muted" style={{ fontSize: "13px" }}>
              No items available
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item[idKey]}
                className="d-flex align-items-center px-3 py-2"
                style={{ cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                onClick={() => onToggle(item[idKey])}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selectedIds.includes(item[idKey])}
                  style={{ marginRight: "10px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "14px" }}>{item[labelKey]}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const CombinationsForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  // ── Category / SubCategory ─────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");

  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [subcategoryLabel, setSubcategoryLabel] = useState("");

  // ── Basic fields ───────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(""); // ✅ FIX: store existing image path
  const [isActive, setIsActive] = useState(true);

  // ── Module toggles ─────────────────────────────────────────────────────────
  const [includesLectures, setIncludesLectures] = useState(false);
  const [includesNotes, setIncludesNotes] = useState(false);
  const [includesPrelims, setIncludesPrelims] = useState(false);
  const [includesMains, setIncludesMains] = useState(false);

  // ── Lecture config ─────────────────────────────────────────────────────────
  const [lectureAccessType, setLectureAccessType] = useState("law-based");
  const [lectureLaws, setLectureLaws] = useState([]);
  const [lectureLawId, setLectureLawId] = useState("");
  const [lectureSubjects, setLectureSubjects] = useState([]);
  const [lectureSubjectIds, setLectureSubjectIds] = useState([]);

  // ── Notes config ───────────────────────────────────────────────────────────
  const [notesAccessType, setNotesAccessType] = useState("law-based");
  const [notesLaws, setNotesLaws] = useState([]);
  const [notesLawId, setNotesLawId] = useState("");
  const [notesSubjects, setNotesSubjects] = useState([]);
  const [notesSubjectIds, setNotesSubjectIds] = useState([]);

  // ── Prelims / Mains ────────────────────────────────────────────────────────
  const [prelimsList, setRelimsList] = useState([]);
  const [mainsList, setMainsList] = useState([]);
  const [prelimsId, setPrelimsId] = useState("");
  const [mainsId, setMainsId] = useState("");

  const [loading, setLoading] = useState(false);

  // ── Fetch prelims & mains on mount ─────────────────────────────────────────
  useEffect(() => {
    const fetchPrelimsAndMains = async () => {
      try {
        const [prelRes, mainRes] = await Promise.all([
          getPrelims(1, 10),
          getMains(1, 10),
        ]);
        setRelimsList(prelRes.data || []);
        setMainsList(mainRes.data || []);
      } catch (err) {
        console.error("Failed to fetch prelims/mains", err);
      }
    };
    fetchPrelimsAndMains();
  }, []);

  // ── Fetch categories ───────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories(1, 10);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Prefill when editing ───────────────────────────────────────────────────
  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);

      setIncludesLectures(!!initialData.includes_lectures);
      setIncludesNotes(!!initialData.includes_notes);
      setIncludesPrelims(!!initialData.includes_prelimes);
      setIncludesMains(!!initialData.includes_mains);

      // ✅ FIX: store existing image as plain string state
      setExistingImage(initialData.presentation_image || "");

      setPrelimsId(
        initialData.prelimes_id ||
        (initialData.prelimes_details && initialData.prelimes_details[0]?.prelimes_id) ||
        ""
      );
      setMainsId(
        initialData.mains_id ||
        (initialData.mains_details && initialData.mains_details[0]?.mains_id) ||
        ""
      );

      if (initialData.lecture_config) {
        const lc = initialData.lecture_config;
        setLectureAccessType(lc.access_type || "law-based");
        setLectureLawId(lc.law_id || "");
        setLectureSubjectIds(lc.subject_ids || []);
      }

      if (initialData.notes_config) {
        const nc = initialData.notes_config;
        setNotesAccessType(nc.access_type || "law-based");
        setNotesLawId(nc.law_id || "");
        setNotesSubjectIds(nc.subject_ids || []);
      }

      const prefillDropdowns = async () => {
        try {
          let catId = initialData.categoryId || "";
          let catTitle = "";
          let subId = initialData.subcategory_id || "";
          let subTitle = "";

          if (!catId && subId && categories.length > 0) {
            for (let i = 0; i < categories.length; i++) {
              const cat = categories[i];
              const res = await getSubCategoriesByCategory({ categoryId: cat.categoryId });
              const subList = res.data || [];
              const found = subList.find((s) => s.subcategory_id === subId);
              if (found) {
                catId = cat.categoryId;
                catTitle = cat.category_name;
                subTitle = found.title;
                break;
              }
            }
          } else if (catId) {
            const found = categories.find((c) => c.categoryId === catId);
            catTitle = found?.category_name || "";
          }

          setCategoryId(catId);
          setCategoryLabel(catTitle);

          if (catId) {
            const subRes = await getSubCategoriesByCategory({ categoryId: catId });
            const subList = subRes.data || [];
            setSubcategories(subList);
            if (!subTitle && subId) {
              const found = subList.find((s) => s.subcategory_id === subId);
              subTitle = found?.title || "";
            }
          }

          setSubcategoryId(subId);
          setSubcategoryLabel(subTitle);

          if (subId) {
            const lawRes = await getLaswsBySubCategory({ subcategory_id: subId });
            const lawList = lawRes.data || [];
            setLectureLaws(lawList);
            setNotesLaws(lawList);
          }

          const lc = initialData.lecture_config || {};
          if (lc.access_type === "subject-based" && lc.law_id) {
            const subjectRes = await getlawBySubjects({ law_id: lc.law_id });
            setLectureSubjects(subjectRes.data || []);
          }

          const nc = initialData.notes_config || {};
          if (nc.access_type === "subject-based" && nc.law_id) {
            const subjectRes = await getlawBySubjects({ law_id: nc.law_id });
            setNotesSubjects(subjectRes.data || []);
          }
        } catch (err) {
          console.error("Prefill failed:", err);
        }
      };

      if (categories.length > 0) prefillDropdowns();
    }
  }, [isEdit, initialData, categories]);

  // ── Category change ────────────────────────────────────────────────────────
  const handleCategoryChange = async (e) => {
    const val = e.target.value;
    setCategoryId(val);
    setSubcategoryId("");
    resetAllConfigs();
    setSubcategories([]);
    setLectureLaws([]);
    setNotesLaws([]);
    if (val) {
      const res = await getSubCategoriesByCategory({ categoryId: val });
      setSubcategories(res.data || []);
    }
  };

  // ── SubCategory change ─────────────────────────────────────────────────────
  const handleSubcategoryChange = async (e) => {
    const val = e.target.value;
    setSubcategoryId(val);
    resetAllConfigs();
    setLectureLaws([]);
    setNotesLaws([]);
    if (val) {
      const res = await getLaswsBySubCategory({ subcategory_id: val });
      const lawList = res.data || [];
      setLectureLaws(lawList);
      setNotesLaws(lawList);
    }
  };

  const resetAllConfigs = () => {
    setLectureLawId("");
    setLectureSubjectIds([]);
    setLectureSubjects([]);
    setLectureAccessType("law-based");
    setNotesLawId("");
    setNotesSubjectIds([]);
    setNotesSubjects([]);
    setNotesAccessType("law-based");
  };

  // ── Lecture handlers ───────────────────────────────────────────────────────
  const handleLectureLawChange = async (e) => {
    const val = e.target.value;
    setLectureLawId(val);
    setLectureSubjectIds([]);
    setLectureSubjects([]);
    if (val && lectureAccessType === "subject-based") {
      const res = await getlawBySubjects({ law_id: val });
      setLectureSubjects(res.data || []);
    }
  };

  const handleLectureAccessTypeChange = async (e) => {
    const val = e.target.value;
    setLectureAccessType(val);
    setLectureSubjectIds([]);
    setLectureSubjects([]);
    if (val === "subject-based" && lectureLawId) {
      const res = await getlawBySubjects({ law_id: lectureLawId });
      setLectureSubjects(res.data || []);
    }
  };

  // ── Notes handlers ─────────────────────────────────────────────────────────
  const handleNotesLawChange = async (e) => {
    const val = e.target.value;
    setNotesLawId(val);
    setNotesSubjectIds([]);
    setNotesSubjects([]);
    if (val && notesAccessType === "subject-based") {
      const res = await getlawBySubjects({ law_id: val });
      setNotesSubjects(res.data || []);
    }
  };

  const handleNotesAccessTypeChange = async (e) => {
    const val = e.target.value;
    setNotesAccessType(val);
    setNotesSubjectIds([]);
    setNotesSubjects([]);
    if (val === "subject-based" && notesLawId) {
      const res = await getlawBySubjects({ law_id: notesLawId });
      setNotesSubjects(res.data || []);
    }
  };

  // ── Toggle helper ──────────────────────────────────────────────────────────
  const toggleItem = (id, list, setList) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) return Swal.fire("Validation", "Please select a Category", "warning");
    if (!subcategoryId) return Swal.fire("Validation", "Please select a Sub Category", "warning");
    if (!title.trim()) return Swal.fire("Validation", "Please enter a Title", "warning");

    let lectureConfig = undefined;
    if (includesLectures) {
      if (!lectureLawId) return Swal.fire("Validation", "Please select a Law for Lectures", "warning");
      if (lectureAccessType === "law-based") {
        lectureConfig = { access_type: "law-based", law_id: lectureLawId };
      } else {
        if (!lectureSubjectIds.length) return Swal.fire("Validation", "Please select at least one Subject for Lectures", "warning");
        lectureConfig = { access_type: "subject-based", law_id: lectureLawId, subject_ids: lectureSubjectIds };
      }
    }

    let notesConfig = undefined;
    if (includesNotes) {
      if (!notesLawId) return Swal.fire("Validation", "Please select a Law for Notes", "warning");
      if (notesAccessType === "law-based") {
        notesConfig = { access_type: "law-based", law_id: notesLawId };
      } else {
        if (!notesSubjectIds.length) return Swal.fire("Validation", "Please select at least one Subject for Notes", "warning");
        notesConfig = { access_type: "subject-based", law_id: notesLawId, subject_ids: notesSubjectIds };
      }
    }

    const formatmainsId = mainsId ? [mainsId] : [];
    const formatprelimesId = prelimsId ? [prelimsId] : [];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("subcategory_id", subcategoryId);
    formData.append("includes_lectures", includesLectures);
    formData.append("includes_notes", includesNotes);
    formData.append("includes_prelimes", includesPrelims);
    formData.append("includes_mains", includesMains);
    formData.append("mains_ids", JSON.stringify(formatmainsId));
    formData.append("prelimes_ids", JSON.stringify(formatprelimesId));
    formData.append("isActive", isActive);
    if (lectureConfig) formData.append("lecture_config", JSON.stringify(lectureConfig));
    if (notesConfig) formData.append("notes_config", JSON.stringify(notesConfig));

    // ✅ FIX: use existingImage state instead of initialData directly
    if (image) {
      formData.append("presentation_image", image);         // new file selected (File object)
    } else if (isEdit && existingImage) {
      formData.append("presentation_image", existingImage); // keep existing filename string
    }

    try {
      setLoading(true);
      if (isEdit) {
        formData.append("combo_id", initialData.combo_id);
        await updateCombinations(formData);
      } else {
        await addCombinations(formData);
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

        {/* Description */}
        <div className="col-md-6 mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Category */}
        <div className="col-md-6 mb-3">
          <label>
            Category <span style={{ color: "red" }}>*</span>
          </label>

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
          <label>
            Sub Category <span style={{ color: "red" }}>*</span>
          </label>

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

        {/* Presentation Image */}
        <div className="col-md-6 mb-3">
          <label>Presentation Image</label>
          {isEdit && existingImage && (
            <div className="mb-2">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${existingImage}`}
                alt="Previous"
                style={{ height: "80px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>
          )}
          <input
            type="file"
            className="form-control"
            accept="image/*"
            key={isEdit ? initialData?.combo_id : "new"}
            onChange={(e) => setImage(e.target.files[0] || null)}
          />
        </div>

        {/* isActive */}
        <div className="col-md-6 mb-3 d-flex align-items-center gap-3 mt-4">
          <label className="mb-0">Is Active</label>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

      </div>

      {/* ── Module Toggles ───────────────────────────────────────────────── */}
      <hr />
      <h6 className="mb-3 fw-bold">Modules</h6>
      <div className="row mb-3">

        {/* Lectures */}
        <div className="col-md-3 mb-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="includesLectures"
              checked={includesLectures}
              onChange={(e) => {
                setIncludesLectures(e.target.checked);
                if (!e.target.checked) {
                  setLectureLawId("");
                  setLectureSubjectIds([]);
                  setLectureSubjects([]);
                  setLectureAccessType("law-based");
                }
              }}
              style={{ cursor: "pointer" }}
            />
            <label className="form-check-label" htmlFor="includesLectures">Lectures</label>
          </div>
        </div>

        {/* Notes */}
        <div className="col-md-3 mb-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="includesNotes"
              checked={includesNotes}
              onChange={(e) => {
                setIncludesNotes(e.target.checked);
                if (!e.target.checked) {
                  setNotesLawId("");
                  setNotesSubjectIds([]);
                  setNotesSubjects([]);
                  setNotesAccessType("law-based");
                }
              }}
              style={{ cursor: "pointer" }}
            />
            <label className="form-check-label" htmlFor="includesNotes">Notes</label>
          </div>
        </div>

        {/* Prelims */}
        <div className="col-md-3 mb-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="includesPrelims"
              checked={includesPrelims}
              onChange={(e) => {
                setIncludesPrelims(e.target.checked);
                if (!e.target.checked) setPrelimsId("");
              }}
              style={{ cursor: "pointer" }}
            />
            <label className="form-check-label" htmlFor="includesPrelims">Prelims</label>
          </div>
        </div>

        {/* Mains */}
        <div className="col-md-3 mb-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="includesMains"
              checked={includesMains}
              onChange={(e) => {
                setIncludesMains(e.target.checked);
                if (!e.target.checked) setMainsId("");
              }}
              style={{ cursor: "pointer" }}
            />
            <label className="form-check-label" htmlFor="includesMains">Mains</label>
          </div>
        </div>

      </div>

      {/* ── Lecture Config ───────────────────────────────────────────────── */}
      {includesLectures && (
        <>
          <hr />
          <h6 className="mb-3 fw-bold">Lecture Configuration</h6>
          <div className="row">

            <div className="col-md-4 mb-3">
              <label>Access Type</label>
              <select
                style={{ cursor: isEdit && !!initialData?.includes_lectures ? "not-allowed" : "pointer" }}
                className="form-control form-select"
                value={lectureAccessType}
                onChange={handleLectureAccessTypeChange}
                disabled={isEdit && !!initialData?.includes_lectures}
              >
                <option value="law-based">Law Based</option>
                <option value="subject-based">Subject Based</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label>Law</label>
              <select
                style={{ cursor: isEdit && !!initialData?.includes_lectures ? "not-allowed" : "pointer" }}
                className="form-control form-select"
                value={lectureLawId}
                onChange={handleLectureLawChange}
                disabled={isEdit && !!initialData?.includes_lectures}
              >
                <option value="">Select Law</option>
                {lectureLaws.map((l) => (
                  <option key={l.lawId} value={l.lawId}>{l.title}</option>
                ))}
              </select>
            </div>

            {lectureAccessType === "subject-based" && lectureSubjects.length > 0 && (
              <div className="col-md-4 mb-3">
                <label>Subjects (select multiple)</label>
                {isEdit && !!initialData?.includes_lectures ? (
                  <div
                    className="form-control"
                    style={{ minHeight: "38px", backgroundColor: "#e9ecef", cursor: "not-allowed", display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {lectureSubjects
                      .filter((s) => lectureSubjectIds.includes(s.subjectId))
                      .map((s) => (
                        <span key={s.subjectId} className="badge" style={{ background: "#1a3c5e", fontSize: "12px", padding: "4px 8px" }}>
                          {s.title}
                        </span>
                      ))}
                  </div>
                ) : (
                  <MultiSelectDropdown
                    label="Subjects"
                    items={lectureSubjects}
                    selectedIds={lectureSubjectIds}
                    onToggle={(id) => toggleItem(id, lectureSubjectIds, setLectureSubjectIds)}
                    idKey="subjectId"
                    labelKey="title"
                    placeholder="Select Subjects"
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Notes Config ─────────────────────────────────────────────────── */}
      {includesNotes && (
        <>
          <hr />
          <h6 className="mb-3 fw-bold">Notes Configuration</h6>
          <div className="row">

            <div className="col-md-4 mb-3">
              <label>Access Type</label>
              <select
                style={{ cursor: isEdit && !!initialData?.includes_notes ? "not-allowed" : "pointer" }}
                className="form-control form-select"
                value={notesAccessType}
                onChange={handleNotesAccessTypeChange}
                disabled={isEdit && !!initialData?.includes_notes}
              >
                <option value="law-based">Law Based</option>
                <option value="subject-based">Subject Based</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label>Law</label>
              <select
                style={{ cursor: isEdit && !!initialData?.includes_notes ? "not-allowed" : "pointer" }}
                className="form-control form-select"
                value={notesLawId}
                onChange={handleNotesLawChange}
                disabled={isEdit && !!initialData?.includes_notes}
              >
                <option value="">Select Law</option>
                {notesLaws.map((l) => (
                  <option key={l.lawId} value={l.lawId}>{l.title}</option>
                ))}
              </select>
            </div>

            {notesAccessType === "subject-based" && notesSubjects.length > 0 && (
              <div className="col-md-4 mb-3">
                <label>Subjects (select multiple)</label>
                {isEdit && !!initialData?.includes_notes ? (
                  <div
                    className="form-control"
                    style={{ minHeight: "38px", backgroundColor: "#e9ecef", cursor: "not-allowed", display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {notesSubjects
                      .filter((s) => notesSubjectIds.includes(s.subjectId))
                      .map((s) => (
                        <span key={s.subjectId} className="badge" style={{ background: "#1a3c5e", fontSize: "12px", padding: "4px 8px" }}>
                          {s.title}
                        </span>
                      ))}
                  </div>
                ) : (
                  <MultiSelectDropdown
                    label="Subjects"
                    items={notesSubjects}
                    selectedIds={notesSubjectIds}
                    onToggle={(id) => toggleItem(id, notesSubjectIds, setNotesSubjectIds)}
                    idKey="subjectId"
                    labelKey="title"
                    placeholder="Select Subjects"
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Prelims & Mains Config — side by side ─────────────────────── */}
      {(includesPrelims || includesMains) && (
        <>
          <hr />
          <div className="row">

            {includesPrelims && (
              <div className="col-md-6">
                <h6 className="mb-3 fw-bold">Prelims Configuration</h6>
                <div className="mb-3">
                  <label>Select Prelims</label>
                  <select
                    style={{ cursor: isEdit && !!initialData?.includes_prelimes ? "not-allowed" : "pointer" }}
                    className="form-control form-select"
                    value={prelimsId}
                    onChange={(e) => setPrelimsId(e.target.value)}
                    disabled={isEdit && !!initialData?.includes_prelimes}
                  >
                    <option value="">Select Prelims</option>
                    {prelimsList.map((p) => (
                      <option key={p.prelimes_id} value={p.prelimes_id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {includesMains && (
              <div className="col-md-6">
                <h6 className="mb-3 fw-bold">Mains Configuration</h6>
                <div className="mb-3">
                  <label>Select Mains</label>
                  <select
                    style={{ cursor: isEdit && !!initialData?.includes_mains ? "not-allowed" : "pointer" }}
                    className="form-control form-select"
                    value={mainsId}
                    onChange={(e) => setMainsId(e.target.value)}
                    disabled={isEdit && !!initialData?.includes_mains}
                  >
                    <option value="">Select Mains</option>
                    {mainsList.map((m) => (
                      <option key={m.mains_id} value={m.mains_id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <hr />
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

export default CombinationsForm;