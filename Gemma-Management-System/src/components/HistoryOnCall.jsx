import { useEffect, useState } from "react";
import axios from "axios";

export function HistoryOnCall({ client, onClose }) {
    const [historyList, setHistoryList] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`);
                const allData = response.data;

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

    function formatDateTime(dateString) {
        if (!dateString) return "-";
        
        // Misal server kirim "2025-04-29T13:32" atau "2025-04-29 13:32"
        const [datePart, timePart] = dateString.split("T").length > 1 ? dateString.split("T") : dateString.split(" ");
        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":");
        
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 backdrop-blur-md z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
                <h2 className="text-xl font-semibold text-center mb-6">
                    History OnCall - No: {client.no}
                </h2>
                <h3 className="text-xl text-center mb-6">
                    SN: {client.serial}
                    , Mesin: {client.model}
                    , Cabang: {client.namacabang}
                    , Teknisi: {client.teknisi}
                </h3>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border border-gray-300">No</th>
                                <th className="px-4 py-2 border border-gray-300">Status</th>
                                <th className="px-4 py-2 border border-gray-300">Date</th>
                                <th className="px-4 py-2 border border-gray-300">Bukti</th>
                                <th className="px-4 py-2 border border-gray-300">Note</th>
                                <th className="px-4 py-2 border border-gray-300">No Lapker</th>
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
                                        {entry.date ? formatDateTime(entry.date) : "-"}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                        {entry.image ? (
                                            entry.image.endsWith(".pdf") ? (
                                                <button
                                                    className="text-blue-600 underline"
                                                    onClick={() => setPreviewImage(entry.image)}
                                                >
                                                    Lihat PDF
                                                </button>
                                            ) : (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/${entry.image}`}
                                                    alt="Bukti"
                                                    className="w-20 h-20 object-cover mx-auto rounded cursor-pointer hover:scale-105 transition-transform"
                                                    onClick={() => setPreviewImage(entry.image)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            setPreviewImage(entry.image);
                                                        }
                                                    }}
                                                />
                                            )
                                        ) : (
                                            "-"
                                        )}

                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {entry.note || "-"}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            {entry.lapker || "-"}
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

            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                    onClick={() => setPreviewImage(null)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                            setPreviewImage(null);
                        }
                    }}
                >
                    <div
                        className="relative bg-white p-4 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {previewImage.endsWith(".pdf") ? (
                            <iframe
                                src={`${import.meta.env.VITE_API_URL}/uploads/${previewImage}`}
                                title="Preview PDF"
                                className="w-[80vw] h-[80vh]"
                            />
                        ) : (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${previewImage}`}
                                alt="Preview"
                                className="max-w-[90vw] max-h-[90vh] rounded-lg"
                            />
                        )}
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
