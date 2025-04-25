import { useState } from "react";
import axios from "axios";

export function AddTeknisi() {
    const formatDateTime = () => {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        userType: "", // userType is now initialized as an empty string
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (!formData[key]) {
                newErrors[key] = "Field ini wajib diisi";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
            };

            await axios.post("http://localhost:3000/api/users", dataToSubmit, {
                headers: { "Content-Type": "application/json" },
            });

            setFormData({
                name: "",
                email: "",
                password: "",
                userType: "",
            });

            window.location.href = "/";
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            setErrorMsg("Gagal menyimpan data. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        window.location.href = "/";
    };

    return (
        <div className="p-6 max-w-3xl mx-auto left-0">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-lg font-semibold text-center">Tambah Data User</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="col-span-2">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Name"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm col-span-2">{errorMsg}</p>}

                    <div>
                        <input
                            type="text"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Email"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="password"
                            value={formData.password || ""}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Password"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div>
                        <select
                            name="userType"
                            value={formData.userType || ""}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        >
                            <option value="">Pilih User Type</option>
                            <option value="Teknisi">Teknisi</option>
                            <option value="Admin">Admin</option>
                        </select>
                        {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}
                    </div>

                    <div className="col-span-2 flex justify-between mt-4">
                        <button type="button" onClick={handleCancel} className="btn btn-secondary w-1/3">
                            Batal
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary w-1/3">
                            {loading ? "Loading..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
