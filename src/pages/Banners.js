import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { addBanner, getBanners, deleteBanner } from "../services/authService";
import "../forms/form.css";
import { FaEye, FaTrash } from "react-icons/fa";

const Banners = () => {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bannersList, setBannersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetchBanners = useCallback(async (page = 1, limit = pageLimit) => {
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
    }
  }, [pageLimit]);

  useEffect(() => {
    fetchBanners(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchBanners]);

  const handleView = (item) => {
    setSelectedItem(item);
    setViewOpen(true);
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
      cancelButtonColor: "#ff7a00",
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
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2>BANNERS</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
            style={{
              border: "2px solid #872026",
              padding: "2px",
              cursor: "pointer",
            }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchBanners(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Button text="+ Add Banner" className="secondary" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ADD MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Banner">
        <BannerForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
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

function BannerForm({ onClose, onSubmit }) {
  const [imageFile, setImageFile] = useState(null);
  const [redirectLink, setRedirectLink] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("banner_file", imageFile);
    formData.append("redirect_link", redirectLink);

    onSubmit(formData); 
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Banner Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />
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
        <button type="submit" className="btn btn-success">
          Save
        </button>
      </div>
    </form>
  );
}

export default Banners;
