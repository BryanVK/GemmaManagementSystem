/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaHistory, FaCopy } from "react-icons/fa"; 
import { UpdateOnCall } from "./UpdateOnCall";
import { HistoryOnCall } from "./HistoryOnCall";
import * as XLSX from "xlsx";

export function OnCall() {
    const [tableData, setTableData] = useState([]);  
    const [loading, setLoading] = useState(true);     
    const [error, setError] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [showHistory, setShowHistory] = useState(false); // State to control history modal visibility
    const [modalType, setModalType] = useState(""); // "edit" atau "history"
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });


    useEffect(() => {
        fetchData();
    }, []);

    const getLatestEntriesByNo = (data) => {
        const latestMap = new Map();
    
        data.forEach(item => {
            const existing = latestMap.get(item.no);
            if (!existing || new Date(item.date) > new Date(existing.date)) {
                latestMap.set(item.no, item);
            }
        });
    
        return Array.from(latestMap.values());
    };
    
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
          direction = "desc";
        }
        setSortConfig({ key, direction });
      };
      
    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`);
            const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTableData(sortedData); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false); 
        }
    };

    const handleHistory = (client) => {
        setSelectedClient(client);
        setShowHistory(true); // Show history modal
        setModalType("history");
    };
    
    const handleEdit = (client) => {
        setSelectedClient(client);
        setModalType("edit");
    };

    const handleCloseForm = () => {
        setSelectedClient(null);
        fetchData();
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data On Call");
        XLSX.writeFile(workbook, "OnCall_Data.xlsx");
    };

    let filteredData = getLatestEntriesByNo(tableData).filter(item => {
        const matchesSearch =
            (item.serial || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.namacabang || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.teknisi || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.namacustomer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.createby || "").toLowerCase().includes(searchQuery.toLowerCase());
    
        const matchesStatus =
            selectedStatus === "All" || item.status === selectedStatus;
    
        const isWithinDateRange = startDate && endDate
            ? new Date(item.date) >= new Date(startDate) && new Date(item.date) <= new Date(endDate)
            : true;
    
        return matchesSearch && matchesStatus && isWithinDateRange;
    });
    
    // Sorting logic
    if (sortConfig.key) {
        filteredData = [...filteredData].sort((a, b) => {
            const valA = a[sortConfig.key] || "";
            const valB = b[sortConfig.key] || "";
    
            if (typeof valA === "string" && typeof valB === "string") {
                return sortConfig.direction === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else if (typeof valA === "number" && typeof valB === "number") {
                return sortConfig.direction === "asc" ? valA - valB : valB - valA;
            } else {
                return 0;
            }
        });
    }    
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    function formatDateTime(dateString) {
        if (!dateString) return "-";
        
        // Misal server kirim "2025-04-29T13:32" atau "2025-04-29 13:32"
        const [datePart, timePart] = dateString.split("T").length > 1 ? dateString.split("T") : dateString.split(" ");
        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":");
        
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
    
    const handleCopyReport = (item, index) => {
        const report = 
`*ONCALL*
Serial: *${item.serial}*
Model: *${item.model}*
Nama Cabang: *${item.namacabang}*
Alamat Cabang: *${item.alamat}*
Teknisi: *${item.teknisi}*
Problem: *${item.problem}*
Kategori Kerusakan: *${item.kategorikerusakan}*
Nama Customer: *${item.namacustomer}*
No Tlp Customer: *${item.notelcustomer}*
Date: *${formatDateTime(item.date)}*`;
    
        if (navigator.clipboard) {
            // Clipboard API supported
            navigator.clipboard.writeText(report)
                .then(() => {
                    alert("Laporan berhasil disalin ke clipboard.");
                })
                .catch(err => {
                    console.error("Gagal menyalin: ", err);
                    alert("Gagal menyalin laporan ke clipboard.");
                });
        } else {
            // Clipboard API not supported, fallback
            const textarea = document.createElement('textarea');
            textarea.value = report;
            document.body.appendChild(textarea);
            textarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
    
            if (successful) {
                alert("Laporan berhasil disalin ke clipboard.");
            } else {
                alert("Gagal menyalin laporan ke clipboard.");
            }
        }
    };    

      
    return (
        <div className="overflow-x-auto self-start w-full">
            {loading && <p>Loading data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <>
                    <div className="flex space-x-2 mb-4">
                        <input 
                            type="text" 
                            placeholder="Search Data" 
                            className="p-2 border border-gray-300 rounded w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <input 
                            type="date" 
                            className="p-2 border border-gray-300 rounded"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input 
                            type="date" 
                            className="p-2 border border-gray-300 rounded"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                            >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Confirm">Confirm</option>
                            <option value="On Location">On Location</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            {/* Tambah sesuai dengan status yang kamu gunakan */}
                        </select>

                        <button onClick={exportToExcel} className="px-14 bg-green-500 text-white rounded">Export</button>
                    </div>
                    
                    <table className="table mt-2 border-collapse border border-gray-200 w-full">
                    <thead>
                        <tr className="bg-[#f0f0f0] text-black">
                            <th className="border px-4 py-2">No</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("serial")}>
                            Serial {sortConfig.key === "serial" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("model")}>
                            Model {sortConfig.key === "model" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("namacabang")}>
                            Cabang {sortConfig.key === "namacabang" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("teknisi")}>
                            Teknisi {sortConfig.key === "teknisi" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("status")}>
                            Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("createdAt")}>
                            Tanggal {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="border px-4 py-2">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 px-4 py-2">{indexOfFirstItem + index + 1}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.no}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.type}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.serial}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.model}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.namacabang}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.alamat}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.teknisi}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.problem}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.kategorikerusakan}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.namacustomer}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.notelcustomer}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.status}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.createby}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {item.date ? formatDateTime(item.date) : "-"}
                                        </td>

                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => item.status === "Active" && handleEdit(item)}
                                                className={`px-1 rounded ${item.status === "Active" ? "text-blue-500 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"}`}
                                                disabled={item.status !== "Active"}
                                                title={item.status !== "Active" ? "Edit hanya bisa dilakukan saat status Active" : "Edit"}
                                            >
                                                <FaEdit />
                                            </button>
                                        </td>

                                        <td className="border border-gray-300 px-4 py-2">
                                            <button onClick={() => handleHistory(item)} className="text-primary px-1 rounded">
                                                <FaHistory />
                                            </button>
                                        </td> 
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button onClick={() => handleCopyReport(item, index)} className="text-primary px-1 rounded">
                                                <FaCopy />
                                            </button>
                                        </td>                 
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">Tidak ada data.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-center mt-4">
                        {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => paginate(i + 1)}
                                className={`mx-1 px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
            {modalType === "edit" && selectedClient && (
                <UpdateOnCall client={selectedClient} onClose={handleCloseForm} />
            )}
            {modalType === "history" && selectedClient && (
                <HistoryOnCall client={selectedClient} onClose={handleCloseForm} />
            )}
        </div>
    );
}
