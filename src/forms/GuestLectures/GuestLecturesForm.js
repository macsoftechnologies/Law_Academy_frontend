import React, { useState, useEffect } from "react";
import "../form.css";

function GuestLecturesForm({
  onClose,
  initialData,
  isEdit,
  onSubmit,
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [aboutClass, setAboutClass] = useState("");
  const [aboutLecture, setAboutLecture] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [durationMins, setDurationMins] = useState("");
  const [durationSecs, setDurationSecs] = useState("");

  const [image, setImage] = useState(null);

  // Default Active = true
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setAuthor(initialData.author || "");
      setAboutClass(initialData.about_class || "");
      setAboutLecture(initialData.about_lecture || "");
      setVideoUrl(initialData.video_url || "");

      // API field => isLocked
      setIsActive(
        initialData.isLocked === true ||
          initialData.isLocked === "true"
      );

      if (initialData.duration) {
        // Parse "45 mins 30 secs"
        const minsMatch =
          initialData.duration.match(/(\d+)\s*mins/);

        const secsMatch =
          initialData.duration.match(/(\d+)\s*secs/);

        setDurationMins(minsMatch ? minsMatch[1] : "");
        setDurationSecs(secsMatch ? secsMatch[1] : "");
      }
    }
  }, [initialData, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!durationMins && !durationSecs) {
      alert("Duration is required");
      return;
    }

    // Build duration string
    let durationParts = [];

    if (durationMins) {
      durationParts.push(`${durationMins} mins`);
    }

    if (durationSecs) {
      durationParts.push(`${durationSecs} secs`);
    }

    const duration = durationParts.join(" ");

    const formData = new FormData();

    formData.append("title", title);
    formData.append("author", author);
    formData.append("about_class", aboutClass);
    formData.append("about_lecture", aboutLecture);
    formData.append("video_url", videoUrl);
    formData.append("duration", duration);

    // API expects isLocked
    formData.append("isLocked", isActive);

    if (image) {
      formData.append("presentation_image", image);
    }

    if (isEdit && initialData?.guest_lecture_id) {
      formData.append(
        "guest_lecture_id",
        initialData.guest_lecture_id
      );
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        {/* Title */}
        <div className="col-md-6 mb-2">
          <label className="form-label">
            Title
          </label>

          <input
            className="form-control"
            placeholder="Enter lecture title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />
        </div>

        {/* Author */}
        <div className="col-md-6 mb-2">
          <label className="form-label">
            Author
          </label>

          <input
            className="form-control"
            placeholder="Enter author name"
            value={author}
            onChange={(e) =>
              setAuthor(e.target.value)
            }
            required
          />
        </div>

        {/* Duration Minutes */}
        <div className="col-md-6 mb-2">
          <label className="form-label">
            Duration (Minutes)
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="45"
            min="0"
            value={durationMins}
            onChange={(e) =>
              setDurationMins(e.target.value)
            }
          />
        </div>

        {/* Duration Seconds */}
        <div className="col-md-6 mb-2">
          <label className="form-label">
            Duration (Seconds)
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="30"
            min="0"
            max="59"
            value={durationSecs}
            onChange={(e) =>
              setDurationSecs(e.target.value)
            }
          />
        </div>

        {/* Video URL */}
        <div className="col-md-6 mb-2">
          <label className="form-label">
            Video URL
          </label>

          <input
            className="form-control"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) =>
              setVideoUrl(e.target.value)
            }
          />
        </div>

        {/* Active Toggle */}
        <div className="col-md-6 mb-2 d-flex align-items-center mt-4">
          <label className="form-label me-3 mb-0">
            Is Locked
          </label>

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isActive}
              onChange={() =>
                setIsActive(!isActive)
              }
              style={{
                width: "50px",
                height: "25px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        {/* About Class */}
        <div className="col-md-12 mb-2">
          <label className="form-label">
            About Class
          </label>

          <textarea
            className="form-control"
            rows={3}
            placeholder="Write a brief description about the class..."
            value={aboutClass}
            onChange={(e) =>
              setAboutClass(e.target.value)
            }
          />
        </div>

        {/* About Lecture */}
        <div className="col-md-12 mb-2">
          <label className="form-label">
            About Lecture
          </label>

          <textarea
            className="form-control"
            rows={3}
            placeholder="Write a brief description about the lecture..."
            value={aboutLecture}
            onChange={(e) =>
              setAboutLecture(e.target.value)
            }
          />
        </div>

        {/* Presentation Image */}
        <div className="col-md-6 mb-2">
          <label className="form-label">
            Presentation Image
          </label>

          {isEdit &&
            initialData?.presentation_image && (
              <div
                style={{
                  marginBottom: "10px",
                }}
              >
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
            onChange={(e) =>
              setImage(e.target.files[0])
            }
            required={!isEdit}
          />
        </div>

      </div>

      {/* Buttons */}
      <div className="text-end mt-3">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-success"
        >
          {isEdit
            ? "Update Lecture"
            : "Add Lecture"}
        </button>
      </div>
    </form>
  );
}

export default GuestLecturesForm;