/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import emailjs from '@emailjs/browser';


export function UpdateOnCall({ client, onClose }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const [availableTeknisi, setAvailableTeknisi] = useState([]);
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
        // Jika ada data client, set form data
        if (client) {
            setFormData({
                ...client,
                note: client.note || "" // pastikan note ada
            });
        }
    
        // Fetch data teknisi
        const fetchAvailableTeknisi = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`); // Ganti sesuai kebutuhan
                setAvailableTeknisi(response.data); // Set data teknisi
                console.log(response.data); // Debug
            } catch (err) {
                console.error("Error fetching teknisi:", err);
            }
        };
    
        fetchAvailableTeknisi();
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
            await axios.put(`${import.meta.env.VITE_API_URL}/api/clients/${client.id}`, updatedData, {
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
            // 1. Tandai data lama jadi Canceled
            const canceledData = {
                ...client,
                status: "Canceled",
                date: formatDateTime()
            };
    
            await axios.put(`${import.meta.env.VITE_API_URL}/api/clients/${client.id}`, canceledData, {
                headers: { "Content-Type": "application/json" }
            });
    
            // 2. Ambil semua data untuk generate nomor OC baru
            const responseClients = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`);
            const clients = responseClients.data;
    
            const ocNumbers = clients
                .map((c) => c.no)
                .filter((no) => typeof no === "string" && /^OC\d{4}$/.test(no));
            const ocNumbersInt = ocNumbers.map((no) => parseInt(no.slice(2), 10));
            const maxOC = ocNumbersInt.length > 0 ? Math.max(...ocNumbersInt) : 0;
            const nextOC = `OC${(maxOC + 1).toString().padStart(4, "0")}`;
    
            // 3. Data baru dengan teknisi baru
            const newData = {
                ...client,
                teknisi: formData.teknisi,
                status: "Active",
                no: nextOC,
                active: formatDateTime(),
                date: formatDateTime()
            };
    
            delete newData.id;
    
            await axios.post(`${import.meta.env.VITE_API_URL}/api/clients`, newData, {
                headers: { "Content-Type": "application/json" }
            });
    
            // 4. Ambil email teknisi
            const responseUsers = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            const teknisiEmail = responseUsers.data.find(user => user.name === formData.teknisi)?.email;
    
            if (!teknisiEmail) {
                throw new Error("Email teknisi tidak ditemukan");
            }
    
            // 5. Kirim email
            await emailjs.send('service_wbyy3q9', 'template_nxfux4g', {
                nextOC: nextOC,
                email: teknisiEmail,
                model: formData.model,
                name: formData.teknisi,
                serial: formData.serial,
                namacabang: formData.namacabang,
                alamat: formData.alamat,  // Pastikan ada field alamat
                namacustomer: formData.namacustomer,
                notelcustomer: formData.notelcustomer,
                problem: formData.problem,
                kategorikerusakan: formData.kategorikerusakan
            }, 'KzSlC3IojJpUAFOoY');
    
            console.log("Email sent and data updated successfully!");
            onClose();
    
        } catch (error) {
            console.error("Gagal insert data baru atau kirim email:", error.response?.data || error.message);
            setErrorMsg("Terjadi kesalahan saat mengupdate dan mengirim email.");
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
                        <select 
                            name="teknisi" 
                            value={formData.teknisi} 
                            onChange={handleChange} 
                            className="input input-bordered w-full"
                        >
                            <option value="">Pilih Teknisi</option>
                            {availableTeknisi.map((teknisi, idx) => (
                                <option key={idx} value={teknisi.name}>
                                    {teknisi.name}
                                </option>
                            ))}
                        </select>
                        {errors.teknisi && <p className="text-red-500 text-sm">{errors.teknisi}</p>}
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
