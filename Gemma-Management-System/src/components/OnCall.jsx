import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa"; 
import { UpdateOnCall } from "./UpdateOnCall";
import * as XLSX from "xlsx";

export function OnCall() {
    const [tableData, setTableData] = useState([]);  
    const [loading, setLoading] = useState(true);     
    const [error, setError] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get("http://82.112.227.86:3000/api/clients");
            const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTableData(sortedData); 
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
    
        if (startDate && endDate) {
            const itemDate = new Date(item.date);
            const isWithinDateRange = itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
            return isWithinDateRange && matchesSearch;
        }
    
        return matchesSearch;
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
                        <button onClick={exportToExcel} className="px-14 bg-green-500 text-white rounded">Export</button>
                    </div>
                    
                    <table className="table mt-2 border-collapse border border-gray-200 w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">No</th>
                                <th className="border border-gray-300 px-4 py-2">ID</th>
                                <th className="border border-gray-300 px-4 py-2">Serial</th>
                                <th className="border border-gray-300 px-4 py-2">Model</th>
                                <th className="border border-gray-300 px-4 py-2">Nama Cabang</th>
                                <th className="border border-gray-300 px-4 py-2">Teknisi</th>
                                <th className="border border-gray-300 px-4 py-2">Problem</th>
                                <th className="border border-gray-300 px-4 py-2">Kategori Kerusakan</th>
                                <th className="border border-gray-300 px-4 py-2">Nama Customer</th>
                                <th className="border border-gray-300 px-4 py-2">No Tlp Customer</th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                                <th className="border border-gray-300 px-4 py-2">Date</th> {/* Tambah kolom Date */}
                                <th className="border border-gray-300 px-4 py-2">Edit</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 px-4 py-2">{indexOfFirstItem + index + 1}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.no}</td>
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
                                            <button onClick={() => handleEdit(item)} className="text-primary px-1 rounded">
                                                <FaEdit />
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
            {selectedClient && <UpdateOnCall client={selectedClient} onClose={handleCloseForm} />}
        </div>
    );
}