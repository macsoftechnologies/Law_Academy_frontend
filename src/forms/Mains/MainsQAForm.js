import React, { useEffect, useState } from "react";
import "../form.css";
import { getMains, getQAById } from "../../services/authService";

function MainsQAForm({ onClose, initialData, isEdit, onSubmit }) {
  const [title, setTitle]                                         = useState("");
  const [noOfQs, setNoOfQs]                                       = useState("");
  const [videoUrl, setVideoUrl]                                   = useState("");
  const [pdfUrl, setPdfUrl]                                       = useState("");
  const [durationValue, setDurationValue]                         = useState("");
  const [durationUnit, setDurationUnit]                           = useState("mins");
  const [moduleId, setModuleId]                                   = useState("");
  const [presentationImage, setPresentationImage]                 = useState(null);
  const [existingPresentationImage, setExistingPresentationImage] = useState(null);
  const [mainsList, setMainsList]                                 = useState([]);
  const [fetching, setFetching]                                   = useState(false);
  const [imageError, setImageError]                               = useState("");

  const MAX_FILE_SIZE_MB = 1;

  const parseDuration = (durationStr) => {
    if (!durationStr) return { value: "", unit: "mins" };
    const str = durationStr.toString().toLowerCase().trim();
    if (str.includes("hr")) {
      const match = str.match(/(\d+)/);
      return { value: match ? match[1] : "", unit: "Hours" };
    }
    const match = str.match(/(\d+)/);
    return { value: match ? match[1] : "", unit: "mins" };
  };

  const buildDurationString = (value, unit) => {
    if (!value) return "";
    return `${value} ${unit}`;
  };

  useEffect(() => {
    const fetchMainsList = async () => {
      try {
        const res = await getMains(1, 10);
        setMainsList(res.data || []);
      } catch (err) {
        setMainsList([]);
      }
    };
    fetchMainsList();
  }, []);

  useEffect(() => {
    if (!isEdit || !initialData?.qa_id) return;

    const loadFullRecord = async () => {
      setFetching(true);
      try {
        const res = await getQAById(initialData.qa_id);
        const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};

        setTitle(d.title || "");
        setNoOfQs(d.no_of_qs || "");
        setVideoUrl(d.video_url || "");
        setPdfUrl(d.pdf_url || "");
        const parsed = parseDuration(d.duration);
        setDurationValue(parsed.value);
        setDurationUnit(parsed.unit);
        setModuleId(d.module_id || "");
        setExistingPresentationImage(d.presentation_image || null);
        setPresentationImage(null);
        setImageError("");
      } catch (err) {
        setTitle(initialData.title || "");
        setNoOfQs(initialData.no_of_qs || "");
        setVideoUrl(initialData.video_url || "");
        setPdfUrl(initialData.pdf_url || "");
        const parsed = parseDuration(initialData.duration);
        setDurationValue(parsed.value);
        setDurationUnit(parsed.unit);
        setModuleId(initialData.module_id || "");
        setExistingPresentationImage(initialData.presentation_image || null);
      } finally {
        setFetching(false);
      }
    };

    loadFullRecord();
  }, [initialData?.qa_id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && !presentationImage) {
      setImageError("Please select a presentation image.");
      return;
    }

    const formData = new FormData();
    formData.append("title",       title);
    formData.append("no_of_qs",    noOfQs);
    formData.append("video_url",   videoUrl);
    formData.append("pdf_url",     pdfUrl);
    formData.append("duration",    buildDurationString(durationValue, durationUnit));
    formData.append("module",      "mains");
    formData.append("module_type", "MQA");
    formData.append("module_id",   moduleId);
    if (presentationImage) formData.append("presentation_image", presentationImage);
    if (isEdit && initialData?.qa_id) formData.append("qa_id", initialData.qa_id);

    onSubmit(formData);
    onClose();
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <div className="mt-2 text-muted">Loading QA details...</div>
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
          <label className="form-label">No. of Questions</label>
          <input
            type="number" className="form-control" value={noOfQs}
            onChange={(e) => setNoOfQs(e.target.value)} placeholder="Enter No. of Questions" required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Module (Mains)</label>
          <select
            className="form-control form-select"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            disabled={isEdit}
            required
          >
            <option value="">Select Mains</option>
            {mainsList.map((m) => (
              <option key={m.mains_id} value={m.mains_id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Duration</label>
          <div className="d-flex gap-2">
            <input
              type="number"
              className="form-control"
              value={durationValue}
              onChange={(e) => setDurationValue(e.target.value)}
              placeholder="e.g. 30"
              min="1"
              required
            />
            <select
              className="form-control"
              style={{ maxWidth: "140px", cursor: "pointer" }}
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
            >
              <option value="mins">Minutes</option>
              <option value="Hours">Hours</option>
            </select>
          </div>
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
          <label className="form-label">Video URL</label>
          <input
            type="url" className="form-control" value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/..."
          />
        </div>

        <div className="col-md-12 mb-3">
          <label className="form-label">PDF URL</label>
          <input
            type="url" className="form-control" value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://..."
          />
        </div>

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update QA" : "Add QA"}
        </button>
      </div>
    </form>
  );
}

export default MainsQAForm;