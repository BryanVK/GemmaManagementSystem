import { useState, useEffect } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";

export function UpdateTeknisi({ client, onClose }) {
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
        createby: "",
        emailadmin: "",
        lapker: "",
        note: "",
        no: "",
        type: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                note: client.note || "",
                lapker: client.lapker || ""
            });
        }
    }, [client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const formatDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
    
        if (isSubmitting) return;
        setIsSubmitting(true);
    
        const updatedData = {
            ...formData,
            date: formatDateTime(),
            note: formData.note?.trim() || "",
            lapker: formData.lapker?.trim() || "", // pastikan kosong kalau tidak diisi
        };
        
        const formPayload = new FormData();
        Object.keys(updatedData).forEach(key => {
            formPayload.append(key, updatedData[key]);
        });
        
        // ❗ Tambahkan hanya jika user benar-benar memilih file baru
        if (image) {
            formPayload.append("image", image);
        } else {
            formPayload.append("image", ""); // atau abaikan ini jika server-mu otomatis handle
        }        
    
        // Validasi jika status memerlukan bukti image
        const statusRequiringImage = ["On Location", "Pending", "Completed"];
        if (statusRequiringImage.includes(formData.status) && !image) {
            alert("Silakan unggah bukti (image) untuk status tersebut.");
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/clients/status`, formPayload, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
    
            console.log("Data berhasil diupdate!");
    
            // Kirim email jika status berubah menjadi Completed
            if (client.status !== "Confirm" && formData.status === "Confirm") {
                await emailjs.send('service_wbyy3q9', 'template_443kmer', {
                    nextOC: formData.no,
                    email: formData.emailadmin,
                    model: formData.model,
                    name: formData.createby,
                    serial: formData.serial,
                    namacabang: formData.namacabang,
                    namacustomer: formData.namacustomer,
                    notelcustomer: formData.notelcustomer,
                    problem: formData.problem,
                    kategorikerusakan: formData.kategorikerusakan,
                    teknisi: formData.teknisi,
                    note: formData.note,
                    type: formData.type,
                }, 'KzSlC3IojJpUAFOoY');
    
                console.log("Email berhasil dikirim!");
            }
    
            onClose();
        } catch (error) {
            console.error("Error update:", error.response?.data || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-90 backdrop-blur-md z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg z-10">
                <h2 className="text-lg font-semibold text-center">Update Data OnCall</h2>
                <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-4">
                    <input
                        type="text"
                        name="serial"
                        value={formData.serial}
                        readOnly
                        className="input input-bordered w-full"
                        placeholder="Serial"
                    />

                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        readOnly
                        className="input input-bordered w-full"
                        placeholder="Model"
                    />

                    <input
                        type="text"
                        name="namacabang"
                        value={formData.namacabang}
                        readOnly
                        className="input input-bordered w-full"
                        placeholder="Nama Cabang"
                    />

                    <input
                        type="text"
                        name="teknisi"
                        value={formData.teknisi}
                        readOnly
                        className="input input-bordered w-full"
                        placeholder="Teknisi"
                    />

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                    >
                        <option value="">Pilih Status</option>
                        <option value="Active">Active</option>
                        <option value="Confirm">Confirm</option>
                        <option value="On Location">On Location</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <input
                        name="lapker"
                        onChange={handleChange}
                        value={formData.lapker}
                        className="input input-bordered w-full"
                        placeholder="No Lapker"
                    />

                    <textarea
                        name="note"
                        onChange={handleChange}
                        value={formData.note}
                        className="textarea textarea-bordered w-full"
                        placeholder="Catatan Teknisi"
                        rows={3}
                    />

                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleImageChange}
                        className="file-input file-input-bordered w-full"
                    />

                    <div className="flex justify-between">
                        <button type="button" onClick={onClose} className="btn btn-secondary w-1/3">
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary w-1/3">
                            Update
                        </button>
                    </div>
                </form>
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
                        <span className="loading loading-spinner text-primary w-12 h-12 mb-2"></span>
                        <p className="text-gray-700 font-medium">Mengupdate data...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
