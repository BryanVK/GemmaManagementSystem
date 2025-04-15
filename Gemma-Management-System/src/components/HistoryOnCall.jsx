import { useEffect, useState } from "react";
import axios from "axios";

export function HistoryOnCall({ client, onClose }) {
    const [historyList, setHistoryList] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/clients");
                const allData = response.data;

                // Filter berdasarkan 'no' yang sama
                const filteredHistory = allData.filter(item => item.no === client.no);

                setHistoryList(filteredHistory);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        if (client?.no) {
            fetchHistory();
        }
    }, [client]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 backdrop-blur-md z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
                <h2 className="text-xl font-semibold text-center mb-6">History OnCall - No: {client.no}</h2>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border border-gray-300">No</th>
                                <th className="px-4 py-2 border border-gray-300">Status</th>
                                <th className="px-4 py-2 border border-gray-300">Date</th>
                                <th className="px-4 py-2 border border-gray-300">Bukti</th>
                                <th className="px-4 py-2 border border-gray-300">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyList.length > 0 ? (
                                historyList.map((entry, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {entry.status || "-"}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {entry.date
                                                ? new Date(entry.date).toLocaleString("id-ID", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {entry.image ? (
                                                <img
                                                    src={`http://localhost:3000/uploads/${entry.image}`} // Gunakan path sesuai upload folder
                                                    alt="Bukti"
                                                    className="w-20 h-20 object-cover mx-auto rounded"
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {entry.note || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        Tidak ada riwayat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
