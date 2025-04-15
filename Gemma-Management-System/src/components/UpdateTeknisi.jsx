import { useState, useEffect } from "react";
import axios from "axios";

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
        note: ""
    });

    const [image, setImage] = useState(null);

    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                note: client.note || ""
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

        const updatedData = {
            ...formData,
            date: formatDateTime()
        };

        const formPayload = new FormData();
        Object.keys(updatedData).forEach(key => {
            formPayload.append(key, updatedData[key]);
        });

        if (image) {
            formPayload.append("image", image);
        }

        try {
            await axios.post(`http://localhost:3000/api/clients/status`, formPayload, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Data berhasil diupdate!");
            onClose();
        } catch (error) {
            console.error("Error update:", error.response?.data || error.message);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-90 backdrop-blur-md z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg z-10">
                <h2 className="text-lg font-semibold text-center">Update Data OnCall</h2>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                            readOnly
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
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">Pilih Status</option>
                            <option value="Active">Active</option>
                            <option value="Proceed">Proceed</option>
                            <option value="Pending">Pending</option>
                            <option value="Canceled">Canceled</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full"
                            placeholder="Catatan Teknisi"
                            rows={3}
                        />
                    </div>

                    <div className="col-span-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input file-input-bordered w-full"
                        />
                    </div>

                    <div className="col-span-2 flex justify-between mt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary w-1/3">
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary w-2/3">
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
