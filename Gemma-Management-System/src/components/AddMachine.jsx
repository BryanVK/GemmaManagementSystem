import { useState } from "react";
import axios from "axios";

export function AddMachine() {
    const formatDateTime = () => {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    const [formData, setFormData] = useState({
        model: "",
        serial: "",
        namacabang: "",
        date: formatDateTime(),
        alamat: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const [availableSerials, setAvailableSerials] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [availableCabangs, setAvailableCabangs] = useState([]);
    const [serialFound, setSerialFound] = useState(true); // Flag tambahan

    const validateForm = () => {
        let newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (!formData[key]) {
                newErrors[key] = "Field ini wajib diisi";
            }
        });

        if (!serialFound) {
            newErrors.serial = "Serial tidak ditemukan. Silakan buka input manual.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "serial") {
            fetchMachineData(value);
        }

        if (name === "model") {
            fetchAvailableModels(value);
            fetchAvailableSerials({ ...formData, model: value });
        }

        if (name === "namacabang") {
            fetchAvailableCabangs(value);
            fetchAvailableSerials({ ...formData, namacabang: value });
        }
    };

    const fetchMachineData = async (serial) => {
        if (!serial) return;
    
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine?serialNo=${serial}`);
            if (response.data.length > 0) {
                const machine = response.data[0];
                setFormData((prev) => ({
                    ...prev,
                    model: machine.MachineType || "",
                    namacabang: machine.Customer || "",
                    alamat: machine.CustomerAddress || ""
                }));
                setErrorMsg("");
                setSerialFound(true);
            } else {
                setFormData((prev) => ({
                    ...prev,
                    model: "",
                    namacabang: "",
                    alamat: ""
                }));
                setErrorMsg("⚠ Serial tidak ditemukan. Anda dapat membuka input manual.");
                setSerialFound(false);
    
                // Insert data into the database when serial is not found
                const dataToInsert = {
                    model: formData.model,  // Default to an empty model or the form value
                    serial: serial,
                    namacabang: formData.namacabang,  // Default to an empty cabang or the form value
                    date: formatDateTime(),
                    alamat: formData.alamat,  // Default to an empty address or the form value
                };
    
                try {
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/machine`, dataToInsert, {
                        headers: { "Content-Type": "application/json" },
                    });
                    setErrorMsg("Data mesin baru berhasil ditambahkan.");
                } catch (error) {
                    console.error("Error inserting machine:", error);
                    setErrorMsg("Gagal menyimpan data mesin. Silakan coba lagi.");
                }
            }
        } catch (error) {
            console.error("Error fetching machine data:", error);
        }
    };    

    const fetchAvailableModels = async (keyword) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine`);
            const filteredModels = response.data
                .filter(m => m.MachineType?.toLowerCase().includes(keyword.toLowerCase()))
                .map(m => m.MachineType);
            setAvailableModels([...new Set(filteredModels)]);
        } catch (err) {
            console.error("Error fetching models:", err);
        }
    };

    const fetchAvailableCabangs = async (keyword) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine`);
            const filteredCabangs = response.data
                .filter(m => m.Customer?.toLowerCase().includes(keyword.toLowerCase()))
                .map(m => m.Customer);
            setAvailableCabangs([...new Set(filteredCabangs)]);
        } catch (err) {
            console.error("Error fetching cabangs:", err);
        }
    };

    const fetchAvailableSerials = async ({ model, namacabang }) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine`);
            const filtered = response.data.filter(machine => {
                const matchModel = model ? machine.MachineType?.toLowerCase().includes(model.toLowerCase()) : true;
                const matchCabang = namacabang ? machine.Customer?.toLowerCase().includes(namacabang.toLowerCase()) : true;
                return matchModel && matchCabang;
            });
            setAvailableSerials(filtered.map(m => m.SerialNo));
        } catch (error) {
            console.error("Error fetching serials:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/machine`, dataToSubmit, {
                headers: { "Content-Type": "application/json" },
            });

            setFormData({
                model: "",
                serial: "",
                namacabang: "",
                date: formatDateTime(),
                alamat: "",
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
                <h2 className="text-lg font-semibold text-center">Tambah Data Mesin</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="col-span-2">
                        <input 
                            type="text" 
                            name="serial" 
                            list="serial-suggestions"
                            value={formData.serial} 
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Serial" 
                        />
                        <datalist id="serial-suggestions">
                            {availableSerials.map((serial, idx) => (
                                <option key={idx} value={serial} />
                            ))}
                        </datalist>
                        {errors.serial && <p className="text-red-500 text-sm">{errors.serial}</p>}
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm col-span-2">{errorMsg}</p>}

                    <div>
                        <input 
                            type="text" 
                            name="model" 
                            list="model-suggestions"
                            value={formData.model || ""}
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Model" 
                        />
                        <datalist id="model-suggestions">
                            {availableModels.map((model, idx) => (
                                <option key={idx} value={model} />
                            ))}
                        </datalist>
                        {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                    </div>

                    <div>
                        <input 
                            type="text" 
                            name="namacabang" 
                            list="cabang-suggestions"
                            value={formData.namacabang || ""} 
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Nama Cabang" 
                        />
                        <datalist id="cabang-suggestions">
                            {availableCabangs.map((cabang, idx) => (
                                <option key={idx} value={cabang} />
                            ))}
                        </datalist>
                        {errors.namacabang && <p className="text-red-500 text-sm">{errors.namacabang}</p>}
                    </div>

                    <div>
                        <input 
                            type="text" 
                            name="alamat" 
                            value={formData.alamat || ""}  
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Alamat" 
                        />
                    </div>

                    <div>
                        <input 
                            type="text" 
                            name="date" 
                            value={formData.date} 
                            readOnly
                            className="input input-bordered w-full" 
                        />
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
