import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa"; 
import { UpdateTeknisi } from "./UpdateTeknisi";
import * as XLSX from "xlsx";
import { CreatePM } from "./CreatePM"; // Hapus jika tidak digunakan

export function TaskList() {
    const [tableData, setTableData] = useState([]);  
    const [loading, setLoading] = useState(true);     
    const [error, setError] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loggedInName, setLoggedInName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // NEW

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setLoggedInName(user.name);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`);
            const allData = response.data;

            const latestEntriesMap = new Map();
            allData.forEach(item => {
                const existing = latestEntriesMap.get(item.no);
                if (!existing || new Date(item.date) > new Date(existing.date)) {
                    latestEntriesMap.set(item.no, item);
                }
            });

            const latestData = Array.from(latestEntriesMap.values()).sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            setTableData(latestData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (client) => {
        setSelectedClient(client);
    };

    const handleCloseForm = () => {
        setSelectedClient(null);
        fetchData();
    };

    const filteredData = tableData.filter(item => {
        const matchesSearch =
            item.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.namacabang.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.teknisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.namacustomer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            (selectedStatus === "All" && item.status !== "Completed") ||
            item.status === selectedStatus;
        
        const isWithinDateRange = startDate && endDate
            ? new Date(item.date) >= new Date(startDate) && new Date(item.date) <= new Date(endDate)
            : true;

        const matchesTechnician = item.teknisi === loggedInName;

        return matchesSearch && matchesStatus && isWithinDateRange && matchesTechnician;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="overflow-x-auto self-start w-full">
            <button
                className="btn btn-outline btn-primary mb-4"
                onClick={() => setIsModalOpen(true)}
            >
                Create PM
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
                        <CreatePM />
                        <div className="flex justify-end mt-4">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {loading && <p>Loading data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <input 
                            type="text" 
                            placeholder="Search Data" 
                            className="p-2 border border-gray-300 rounded flex-1 min-w-[500px]"
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
                    </div>
                    
                    <table className="table mt-2 border-collapse border border-gray-300 w-full">
                        <thead>
                            <tr className="bg-gray-300 text-sm text-gray-900">
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
                                <th className="border border-gray-300 px-4 py-2">Date</th>
                                <th className="border border-gray-300 px-4 py-2">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-200 text-sm text-gray-700">
                                        <td className="border border-gray-300 px-4 py-2">{indexOfFirstItem + index + 1}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.no}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.type}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.serial}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.model}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.namacabang}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.teknisi}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.problem}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.kategorikerusakan}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.namacustomer}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.notelcustomer}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.status}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {item.date ? new Date(item.date).toLocaleString("id-ID", { 
                                                year: "numeric", 
                                                month: "2-digit", 
                                                day: "2-digit", 
                                                hour: "2-digit", 
                                                minute: "2-digit"
                                            }) : "-"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button 
                                                onClick={() => handleEdit(item)} 
                                                className={`text-gray-600 hover:text-gray-800 ${item.status === "Canceled" ? "cursor-not-allowed text-gray-400" : ""}`} 
                                                disabled={item.status === "Canceled"}
                                            >
                                                <FaEdit />
                                            </button>
                                        </td>                                    
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="text-center py-4">No data available</td>
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
            {selectedClient && (
                <UpdateTeknisi
                    client={selectedClient}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
