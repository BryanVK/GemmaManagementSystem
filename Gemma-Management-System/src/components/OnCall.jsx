import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaHistory, FaCopy } from "react-icons/fa"; // Import FaCopy untuk ikon
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
    const [showHistory, setShowHistory] = useState(false);
    const [modalType, setModalType] = useState(""); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
        setShowHistory(true); 
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

    const handleCopy = (client) => {
        // Menyalin seluruh data baris ke clipboard dalam format teks
        const textToCopy = `
            No: ${client.no}
            Serial: ${client.serial}
            Model: ${client.model}
            Nama Cabang: ${client.namacabang}
            Teknisi: ${client.teknisi}
            Problem: ${client.problem}
            Nama Customer: ${client.namacustomer}
            No Tlp Customer: ${client.notelcustomer}
            Status: ${client.status}
            Date: ${client.date ? formatDateTime(client.date) : "-"}
        `;

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Data berhasil disalin ke clipboard!");
        }).catch((err) => {
            console.error("Gagal menyalin:", err);
        });
    };

    const filteredData = getLatestEntriesByNo(tableData).filter(item => {
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

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data On Call");
        XLSX.writeFile(workbook, "OnCall_Data.xlsx");
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    function formatDateTime(dateString) {
        if (!dateString) return "-";
        
        const [datePart, timePart] = dateString.split("T").length > 1 ? dateString.split("T") : dateString.split(" ");
        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":");
        
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
    
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
                            </select>

                        <button onClick={exportToExcel} className="px-14 bg-green-500 text-white rounded">Export</button>
                    </div>
                    
                    <table className="table mt-2 border-collapse border border-gray-200 w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">No</th>
                                <th className="border border-gray-300 px-4 py-2">ID</th>
                                <th className="border border-gray-300 px-4 py-2">Type</th>
                                <th className="border border-gray-300 px-4 py-2">Serial</th>
                                <th className="border border-gray-300 px-4 py-2">Model</th>
                                <th className="border border-gray-300 px-4 py-2">Nama Cabang</th>
                                <th className="border border-gray-300 px-4 py-2">Teknisi</th>
                                <th className="border border-gray-300 px-4 py-2">Problem</th>
                                <th className="border border-gray-300 px-4 py-2">Kategori Kerusakan</th>
                                <th className="border border-gray-300 px-4 py-2">Nama Customer</th>
                                <th className="border border-gray-300 px-4 py-2">No Tlp Customer</th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                                <th className="border border-gray-300 px-4 py-2">Create By</th>
                                <th className="border border-gray-300 px-4 py-2">Date</th> 
                                <th className="border border-gray-300 px-4 py-2">Edit</th> 
                                <th className="border border-gray-300 px-4 py-2">History</th>
                                <th className="border border-gray-300 px-4 py-2">Copy</th> {/* Kolom untuk copy */}
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
                                        <td className="border border-gray-300 px-4 py-2">{item.teknisi}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.problem}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.kategori}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.namacustomer}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.notelcustomer}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.status}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.createby}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.date ? formatDateTime(item.date) : "-"}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button onClick={() => handleEdit(item)} className="text-blue-500"><FaEdit /></button>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button onClick={() => handleHistory(item)} className="text-blue-500"><FaHistory /></button>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button onClick={() => handleCopy(item)} className="text-blue-500"><FaCopy /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="14" className="text-center py-4">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
