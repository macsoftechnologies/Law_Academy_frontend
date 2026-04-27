import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
// import Button from "../components/Button";
import Modal from "../../components/Modal";
import Swal from "sweetalert2";
import { addBanner, getBanners, deleteBanner, updateBanners } from "../../services/authService";
import "../../forms/form.css";
import { FaEye, FaTrash, FaEdit } from "react-icons/fa";
import CommonHeader from "../../components/CommonHeader";

const Banners = () => {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bannersList, setBannersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBanners = useCallback(async (page = 1, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const res = await getBanners(page, limit);
      const data = Array.isArray(res.data) ? res.data : res;
      setBannersList(data);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setBannersList([]);
      setTotalPages(1);
      Swal.fire("Error", "Failed to fetch banners", "error");
    } finally {
      setIsLoading(false);
    }
  }, [pageLimit]);

  useEffect(() => {
    fetchBanners(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchBanners]);

  const handleView = (item) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleDelete = async (bannerId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This banner will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#35a542",
      cancelButtonColor: "#8f1e1e",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteBanner({ bannerId });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Banner deleted",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#ff7a00",
        color: "#ffffff",
      });
      fetchBanners(currentPage, pageLimit);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await addBanner(formData);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Banner added",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#28a745",
        color: "#ffffff",
      });
      setOpen(false);
      fetchBanners(currentPage, pageLimit);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Add banner failed", "error");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateBanners(formData);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Banner updated",
        timer: 5000,
        showConfirmButton: false,
        background: "#28a745",
        color: "#ffffff",
      });
      setEditOpen(false);
      setSelectedItem(null);
      fetchBanners(currentPage, pageLimit);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update banner failed", "error");
    }
  };

  /* TABLE COLUMNS */
  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Banner", accessor: "banner_file" },
    { header: "Redirect Link", accessor: "redirect_link" },
    { header: "Actions", accessor: "actions" },
  ];

  /* TABLE DATA */
  const tableData = bannersList.map((item, index) => ({
    ...item,
    sno: (currentPage - 1) * pageLimit + index + 1,

    banner_file: item.banner_file ? (
      <a href={item.redirect_link || "#"} target="_blank" rel="noreferrer">
        <img
          src={`${process.env.REACT_APP_API_BASE_URL}/${item.banner_file}`}
          width="200"
          height="100"
          style={{ borderRadius: "8px", cursor: "pointer" }}
          alt="banner"
        />
      </a>
    ) : (
      "No Image"
    ),

    redirect_link: item.redirect_link ? (
      <a href={item.redirect_link} target="_blank" rel="noreferrer">
        View Link
      </a>
    ) : (
      "N/A"
    ),

    actions: (
      <div className="actions d-flex gap-2">
        <button
          className="icon-btn view"
          title="View"
          onClick={() => handleView(item)}
        >
          <FaEye />
        </button>
        <button
          className="icon-btn edit"
          title="Edit"
          onClick={() => handleEdit(item)}
        >
          <FaEdit />
        </button>
        <button
          className="icon-btn delete"
          title="Delete"
          onClick={() => handleDelete(item.bannerId)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <CommonHeader
      title="BANNERS"
      count={bannersList.length}
      totalPages={totalPages}
      pageLimit={pageLimit}
      setPageLimit={setPageLimit}
      setCurrentPage={setCurrentPage}
      onChange={fetchBanners}
      buttonText="+ Add Banner"
      buttonColor="secondary"
      onButtonClick={() => setOpen(true)}
    />

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* ADD MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Banner">
        <BannerForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedItem(null); }}
        title="Update Banner"
      >
        {selectedItem && (
          <BannerForm
            onClose={() => { setEditOpen(false); setSelectedItem(null); }}
            onSubmit={handleUpdate}
            existingData={selectedItem}
            isEdit={true}
          />
        )}
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="View Banner">
        {selectedItem && (
          <div className="text-center">
            {selectedItem.banner_file ? (
              <a href={selectedItem.redirect_link || "#"} target="_blank" rel="noreferrer">
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/${selectedItem.banner_file}`}
                  width="100%"
                  style={{ borderRadius: "8px", cursor: "pointer" }}
                  alt="banner"
                />
              </a>
            ) : (
              <p>No Image</p>
            )}

            {selectedItem.redirect_link && (
              <p className="mt-2">
                <strong>Redirect:</strong>{" "}
                <a href={selectedItem.redirect_link} target="_blank" rel="noreferrer">
                  {selectedItem.redirect_link}
                </a>
              </p>
            )}

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ================= FORM ================= */

function BannerForm({ onClose, onSubmit, existingData = null, isEdit = false }) {
  const [imageFile, setImageFile] = useState(null);
  const [redirectLink, setRedirectLink] = useState(existingData?.redirect_link || "");
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7 // 70% quality — good balance of size vs clarity
          );
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);

      // Show preview of selected image
      const url = URL.createObjectURL(compressed);
      setPreviewUrl(url);

      console.log(
        `Image compressed: ${(file.size / 1024).toFixed(1)} KB → ${(compressed.size / 1024).toFixed(1)} KB`
      );
    } catch (err) {
      console.error("Image compression failed:", err);
      // Fallback: use original file if compression fails
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEdit && !imageFile) return;

    const formData = new FormData();
    if (imageFile) formData.append("banner_file", imageFile);
    formData.append("redirect_link", redirectLink);
    if (isEdit && existingData?.bannerId) {
      formData.append("bannerId", existingData.bannerId);
    }

    onSubmit(formData);
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Banner Image</label>

        {/* Show current image in edit mode before new one is chosen */}
        {isEdit && existingData?.banner_file && !previewUrl && (
          <div className="mb-2">
            <img
              src={`${process.env.REACT_APP_API_BASE_URL}/${existingData.banner_file}`}
              width="200"
              height="100"
              style={{ borderRadius: "8px", objectFit: "cover" }}
              alt="Current banner"
            />
            <p className="text-muted small mt-1">Current image — upload a new one to replace it</p>
          </div>
        )}

        {/* Preview of newly selected/compressed image */}
        {previewUrl && (
          <div className="mb-2">
            <img
              src={previewUrl}
              width="200"
              height="100"
              style={{ borderRadius: "8px", objectFit: "cover" }}
              alt="Preview"
            />
            <p className="text-muted small mt-1">New image preview (compressed)</p>
          </div>
        )}

        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleImageChange}
          required={!isEdit}
        />

        {/* Show compressing spinner */}
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

      <div className="mb-3">
        <label className="form-label">Redirect Link</label>
        <input
          type="url"
          className="form-control"
          placeholder="https://example.com"
          value={redirectLink}
          onChange={(e) => setRedirectLink(e.target.value)}
        />
      </div>

      <div className="text-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={isCompressing}>
          {isCompressing ? "Processing..." : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default Banners;