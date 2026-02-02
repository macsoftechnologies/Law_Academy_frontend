import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { getUsersList, getUserDetails } from "../services/authService";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";

function Students() {
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // 🔥 Fetch students with useCallback
  const fetchStudents = useCallback(async (page = 1, limit = pageLimit) => {
    try {
      const res = await getUsersList(page, limit);
      let data = [];
      let pages = 1;

      if (res && Array.isArray(res.data)) {
        data = res.data;
        pages = res.totalPages || 1;
      } else if (Array.isArray(res)) {
        data = res;
      }

      setStudentsList(data);
      setTotalPages(pages);
    } catch (err) {
      setStudentsList([]);
      setTotalPages(1);
      Swal.fire("Error", "Failed to fetch students", "error");
    }
  }, [pageLimit]);

  useEffect(() => {
    fetchStudents(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchStudents]);

  const handleView = async (student) => {
    try {
      const res = await getUserDetails(student.userId);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setSelectedStudent(res.data[0]);
        setViewOpen(true);
      } else {
        Swal.fire("Error", "Student details not found", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch student details", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "s_no" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Mobile", accessor: "mobile_number" },
    { header: "Referral Code", accessor: "referral_code" },
    { header: "Referred By", accessor: "referred_by" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = studentsList.map((student, index) => ({
    ...student,
    s_no: (currentPage - 1) * pageLimit + index + 1,
    actions: (
      <div className="actions">
        <button className="icon-btn view" title="View" onClick={() => handleView(student)}>
          <FaEye />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      {/* Header + Records per page */}
      <div className="d-flex justify-content-between mb-3">
        <h2>STUDENTS LIST</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1); // reset to page 1
              fetchStudents(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Student Details" size="lg">
        {selectedStudent ? (
          <div className="container">
            <div className="row mb-2">
              <div className="col-md-6"><b>Name:</b> {selectedStudent.name}</div>
              <div className="col-md-6"><b>Email:</b> {selectedStudent.email}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><b>Mobile:</b> {selectedStudent.mobile_number}</div>
              <div className="col-md-6"><b>Referral Code:</b> {selectedStudent.referral_code}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><b>Role:</b> {selectedStudent.role}</div>
              <div className="col-md-6"><b>Referred By:</b> {selectedStudent.referred_by}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><b>Address:</b> {selectedStudent.corresponding_address}</div>
              <div className="col-md-6"><b>Date of Birth:</b> {selectedStudent.date_of_birth}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><b>Father Name:</b> {selectedStudent.father_name}</div>
              <div className="col-md-6"><b>Gender:</b> {selectedStudent.gender}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-6"><b>Mother Name:</b> {selectedStudent.mother_name}</div>
              <div className="col-md-6"><b>Permanent Address:</b> {selectedStudent.permanent_address}</div>
            </div>

            <div className="row mb-2">
              <div className="col-12">
                <hr />
                <b>Certificates:</b>
                {selectedStudent.certificates?.length > 0 ? (
                  <ul>
                    {selectedStudent.certificates.map(cert => (
                      <li key={cert._id} className="mb-2">
                        <div><b>Standard:</b> {cert.certificate_standard}</div>
                        <div><b>Marks/CGPA:</b> {cert.marks_cgpa}</div>
                        <div><b>Institute:</b> {cert.institute_name}</div>
                        <div>
                          <b>File:</b> 
                          <a 
                            href={`${process.env.REACT_APP_API_BASE_URL}/${cert.certificate_file}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ms-2"
                          >
                            View Certificate
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p>No Certificates</p>}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-12">
                <hr />
                <b>ID Proofs:</b>
                {selectedStudent.idProofs?.length > 0 ? (
                  <ul>
                    {selectedStudent.idProofs.map(proof => (
                      <li key={proof._id} className="mb-2">
                        <div><b>ID Type:</b> {proof.idType}</div>
                        <div><b>ID Number:</b> {proof.id_number}</div>
                        <div>
                          <b>File:</b> 
                          <a 
                            href={`${process.env.REACT_APP_API_BASE_URL}/${proof.proof_file}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ms-2"
                          >
                            View Proof
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p>No ID Proofs</p>}
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
}

export default Students;
