import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { addCategories, updateCategories } from "../../services/authService";
import "../form.css";


function CategoriesForm({ onClose, isEdit, initialData, onSubmit }) {
  const [categoryName, setCategoryName] = useState("");
  const [tagText, setTagText] = useState("");
  const [presentationFile, setPresentationFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && initialData) {
      setCategoryName(initialData.category_name || "");
      setTagText(initialData.tag_text || "");
      setPresentationFile(null);
      setPreviewUrl(null);
    }
  }, [isEdit, initialData]);

  // Compress image before upload to avoid 413 Request Entity Too Large
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");

          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 720;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7 // 70% quality
          );
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPresentationFile(compressed);

      // Show preview
      const url = URL.createObjectURL(compressed);
      setPreviewUrl(url);

      console.log(
        `Compressed: ${(file.size / 1024).toFixed(1)} KB → ${(compressed.size / 1024).toFixed(1)} KB`
      );
    } catch (err) {
      console.error("Compression failed:", err);
      // Fallback to original if compression fails
      setPresentationFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      Swal.fire("Validation Error", "Category name is required", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("category_name", categoryName);
    formData.append("tag_text", tagText);
    if (presentationFile) formData.append("presentation_file", presentationFile);

    try {
      setLoading(true);

      let response;
      if (isEdit && initialData?.categoryId) {
        formData.append("categoryId", initialData.categoryId);
        response = await updateCategories(formData);
      } else {
        response = await addCategories(formData);
      }

      Swal.fire({
        title: isEdit ? "Updated!" : "Added!",
        text: response.message || (isEdit ? "Updated successfully" : "Added successfully"),
        icon: "success",
        position: "top-end",
        toast: true,
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
        err.response?.data?.message || "Operation failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Category Name</label>
        <input
          type="text"
          className="form-control"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter Category Name"
          required
        />
      </div>

      <div className="mb-3">
        <label>Tag Text</label>
        <input
          type="text"
          className="form-control"
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="Enter Tag Text"
        />
      </div>

      <div className="mb-3">
        <label>Presentation File</label>

        {/* Show existing image in edit mode if no new image selected */}
        {isEdit && initialData?.presentation_file && !previewUrl && (
          <div className="mb-2">
            <img
              src={`${process.env.REACT_APP_API_BASE_URL}/${initialData.presentation_file}`}
              alt="Current"
              style={{
                height: "80px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
            <p className="text-muted small mt-1">Current image — upload a new one to replace it</p>
          </div>
        )}

        {/* Preview of newly selected compressed image */}
        {previewUrl && (
          <div className="mb-2">
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                height: "80px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
            <p className="text-muted small mt-1">New image preview (compressed)</p>
          </div>
        )}

        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
          required={!isEdit}
        />

        {/* Compressing spinner */}
        {isCompressing && (
          <p className="text-muted small mt-1">
            <span
              className="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            Compressing image...
          </p>
        )}
      </div>

      <div className="text-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-success"
          disabled={loading || isCompressing}
        >
          {isCompressing ? "Processing..." : loading ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default CategoriesForm;