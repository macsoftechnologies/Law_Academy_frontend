import React, { useState, useEffect } from "react";
import "../forms/form.css";

function GuestLecturesForm({ onClose, initialData, isEdit, onSubmit }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [aboutClass, setAboutClass] = useState("");
  const [aboutLecture, setAboutLecture] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("mins");

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setAuthor(initialData.author || "");
      setAboutClass(initialData.about_class || "");
      setAboutLecture(initialData.about_lecture || "");
      setVideoUrl(initialData.video_url || "");

      if (initialData.duration) {
        const [value, unit] = initialData.duration.split(" ");
        setDurationValue(value || "");
        setDurationUnit(unit || "mins");
      }
    }
  }, [initialData, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!durationValue) {
      alert("Duration is required");
      return;
    }

    const duration = `${durationValue} ${durationUnit}`;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("about_class", aboutClass);
    formData.append("about_lecture", aboutLecture);
    formData.append("video_url", videoUrl);
    formData.append("duration", duration);

    if (image) {
      formData.append("presentation_image", image);
    }

    if (isEdit && initialData?.guest_lecture_id) {
      formData.append("guest_lecture_id", initialData.guest_lecture_id);
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        <div className="col-md-6 mb-2">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label">Author</label>
          <input
            className="form-control"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label">Duration</label>
          <input
            type="number"
            className="form-control"
            placeholder="30"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value)}
          >
            <option value="mins">Minutes</option>
            <option value="secs">Seconds</option>
          </select>
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label">Video URL</label>
          <input
            className="form-control"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div className="col-md-12 mb-2">
          <label className="form-label">About Class</label>
          <textarea
            className="form-control"
            rows={3}
            value={aboutClass}
            onChange={(e) => setAboutClass(e.target.value)}
          />
        </div>

        <div className="col-md-12 mb-2">
          <label className="form-label">About Lecture</label>
          <textarea
            className="form-control"
            rows={3}
            value={aboutLecture}
            onChange={(e) => setAboutLecture(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label">Presentation Image</label>
          {isEdit && initialData?.presentation_image && (
            <div style={{ marginBottom: "10px" }}>
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
            required={!isEdit}
          />
        </div>

      </div>

      <div className="text-end mt-3">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Lecture" : "Add Lecture"}
        </button>
      </div>
    </form>

  );
}

export default GuestLecturesForm;
