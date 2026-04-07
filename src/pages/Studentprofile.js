import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../components/Table";
import { getUserDetails } from "../services/authService";
import { getStudentCoursesDetails } from "../services/authService";
import { FaEye } from "react-icons/fa";

function StudentProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [imageModal, setImageModal] = useState({ open: false, src: "" });
  const [courseModal, setCourseModal] = useState({ open: false, data: null });

  const openImageModal = (imgUrl) => setImageModal({ open: true, src: imgUrl });
  const closeImageModal = () => setImageModal({ open: false, src: "" });

  const openCourseModal = (item) => setCourseModal({ open: true, data: item });
  const closeCourseModal = () => setCourseModal({ open: false, data: null });

  const BASE = process.env.REACT_APP_API_BASE_URL;
  const getImageUrl = (filename) => (filename ? `${BASE}/${filename}` : "");

  useEffect(() => {
    const id = userId || localStorage.getItem("userId");
    if (!id) return;
    const fetchStudent = async () => {
      setIsLoading(true);
      try {
        const res = await getUserDetails(id);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setStudent(res.data[0]);
        }
      } catch (error) {
        console.error("Fetch Student Error:", error);
      }finally {
    setIsLoading(false);    
  }
    };
    fetchStudent();
  }, [userId]);

  useEffect(() => {
    const id = userId || localStorage.getItem("userId");
    if (!id) return;
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const res = await getStudentCoursesDetails(id);
        const data = Array.isArray(res) ? res : res?.data || [];
        setCourses(data);
        setTotalPages(Math.ceil(data.length / 10) || 1);
      } catch (error) {
        console.error("Fetch Courses Error:", error);
        setCourses([]);
      }finally {
    setIsLoading(false);    
  }
    };
    fetchCourses();
  }, [userId]);

  if (!student) {
    return (
      <div className="p-3 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading student profile...</p>
      </div>
    );
  }

  const pageSize = 10;
  const paginatedCourses = courses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const courseColumns = [
    { header: "S.No", accessor: "srNo" },
    { header: "Course Title", accessor: "course_title" },
    { header: "Enroll Type", accessor: "enroll_type" },
    { header: "Enroll Date", accessor: "enroll_date" },
    { header: "Expiry Date", accessor: "expiry_date" },
    { header: "Status", accessor: "status" },
    { header: "Action", accessor: "action" },
  ];

  const courseTableData = paginatedCourses.map((item, index) => ({
    srNo: (currentPage - 1) * pageSize + index + 1,
    course_title: item.courseDetails?.title || "-",
    enroll_type: item.enroll_type || "-",
    enroll_date: item.enroll_date ? new Date(item.enroll_date).toLocaleDateString() : "-",
    expiry_date: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "-",
    status: item.status || "-",
    action: (
      <div className="actions">
                <button
                  className="icon-btn view"
                  onClick={() => openCourseModal(item)}
                  title="View"
                >
                  <FaEye />
                </button>
              </div>
    ),
  }));

  const cd = courseModal.data;

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>STUDENT PROFILE</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/students")}>
          ← Back
        </button>
      </div>

      <div className="card p-3 shadow-sm mb-4">
        <h4>Personal Details</h4>
        <div className="row mt-3 align-items-start">
          <div className="col-md-4 mb-3">
            <p><b>Name:</b> {student.name || "N/A"}</p>
            <p><b>Email:</b> {student.email || "N/A"}</p>
            <p><b>Mobile:</b> {student.mobile_number || "N/A"}</p>
            <p><b>Gender:</b> {student.gender || "N/A"}</p>
          </div>
          <div className="col-md-4 mb-3">
            <p><b>Date of Birth:</b> {student.date_of_birth || "N/A"}</p>
            <p><b>Father Name:</b> {student.father_name || "N/A"}</p>
            <p><b>Mother Name:</b> {student.mother_name || "N/A"}</p>
            <p><b>Role:</b> {student.role || "N/A"}</p>
          </div>
          <div className="col-md-4 mb-3">
            <p><b>Referral Code:</b> {student.referral_code || "N/A"}</p>
            <p><b>Referred By:</b> {student.referred_by || "N/A"}</p>
            <p><b>Address:</b> {student.corresponding_address || "N/A"}</p>
            <p><b>Permanent Address:</b> {student.permanent_address || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="card p-3 shadow-sm mb-4">
        <div className="row">
          <div className="col-md-6 mb-3 mb-md-0">
            <h4>Certificates</h4>
            {student.certificates?.length > 0 ? (
              <div className="row mt-3">
                {student.certificates.map((cert) => (
                  <div className="col-12 mb-3" key={cert._id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 16px",
                        background: "rgb(255 172 45 / 20%)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                      }}
                      onClick={() => openImageModal(getImageUrl(cert.certificate_file))}
                    >
                      <img
                        src={getImageUrl(cert.certificate_file)}
                        alt="Certificate"
                        style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "10px", background: "#fff" }}
                      />
                      <div>
                        <h6 style={{ margin: 0, fontWeight: "700" }}>
                          {cert.certificate_standard || "Certificate"}
                        </h6>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
                          <b>Marks/CGPA:</b> {cert.marks_cgpa || "N/A"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#555" }}>
                          <b>Institute:</b> {cert.institute_name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3">No Certificates found.</p>
            )}
          </div>

          <div className="col-md-6">
            <h4>ID Proofs</h4>
            {student.idProofs?.length > 0 ? (
              <div className="row mt-3">
                {student.idProofs.map((proof) => (
                  <div className="col-12 mb-3" key={proof._id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 16px",
                        background: "#eef4ff",
                        borderRadius: "16px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                      }}
                      onClick={() => openImageModal(getImageUrl(proof.proof_file))}
                    >
                      <img
                        src={getImageUrl(proof.proof_file)}
                        alt="ID Proof"
                        style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "10px", background: "#fff" }}
                      />
                      <div>
                        <h6 style={{ margin: 0, fontWeight: "700" }}>
                          {proof.idType || "ID Proof"}
                        </h6>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
                          <b>ID Number:</b> {proof.id_number || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3">No ID Proofs found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-3 shadow-sm mb-4">
        <h4>Enrolled Courses</h4>
        <Table
          columns={courseColumns}
          data={courseTableData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}

        />
      </div>

      {imageModal.open && (
        <div
          onClick={closeImageModal}
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <img
            src={imageModal.src}
            alt="Full View"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
          />
        </div>
      )}

      {courseModal.open && cd && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={closeCourseModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              width: "90%",
              maxWidth: "820px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ margin: 0, fontWeight: "700" }}>Course Details</h5>
              <button className="btn-close" onClick={closeCourseModal} />
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                {cd.courseDetails?.presentation_image ? (
                  <img
                    src={getImageUrl(cd.courseDetails.presentation_image)}
                    alt="Course"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "200px", borderRadius: "12px", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
                    📚
                  </div>
                )}
              </div>
              <div className="col-md-6 mb-3 d-flex flex-column justify-content-center">
                <h6 style={{ fontWeight: "700", marginBottom: "8px" }}><b>Course title:</b> {cd.courseDetails?.title || "N/A"}</h6>
                <p style={{ margin: "0 0 10px" }}>
                  <span className={`badge ${cd.status === "active" ? "bg-success" : "bg-secondary"}`}><b>Status:</b>{cd.status || "N/A"}</span>
                </p>
                <p style={{ margin: "0 0 10px" }}><b>Enroll Type:</b> {cd.enroll_type || "N/A"}</p>
                <p style={{ margin: "0 0 10px" }}><b>Payment ID:</b> {cd.payment_id || "N/A"}</p>
                <p style={{ margin: "0 0 10px" }}><b>Enroll Date:</b> {cd.enroll_date ? new Date(cd.enroll_date).toLocaleDateString() : "N/A"}</p>
                <p style={{ margin: "0 0 10px" }}><b>Expiry Date:</b> {cd.expiry_date ? new Date(cd.expiry_date).toLocaleDateString() : "N/A"}</p>
                <p style={{ margin: "0 0 10px" }}><b>Created At:</b> {cd.createdAt ? new Date(cd.createdAt).toLocaleString() : "N/A"}</p>
                <p style={{ margin: "0" }}><b>Updated At:</b> {cd.updatedAt ? new Date(cd.updatedAt).toLocaleString() : "N/A"}</p>
              </div>
            </div>

            <div className="row">

              {cd.courseDetails?.about_course && (
                <div className="col-12 mb-3">
                  <p style={{ margin: "0 0 6px" }}><b>About Course:</b></p>
                  <p style={{ margin: 0, color: "#444", fontSize: "14px", whiteSpace: "pre-line" }}>
                    {cd.courseDetails.about_course}
                  </p>
                </div>
              )}

              {cd.courseDetails?.terms_conditions && (
                <div className="col-12 mb-3">
                  <p style={{ margin: "0 0 6px" }}><b>Terms & Conditions:</b></p>
                  <p style={{ margin: 0, color: "#444", fontSize: "14px", whiteSpace: "pre-line" }}>
                    {cd.courseDetails.terms_conditions}
                  </p>
                </div>
              )}
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={closeCourseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;