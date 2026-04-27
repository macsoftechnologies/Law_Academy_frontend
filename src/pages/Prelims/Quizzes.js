import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
// import Button from "../components/Button";
import Modal from "../../components/Modal";
import QuizzesForm from "../../forms/Prelims/QuizzesForm";
import Swal from "sweetalert2";
import { getQuizzes, getPrelims } from "../../services/authService";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CommonHeader from "../../components/CommonHeader";

const Quizzes = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [prelimsList, setPrelimsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPrelims = async () => {
      try {
        const res = await getPrelims(1, 1000);
        setPrelimsList(res.data || []);
      } catch (err) {
        console.error("Failed to fetch prelims", err);
      }
    };
    loadPrelims();
  }, []);

  const fetchData = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true);
      try {
        const res = await getQuizzes(page, limit);
        let data = [];
        let pages = 1;
        let total = 0;
        if (res && Array.isArray(res.data)) {
          data = res.data;
          pages = res.totalPages || 1;
          total = res.totalCount || res.total || data.length;
        } else if (Array.isArray(res)) {
          data = res;
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
        Swal.fire("Error", "Failed to fetch quizzes", "error");
      }finally {
    setIsLoading(false);    
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

  const handleView = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleRowClick = (item) => {
    localStorage.setItem("prelimes_test_id", item.prelimes_test_id);
    navigate(`/quiz/${item.prelimes_test_id}`);
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
    _rowonClick: () => handleRowClick(item),
    sno:         (currentPage - 1) * pageLimit + index + 1,
    title:       item.title       || "—",
    test_number: item.test_number || "—",
    no_of_qos:   item.no_of_qos   || "—",
    duration:    item.duration    || "—",
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

      <CommonHeader
        title="Quizzes"
        count={list.length}
        totalPages={totalPages}
        totalCount={totalCount}
        pageLimit={pageLimit}
        setPageLimit={(limit) => {
          setPageLimit(limit);
          setCurrentPage(1);
          fetchData(1, limit);
        }}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => fetchData(page, limit)}
        buttonText="+ Add Quiz"
        buttonColor="orange"
        onButtonClick={() => setOpen(true)}
        infoText="💡 Click on any row to view quiz details"
      />

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Quiz" size="lg">
        <QuizzesForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* Quick View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedItem(null); }}
        title="Quiz Details"
        size="lg"
      >
        {selectedItem && (
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <p><b>Title:</b>            {selectedItem.title       || "—"}</p>
                <p><b>Test Number:</b>      {selectedItem.test_number || "—"}</p>
                <p><b>Test Type:</b>        {selectedItem.test_type   || "—"}</p>
              </div>
              <div className="col-md-6">
                <p><b>No. of Questions:</b> {selectedItem.no_of_qos   || "—"}</p>
                <p><b>Duration (mins):</b>  {selectedItem.duration    || "—"}</p>
                <p><b>Prelims:</b> {getPrelimsName(selectedItem.prelimes_id)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quizzes;