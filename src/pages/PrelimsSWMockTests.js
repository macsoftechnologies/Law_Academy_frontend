import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PrelimsSWMockTestsForm from "../forms/PrelimsSWMockTestsForm";
import Swal from "sweetalert2";
import {
  getPrelimesSubjectWiseTests,
  getPrelims,
  getMockTestSubject,
} from "../services/authService";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PrelimsSWMockTests = () => {
  const navigate = useNavigate();

  const [list,         setList]         = useState([]);
  const [open,         setOpen]         = useState(false);
  const [viewOpen,     setViewOpen]     = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [pageLimit,    setPageLimit]    = useState(10);
  // ✅ Start true so spinner shows immediately
  const [isLoading,    setIsLoading]    = useState(true);

  const [prelimsList,  setPrelimsList]  = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [subjectsRes, prelimsRes] = await Promise.all([
          getMockTestSubject(1, 1000),
          getPrelims(1, 1000),
        ]);
        setSubjectsList(subjectsRes.data || []);
        setPrelimsList(prelimsRes.data || []);
      } catch (err) {
        console.error("Failed to load meta data", err);
      }
    };
    loadMeta();
  }, []);

  const fetchData = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true); // ✅ Always true before fetch
      try {
        const res = await getPrelimesSubjectWiseTests(page, limit);
        let data  = [];
        let pages = 1;
        let total = 0;

        if (res && Array.isArray(res.data)) {
          data  = res.data;
          pages = res.totalPages || 1;
          total = res.totalCount || res.total || data.length;
        } else if (Array.isArray(res)) {
          data  = res;
          total = data.length;
        }

        setList(data);
        setTotalPages(pages);
        setTotalCount(total);
      } catch (err) {
        console.error(err);
        setList([]);
        setTotalPages(1);
        setTotalCount(0);
        Swal.fire("Error", "Failed to fetch prelims subject wise mock tests", "error");
      } finally {
        setIsLoading(false); // ✅ Always off in finally
      }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchData(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchData]);

  const getPrelimsName = (id) => {
    const found = prelimsList.find((p) => (p.prelimes_id || p._id) === id);
    return found?.title || id || "—";
  };

  const getSubjectName = (id) => {
    const found = subjectsList.find((s) => s.mocktest_subject_id === id);
    return found?.title || id || "—";
  };

  // Eye button — quick view modal
  const handleView = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setViewOpen(true);
  };

  // Row click — navigate to full profile using prelimes_test_id
  const handleRowClick = (item) => {
    localStorage.setItem("prelims_swmt_prelimes_test_id", item.prelimes_test_id);
    navigate(`/pswmocktests/${item.prelimes_test_id}`);
  };

  const handleSubmit = () => {
    fetchData(currentPage, pageLimit);
    setOpen(false);
    setSelectedItem(null);
  };

  const columns = [
    { header: "S.No",             accessor: "sno"         },
    { header: "Title",            accessor: "title"       },
    { header: "Test Number",      accessor: "test_number" },
    { header: "No. of Questions", accessor: "no_of_qos"  },
    { header: "Duration (mins)",  accessor: "duration"    },
    { header: "Actions",          accessor: "actions"     },
  ];

  const tableData = list.map((item, index) => ({
    ...item,
    _rowonClick:  () => handleRowClick(item),
    sno:          (currentPage - 1) * pageLimit + index + 1,
    title:        item.title       || "—",
    test_number:  item.test_number || "—",
    no_of_qos:    item.no_of_qos   || "—",
    duration:     item.duration    || "—",
    actions: (
      <div className="actions">
        <button
          className="icon-btn view"
          title="Quick View"
          onClick={(e) => handleView(e, item)}
        >
          <FaEye />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2>Prelims Subject Wise Mock Tests</h2>
        <Button text="+ Add Prelims SW Mock Test" onClick={() => setOpen(true)} />
      </div>

      {/* Tip + Showing count + Records per page */}
      <div
        className="d-flex justify-content-between align-items-center flex-wrap gap-2"
        style={{ marginBottom: "12px" }}
      >
        <p
          style={{
            margin: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "600",
            fontStyle: "italic",
            color: "#6f42c1",
            background: "#f0ebff",
            border: "1px solid #c9b8f5",
            borderRadius: "20px",
            padding: "4px 14px",
          }}
        >
          💡 Click on any row to view full test profile
        </p>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span style={{ fontSize: "14px" }}>
            Showing{" "}
            <strong style={{ color: "#ff7a00" }}>{list.length}</strong>
            {totalCount > list.length && (
              <> of <strong>{totalCount}</strong></>
            )}{" "}
            records
          </span>
          <div className="d-flex align-items-center gap-2">
            <label style={{ marginBottom: 0 }}>Records per page:</label>
            <select
              style={{ border: "2px solid #872026", padding: "2px", cursor: "pointer" }}
              value={pageLimit}
              onChange={(e) => {
                const limit = parseInt(e.target.value, 10);
                setPageLimit(limit);
                setCurrentPage(1);
                fetchData(1, limit);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ isLoading passed to Table */}
      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Prelims Subject Wise Mock Test" size="lg">
        <PrelimsSWMockTestsForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* Quick View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedItem(null); }}
        title="Prelims SW Mock Test Details"
        size="lg"
      >
        {selectedItem && (
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <p><b>Title:</b>            {selectedItem.title       || "—"}</p>
                <p><b>Test Number:</b>      {selectedItem.test_number || "—"}</p>
                <p><b>Test Type:</b>        {selectedItem.test_type   || "—"}</p>
                <p><b>No. of Questions:</b> {selectedItem.no_of_qos   || "—"}</p>
                <p><b>Duration (mins):</b>  {selectedItem.duration    || "—"}</p>
              </div>
              <div className="col-md-6">
                <p><b>Prelims:</b>           {getPrelimsName(selectedItem.prelimes_id)}</p>
                <p><b>Mock Test Subject:</b> {getSubjectName(selectedItem.mocktest_subject_id)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PrelimsSWMockTests;