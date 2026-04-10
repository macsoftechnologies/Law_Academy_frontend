import React, { useEffect, useState } from "react";
import "../forms/form.css";
import { getSubCategories, getMainsById } from "../services/authService";

function MainsForm({ onClose, initialData, isEdit, onSubmit }) {
  const [title, setTitle]                                         = useState("");
  const [subTitle, setSubTitle]                                   = useState("");
  const [aboutCourse, setAboutCourse]                             = useState("");
  const [coursePoints, setCoursePoints]                           = useState([""]);
  const [termsConditions, setTermsConditions]                     = useState("");
  const [presentationImage, setPresentationImage]                 = useState(null);
  const [subcategoryId, setSubcategoryId]                         = useState("");
  const [subcategories, setSubcategories]                         = useState([]);
  const [existingPresentationImage, setExistingPresentationImage] = useState(null);
  const [fetching, setFetching]                                   = useState(false);
  const [imageError, setImageError]                               = useState("");

  const MAX_FILE_SIZE_MB = 1;

  const plusBtn = {
    border: "none", background: "none", color: "#28a745",
    fontWeight: "bold", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
  };
  const minusBtn = {
    border: "none", background: "none", color: "#dc3545",
    fontWeight: "bold", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await getSubCategories(1, 1000);
        setSubcategories(res.data || []);
      } catch (err) {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (!isEdit || !initialData?.mains_id) return;

    const loadFullRecord = async () => {
      setFetching(true);
      try {
        const res = await getMainsById(initialData.mains_id);
        const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};

        setTitle(d.title || "");
        setSubTitle(d.sub_title || "");
        setAboutCourse(d.about_course || "");
        setTermsConditions(d.terms_conditions || "");
        setExistingPresentationImage(d.presentation_image || null);
        setPresentationImage(null);
        setImageError("");

        const subId = Array.isArray(d.subcategory_id)
          ? d.subcategory_id[0]?.subcategory_id || ""
          : d.subcategory_id || "";
        setSubcategoryId(subId);

        const points = Array.isArray(d.course_points) ? d.course_points : [];
        setCoursePoints(points.length > 0 ? points : [""]);
      } catch (err) {
        setTitle(initialData.title || "");
        setSubTitle(initialData.sub_title || "");
        setAboutCourse(initialData.about_course || "");
        setTermsConditions(initialData.terms_conditions || "");
        setExistingPresentationImage(initialData.presentation_image || null);

        const subId = Array.isArray(initialData.subcategory_id)
          ? initialData.subcategory_id[0]?.subcategory_id || ""
          : initialData.subcategory_id || "";
        setSubcategoryId(subId);

        const points = Array.isArray(initialData.course_points) ? initialData.course_points : [];
        setCoursePoints(points.length > 0 ? points : [""]);
      } finally {
        setFetching(false);
      }
    };

    loadFullRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.mains_id, isEdit]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width    = img.width;
          let height   = img.height;
          const MAX_DIMENSION = 1024;
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width  = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width  = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          canvas.width  = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Compression failed"));
              resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      try {
        const compressed   = await compressImage(file);
        const compressedMB = compressed.size / (1024 * 1024);
        if (compressedMB > MAX_FILE_SIZE_MB) {
          setImageError(`Image too large (${compressedMB.toFixed(2)}MB after compression). Please use a smaller image.`);
          setPresentationImage(null);
          e.target.value = "";
          return;
        }
        setPresentationImage(compressed);
      } catch (err) {
        setImageError("Failed to process image. Please try another file.");
        setPresentationImage(null);
        e.target.value = "";
      }
    } else {
      setPresentationImage(file);
    }
  };

  const addPoint    = ()          => setCoursePoints([...coursePoints, ""]);
  const removePoint = (idx)       => setCoursePoints(coursePoints.filter((_, i) => i !== idx));
  const updatePoint = (idx, val)  => setCoursePoints(coursePoints.map((p, i) => (i === idx ? val : p)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && !presentationImage) {
      setImageError("Please select a presentation image.");
      return;
    }
    const formData = new FormData();
    formData.append("title",            title);
    formData.append("sub_title",        subTitle);
    formData.append("about_course",     aboutCourse);
    formData.append("course_points",    JSON.stringify(coursePoints.filter((p) => p.trim() !== "")));
    formData.append("terms_conditions", termsConditions);
    formData.append("subcategory_id",   subcategoryId);
    if (presentationImage) formData.append("presentation_image", presentationImage);
    if (isEdit && initialData?.mains_id) formData.append("mains_id", initialData.mains_id);
    onSubmit(formData);
    onClose();
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <div className="mt-2 text-muted">Loading mains details...</div>
      </div>
    );
  }

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        <div className="col-md-6 mb-3">
          <label className="form-label">Title</label>
          <input
            type="text" className="form-control" value={title}
            onChange={(e) => setTitle(e.target.value)} placeholder="Enter Title" required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Sub Title</label>
          <input
            type="text" className="form-control" value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)} placeholder="Enter Sub Title" required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Sub Category</label>
          <select
            className="form-control form-select"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
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

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Presentation Image{" "}
            <small style={{ color: "#888", fontWeight: "normal" }}>(max 1MB, auto-compressed)</small>
          </label>
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
            className={`form-control ${imageError ? "is-invalid" : ""}`}
            accept="image/*"
            onChange={handleImageChange}
          />
          {imageError && (
            <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>{imageError}</div>
          )}
          {presentationImage && !imageError && (
            <div style={{ fontSize: "11px", color: "#28a745", marginTop: "4px" }}>
              ✓ {presentationImage.name} ({(presentationImage.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <div className="col-md-12 mb-3">
          <label className="form-label">About Course</label>
          <textarea
            className="form-control" rows={4} value={aboutCourse}
            onChange={(e) => setAboutCourse(e.target.value)}
            placeholder="Enter About Course" required
          />
        </div>

        <div className="col-md-12 mb-3">
          <div className="d-flex align-items-center mb-2 gap-2">
            <label className="form-label mb-0 fw-semibold">Course Points</label>
            <button type="button" style={plusBtn} onClick={addPoint} title="Add Point">+</button>
          </div>
          {coursePoints.map((point, idx) => (
            <div key={idx} className="d-flex align-items-center mb-2 gap-2">
              <input
                className="form-control form-control-sm"
                placeholder={`Point ${idx + 1}`}
                value={point}
                onChange={(e) => updatePoint(idx, e.target.value)}
              />
              {coursePoints.length > 1 && (
                <button type="button" style={minusBtn} onClick={() => removePoint(idx)} title="Remove point">−</button>
              )}
            </div>
          ))}
        </div>

        <div className="col-md-12 mb-3">
          <label className="form-label">Terms &amp; Conditions</label>
          <textarea
            className="form-control" rows={4} value={termsConditions}
            onChange={(e) => setTermsConditions(e.target.value)}
            placeholder="Enter Terms & Conditions" required
          />
        </div>

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Mains" : "Add Mains"}
        </button>
      </div>
    </form>
  );
}

export default MainsForm;