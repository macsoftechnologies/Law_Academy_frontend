import React, { useState } from "react";
import Table from "../../components/Table";
import CommonHeader from "../../components/CommonHeader";
import { FaFileInvoice } from "react-icons/fa";

function Orders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    name: "",
    phone: "",
    subscription: "",
    years: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    name: "",
    phone: "",
    subscription: "",
    years: ""
  });

  // Dummy Data
  const ordersList = [
    { id: 1, date: "2024-05-12", name: "John Doe", phonenumber: "1234567890", subscription: "Premium", paid_amount: "$150", years: "1 Year" },
    { id: 2, date: "2024-05-13", name: "Jane Smith", phonenumber: "0987654321", subscription: "Basic", paid_amount: "$50", years: "6 Months" },
    { id: 3, date: "2024-05-14", name: "Alice Johnson", phonenumber: "1122334455", subscription: "Pro", paid_amount: "$200", years: "2 Years" },
    { id: 4, date: "2024-05-15", name: "Bob Brown", phonenumber: "5544332211", subscription: "Premium", paid_amount: "$150", years: "1 Year" },
    { id: 5, date: "2024-05-16", name: "Charlie Davis", phonenumber: "6677889900", subscription: "Basic", paid_amount: "$50", years: "6 Months" },
  ];

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClear = () => {
    const emptyFilters = {
      startDate: "",
      endDate: "",
      name: "",
      phone: "",
      subscription: "",
      years: ""
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const filteredOrders = ordersList.filter(order => {
    let match = true;
    if (appliedFilters.startDate && order.date < appliedFilters.startDate) match = false;
    if (appliedFilters.endDate && order.date > appliedFilters.endDate) match = false;
    if (appliedFilters.name && !order.name.toLowerCase().includes(appliedFilters.name.toLowerCase())) match = false;
    if (appliedFilters.phone && !order.phonenumber.includes(appliedFilters.phone)) match = false;
    if (appliedFilters.subscription && order.subscription !== appliedFilters.subscription) match = false;
    if (appliedFilters.years && order.years !== appliedFilters.years) match = false;
    return match;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageLimit) || 1;
  
  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit
  );

  const columns = [
    { header: "S.No", accessor: "s_no" },
    { header: "Date", accessor: "date" },
    { header: "Name", accessor: "name" },
    { header: "Phone Number", accessor: "phonenumber" },
    { header: "Subscription", accessor: "subscription" },
    { header: "Paid Amount", accessor: "paid_amount" },
    { header: "Years", accessor: "years" },
    { header: "Actions", accessor: "actions" },
  ];

  const handleDownloadInvoice = (order) => {
    alert(`Downloading invoice for order: ${order.id}`);
  };

  const tableData = paginatedData.map((order, index) => ({
    ...order,
    s_no: (currentPage - 1) * pageLimit + index + 1,
    actions: (
      <button 
        className="icon-btn view" 
        onClick={() => handleDownloadInvoice(order)}
        title="Download Invoice"
      >
        <FaFileInvoice />
      </button>
    )
  }));

  return (
    <div>
      <CommonHeader
        title="ORDERS LIST"
        count={filteredOrders.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => {
          setCurrentPage(page);
          setPageLimit(limit);
        }}
        infoText="💡 View all student orders and download invoices."
      />

      <div style={{ padding: "16px", background: "#fdf8ee", margin: "0 16px 16px", borderRadius: "8px", border: "1px solid #f2e3c6" }}>
        <div className="row g-4 align-items-end">
          {/* Row 1: Start Date & End Date */}
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Start Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={filters.startDate} 
              onChange={(e) => setFilters({...filters, startDate: e.target.value})} 
            />
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>End Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={filters.endDate} 
              onChange={(e) => setFilters({...filters, endDate: e.target.value})} 
            />
          </div>

          {/* Row 2: Name & Phone */}
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Name" 
              value={filters.name} 
              onChange={(e) => setFilters({...filters, name: e.target.value})} 
            />
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Phone</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Phone" 
              value={filters.phone} 
              onChange={(e) => setFilters({...filters, phone: e.target.value})} 
            />
          </div>

          {/* Row 3: Subscription & Years */}
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Subscription</label>
            <select 
              className="form-select" 
              value={filters.subscription} 
              onChange={(e) => setFilters({...filters, subscription: e.target.value})}
            >
              <option value="">All</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Years</label>
            <select 
              className="form-select" 
              value={filters.years} 
              onChange={(e) => setFilters({...filters, years: e.target.value})}
            >
              <option value="">All</option>
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
            </select>
          </div>
          
          <div className="col-md-12 d-flex justify-content-end mt-4 gap-2">
            <button className="btn btn-secondary px-4" onClick={handleClear}>Clear</button>
            <button className="btn text-white px-4" onClick={handleSearch} style={{ background: "#1a2744", borderColor: "#1a2744" }}>Search</button>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={false}
      />
    </div>
  );
}

export default Orders;
