import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import {
  addLectures,
  updateLectures,
  getCategories,
  getSubCategoriesByCategory,
  getLaswsBySubCategory,
  getSubjectsByLaw,
} from "../services/authService";

const LecturesForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [laws, setLaws] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [lawId, setLawId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [lectureNo, setLectureNo] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [notesUrl, setNotesUrl] = useState("");

  const [loading, setLoading] = useState(false);

  // Flag to prevent useEffect cascade from resetting values during edit prefill
  const isPrefilling = useRef(false);

  // Fetch functions
  const fetchCategories = useCallback(async () => {
    const res = await getCategories(1, 1000);
    setCategories(res.data || []);
  }, []);

  const fetchSubCategories = useCallback(async (id) => {
    if (!id) return setSubcategories([]);
    const res = await getSubCategoriesByCategory({ categoryId: id });
    setSubcategories(res.data || []);
  }, []);

  const fetchLaws = useCallback(async (id) => {
    if (!id) return setLaws([]);
    const res = await getLaswsBySubCategory({ subcategory_id: id });
    setLaws(res.data || []);
  }, []);

  const fetchSubjects = useCallback(async (id) => {
    if (!id) return setSubjects([]);
    const res = await getSubjectsByLaw({ law_id: id });
    setSubjects(res.data || []);
  }, []);

  // Initial fetch categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Populate form when editing — fetch all dependent dropdowns at once
  useEffect(() => {
    if (isEdit && initialData) {
      isPrefilling.current = true;

      setLectureNo(initialData.lecture_no || "");
      setTitle(initialData.title || "");
      setAuthor(initialData.author || "");
      setDescription(initialData.description || "");
      setVideoUrl(initialData.video_url || "");
      setThumbnailUrl(initialData.thumbnail_image_url || "");
      setNotesUrl(initialData.notes_pdf_url || "");

      const catId = Array.isArray(initialData.categoryId)
        ? initialData.categoryId[0]?.categoryId || initialData.categoryId[0]?._id || ""
        : initialData.categoryId || "";

      const subCatId = Array.isArray(initialData.subcategory_id)
        ? initialData.subcategory_id[0]?.subcategory_id || initialData.subcategory_id[0]?._id || ""
        : initialData.subcategory_id || "";

      const lId = Array.isArray(initialData.lawId)
        ? initialData.lawId[0]?.lawId || initialData.lawId[0]?._id || ""
        : initialData.lawId || "";

      const sId = Array.isArray(initialData.subjectId)
        ? initialData.subjectId[0]?.subjectId || initialData.subjectId[0]?._id || ""
        : initialData.subjectId || "";

      setCategoryId(catId);
      setSubcategoryId(subCatId);
      setLawId(lId);
      setSubjectId(sId);

      // Fetch all dependent dropdowns sequentially
      const fetchAll = async () => {
        if (catId) await fetchSubCategories(catId);
        if (subCatId) await fetchLaws(subCatId);
        if (lId) await fetchSubjects(lId);
        isPrefilling.current = false;
      };

      fetchAll();
    }
  }, [isEdit, initialData, fetchSubCategories, fetchLaws, fetchSubjects]);

  // Cascade reset only when user manually changes (not during prefill)
  useEffect(() => {
    if (isPrefilling.current) return;
    if (!isEdit || categoryId) {
      fetchSubCategories(categoryId);
    }
    if (!isEdit) {
      setSubcategoryId("");
      setLawId("");
      setSubjectId("");
      setLaws([]);
      setSubjects([]);
    }
  }, [categoryId]); // eslint-disable-line

  useEffect(() => {
    if (isPrefilling.current) return;
    if (subcategoryId) {
      fetchLaws(subcategoryId);
    }
    if (!isEdit) {
      setLawId("");
      setSubjectId("");
      setSubjects([]);
    }
  }, [subcategoryId]); // eslint-disable-line

  useEffect(() => {
    if (isPrefilling.current) return;
    if (lawId) {
      fetchSubjects(lawId);
    }
    if (!isEdit) {
      setSubjectId("");
    }
  }, [lawId]); // eslint-disable-line

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      lecture_no: lectureNo,
      title,
      author,
      description,
      video_url: videoUrl,
      thumbnail_image_url: thumbnailUrl,
      notes_pdf_url: notesUrl,
      subjectId,
      lawId,
      subcategory_id: subcategoryId,
      categoryId,
    };

    if (isEdit && initialData?.lectureId) {
      payload.lectureId = initialData.lectureId;
    }

    try {
      setLoading(true);
      let response;

      if (isEdit) {
        response = await updateLectures(payload);
      } else {
        response = await addLectures(payload);
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          typeof response.message === "string" && response.message
            ? response.message
            : isEdit
            ? "Updated successfully"
            : "Added successfully",
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
        err.response?.data?.message?.stringValue ||
          err.response?.data?.message ||
          "Save failed",
        "error"
      );
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
            className="form-control form-select"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isEdit}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div className="col-md-6 mb-3">
          <label>Sub Category</label>
          <select
            className="form-control form-select"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
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

        {/* Law */}
        <div className="col-md-6 mb-3">
          <label>Law</label>
          <select
            className="form-control form-select"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
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

        {/* Subject */}
        <div className="col-md-6 mb-3">
          <label>Subject</label>
          <select
            className="form-control form-select"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.subjectId} value={s.subjectId}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Lecture No */}
        <div className="col-md-4 mb-3">
          <label>Lecture No</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Lecture Number"
            value={lectureNo}
            onChange={(e) => setLectureNo(e.target.value)}
          />
        </div>

        {/* Title */}
        <div className="col-md-8 mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Author */}
        <div className="col-md-6 mb-3">
          <label>Author</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Author Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        {/* Video URL */}
        <div className="col-md-6 mb-3">
          <label>Video URL</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        {/* Thumbnail */}
        <div className="col-md-6 mb-3">
          <label>Thumbnail URL</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Thumbnail URL"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="col-md-6 mb-3">
          <label>Notes PDF URL</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Notes PDF URL"
            value={notesUrl}
            onChange={(e) => setNotesUrl(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="col-md-12 mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

export default LecturesForm;