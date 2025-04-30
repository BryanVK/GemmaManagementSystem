import { useState } from "react";
import axios from "axios";

export function AddTeknisi() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        userType: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const [emailExists, setEmailExists] = useState(false);

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

    const checkEmailExists = async (email) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/usersEmail`, {
                params: { email },
            });
            return false; // Email belum ada
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return true; // Email sudah terdaftar
            }
            console.error("Email check failed:", error);
            return false;
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "email") {
            const exists = await checkEmailExists(value);
            setEmailExists(exists);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const isEmailExist = await checkEmailExists(formData.email);
            if (isEmailExist) {
                setErrors((prev) => ({ ...prev, email: "Email sudah terdaftar" }));
                setEmailExists(true);
                setLoading(false);
                return;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, formData, {
                headers: { "Content-Type": "application/json" },
            });

            setFormData({
                name: "",
                email: "",
                password: "",
                userType: "",
            });
            setEmailExists(false);
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
                            value={formData.email}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Email"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        {emailExists && <p className="text-red-500 text-sm">Email sudah terdaftar</p>}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Password"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div>
                        <select
                            name="userType"
                            value={formData.userType}
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
                        <button type="submit" disabled={loading || emailExists} className="btn btn-primary w-1/3">
                            {loading ? "Loading..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
