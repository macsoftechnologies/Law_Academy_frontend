import React, { useEffect, useState } from "react";
import "../forms/form.css";
import { getMains, getMainsTestSeriesById } from "../services/authService";

/* ── simple image picker: compresses if > 1MB, else uses as-is ── */
const pickImage = (file, onSuccess, onError) => {
  if (!file) return;
  const MB = file.size / (1024 * 1024);
  if (MB <= 1) { onSuccess(file); return; }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > 1024) { height = Math.round(height * 1024 / width); width = 1024; }
      else if (height > 1024) { width = Math.round(width * 1024 / height); height = 1024; }
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { onError("Compression failed"); return; }
        const out = new File([blob], file.name, { type: "image/jpeg" });
        out.size / (1024 * 1024) > 1
          ? onError("Image still too large after compression. Please use a smaller image.")
          : onSuccess(out);
      }, "image/jpeg", 0.7);
    };
    img.onerror = () => onError("Failed to read image.");
  };
  reader.onerror = () => onError("Failed to read image.");
};

function MainsTestSeriesForm({ onClose, initialData, isEdit, onSubmit }) {
  const [title,                     setTitle]                     = useState("");
  const [noOfQs,                    setNoOfQs]                    = useState("");
  const [noOfSubjects,              setNoOfSubjects]              = useState("");
  const [termsConditions,           setTermsConditions]           = useState("");
  const [presentationImage,         setPresentationImage]         = useState(null);
  const [mainsId,                   setMainsId]                   = useState("");
  const [mainsList,                 setMainsList]                 = useState([]);
  const [existingPresentationImage, setExistingPresentationImage] = useState(null);
  const [fetching,                  setFetching]                  = useState(false);
  const [imageError,                setImageError]                = useState("");

  /* ── fetch mains dropdown ── */
  useEffect(() => {
    getMains(1, 10)
      .then((res) => setMainsList(res.data || []))
      .catch(() => setMainsList([]));
  }, []);

  useEffect(() => {
    if (!isEdit || !initialData?.mains_test_id) return;
    setFetching(true);
    getMainsTestSeriesById(initialData.mains_test_id)
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data[0] : res.data || {};
        setTitle(d.title || "");
        setNoOfQs(d.no_of_qs || "");
        setNoOfSubjects(d.no_of_subjects || "");
        setTermsConditions(d.terms_conditions || "");
        setExistingPresentationImage(d.presentation_image || null);
        setPresentationImage(null);
        setImageError("");
        const mid = Array.isArray(d.mains_id)
          ? d.mains_id[0]?.mains_id || "" : d.mains_id || "";
        setMainsId(mid);
      })
      .catch(() => {
        setTitle(initialData.title || "");
        setNoOfQs(initialData.no_of_qs || "");
        setNoOfSubjects(initialData.no_of_subjects || "");
        setTermsConditions(initialData.terms_conditions || "");
        setExistingPresentationImage(initialData.presentation_image || null);
        const mid = Array.isArray(initialData.mains_id)
          ? initialData.mains_id[0]?.mains_id || "" : initialData.mains_id || "";
        setMainsId(mid);
      })
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.mains_test_id, isEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    pickImage(
      file,
      (result) => setPresentationImage(result),
      (err)    => { setImageError(err); setPresentationImage(null); e.target.value = ""; }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && !presentationImage) {
      setImageError("Please select a presentation image.");
      return;
    }
    const formData = new FormData();
    formData.append("title",            title);
    formData.append("no_of_qs",         noOfQs);
    formData.append("no_of_subjects",   noOfSubjects);
    formData.append("terms_conditions", termsConditions);
    formData.append("mains_id",         mainsId);
    if (presentationImage) formData.append("presentation_image", presentationImage);
    if (isEdit && initialData?.mains_test_id) formData.append("mains_test_id", initialData.mains_test_id);
    onSubmit(formData);
    onClose();
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <div className="mt-2 text-muted">Loading test series details...</div>
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title" required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Mains</label>
          <select
            className="form-control"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
            value={mainsId}
            onChange={(e) => setMainsId(e.target.value)}
            disabled={isEdit}
            required
          >
            <option value="">Select Mains</option>
            {mainsList.map((m) => (
              <option key={m.mains_id} value={m.mains_id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">No. of Questions</label>
          <input
            type="number" className="form-control" value={noOfQs}
            onChange={(e) => setNoOfQs(e.target.value)}
            placeholder="Enter No. of Questions" required min={1}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">No. of Subjects</label>
          <input
            type="number" className="form-control" value={noOfSubjects}
            onChange={(e) => setNoOfSubjects(e.target.value)}
            placeholder="Enter No. of Subjects" required min={1}
          />
        </div>

        <div className="col-md-12 mb-3">
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
          {isEdit ? "Update Test Series" : "Add Test Series"}
        </button>
      </div>
    </form>
  );
}

export default MainsTestSeriesForm;