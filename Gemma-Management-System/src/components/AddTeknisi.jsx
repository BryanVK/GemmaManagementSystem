import { useEffect, useState } from "react";
import axios from "axios";

export function AddTeknisi() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "gemma123",
        userType: "",
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
    
        const isDuplicateName = existingUsers.some(
            (user) => user.name.toLowerCase() === formData.name.toLowerCase()
        );
        const isDuplicateEmail = existingUsers.some(
            (user) => user.email.toLowerCase() === formData.email.toLowerCase()
        );
    
        if (isDuplicateName) newErrors.name = "Nama sudah digunakan";
        if (isDuplicateEmail) newErrors.email = "Email sudah digunakan";
    
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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, formData, {
                headers: { "Content-Type": "application/json" },
            });

            setFormData({
                name: "",
                email: "",
                password: "gemma123",
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

    const [existingUsers, setExistingUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
                setExistingUsers(response.data || []);
            } catch (error) {
                console.error("Gagal mengambil data user:", error);
            }
        };
        fetchUsers();
    }, []);


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
                        <button type="submit" disabled={loading} className="btn btn-primary w-1/3">
                            {loading ? "Loading..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
