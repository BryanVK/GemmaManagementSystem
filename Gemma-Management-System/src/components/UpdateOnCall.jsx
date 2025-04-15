/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";

export function UpdateOnCall({ client, onClose }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        serial: "",
        model: "",
        namacabang: "",
        teknisi: "",
        problem: "",
        kategorikerusakan: "",
        namacustomer: "",
        notelcustomer: "",
        status: "",
        note: ""
    });

    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                note: client.note || "" // in case `note` belum ada
            });
        }
    }, [client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const formatDateTime = () => {
        const now = new Date();
    
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // bulan 0-11
        const day = String(now.getDate()).padStart(2, '0');
    
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };    

    const handleUpdate = async (e) => {
        e.preventDefault();

        const updatedData = {
            ...formData,
            status: "Canceled", // Set status to 'Canceled' for update
            date: formatDateTime()
        };

        try {
            await axios.put(`http://localhost:3000/api/clients/${client.id}`, updatedData, {
                headers: { "Content-Type": "application/json" }
            });

            console.log("Data berhasil diupdate!");
        } catch (error) {
            console.error("Error update:", error.response?.data || error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        setLoading(true);
    
        try {
            // 1. Update data lama jadi "Canceled"
            const canceledData = {
                ...client,
                status: "Canceled",
                date: formatDateTime()
            };
    
            await axios.put(`http://localhost:3000/api/clients/${client.id}`, canceledData, {
                headers: { "Content-Type": "application/json" }
            });
    
            // 2. Ambil semua data buat generate nomor OC baru
            const response = await axios.get("http://localhost:3000/api/clients");
            const clients = response.data;
    
            const ocNumbers = clients
                .map((c) => c.no)
                .filter((no) => typeof no === "string" && /^OC\d{4}$/.test(no));
    
            const ocNumbersInt = ocNumbers.map((no) => parseInt(no.slice(2), 10));
            const maxOC = ocNumbersInt.length > 0 ? Math.max(...ocNumbersInt) : 0;
            const nextOC = `OC${(maxOC + 1).toString().padStart(4, "0")}`;
    
            // 3. Kirim data baru dengan teknisi baru dan status Active
            const newData = {
                ...client,
                teknisi: formData.teknisi, // teknisi baru dari input
                status: "Active",
                no: nextOC,
                active: formatDateTime(),
                date: formatDateTime()
            };
    
            delete newData.id; // pastikan tidak bawa ID lama
    
            await axios.post("http://localhost:3000/api/clients", newData, {
                headers: { "Content-Type": "application/json" }
            });
    
            console.log("Data baru berhasil dikirim:", newData);
            onClose();
        } catch (error) {
            console.error("Gagal insert data baru:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-90 backdrop-blur-md">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg z-10">
                <h2 className="text-lg font-semibold text-center">Update Data OnCall</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="col-span-2">
                        <input
                            type="text"
                            name="serial"
                            value={formData.serial}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="Serial"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="Model"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="namacabang"
                            value={formData.namacabang}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="Nama Cabang"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="teknisi"
                            value={formData.teknisi}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Teknisi"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="problem"
                            value={formData.problem}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="Problem"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="kategorikerusakan"
                            value={formData.kategorikerusakan}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="Kategori Kerusakan"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="namacustomer"
                            value={formData.namacustomer}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="Nama Customer"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="notelcustomer"
                            value={formData.notelcustomer}
                            readOnly
                            className="input input-bordered w-full"
                            placeholder="No Telp Customer"
                        />
                    </div>

                    <div>
                    <input
                            name="status"
                            value={formData.status}
                            className="input input-bordered w-full"
                        />    
                    </div>

                    <div className="col-span-2 flex justify-between mt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary w-1/3">
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary w-2/3">
                            Submit & Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
