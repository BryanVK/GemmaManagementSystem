import { useState, useEffect } from "react";
import axios from "axios";

export function CreatePM() {
    const formatDateTime = () => {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, "0");

        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };
    const user = JSON.parse(localStorage.getItem("user"));
    const [formData, setFormData] = useState({
        serials: "",
        model: "",
        namacabang: "",
        teknisi: user.name,
        date: formatDateTime(),
        status: "Active",
        createby: user.name,
        emailadmin: user.email,
        type: "PM",
        active: formatDateTime(),
        alamat: ""
    });
    const [currentSerial, setCurrentSerial] = useState("");    

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const [availableSerials, setAvailableSerials] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [availableCabangs, setAvailableCabangs] = useState([]);

    const validateForm = () => {
        let newErrors = {};
    
        Object.keys(formData).forEach((key) => {
            if (!formData[key] && key !== "serials" && key !== "alamat") {
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

        if (name === "serial") {
            setCurrentSerial(value);
        }

        if (name === "model") {
            fetchAvailableModels(value);
        }
        
        if (name === "namacabang") {
            fetchAvailableCabangs(value);
        }

        if (name === "status" && value === "Active") {
            setFormData((prev) => ({ ...prev, active: formatDateTime() }));
        }
    };

    // Menggunakan useEffect untuk pengambilan data yang lebih efisien
    useEffect(() => {
        if (formData.model || formData.namacabang) {
            fetchAvailableSerials(formData.model, formData.namacabang);
        }
    }, [formData.model, formData.namacabang]);

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
            } else {
                setFormData((prev) => ({
                    ...prev,
                    model: "",
                    namacabang: "",
                    alamat: "-"
                }));
                setErrorMsg("⚠ Serial tidak ditemukan. Anda dapat membuka input manual.");
            }
        } catch (error) {
            console.error("Error fetching machine data:", error);
        }
    };

    const fetchAvailableModels = async (keyword) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine`);
            const machines = response.data;

            const filteredModels = machines
                .filter(m => m.MachineType?.toLowerCase().includes(keyword.toLowerCase()))
                .map(m => m.MachineType);

            const uniqueModels = [...new Set(filteredModels)];
            setAvailableModels(uniqueModels);
        } catch (err) {
            console.error("Error fetching models:", err);
        }
    };
    
    const fetchAvailableCabangs = async (keyword) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine`);
            const machines = response.data;

            const filteredCabangs = machines
                .filter(m => m.Customer?.toLowerCase().includes(keyword.toLowerCase()))
                .map(m => m.Customer);

            const uniqueCabangs = [...new Set(filteredCabangs)];
            setAvailableCabangs(uniqueCabangs);
        } catch (err) {
            console.error("Error fetching cabangs:", err);
        }
    };

    const handleAddSerial = () => {
        if (!currentSerial.trim()) {
            setErrorMsg("⚠ Serial tidak boleh kosong");
            return;
        }
    
        if (formData.serials.includes(currentSerial)) {
            setErrorMsg("⚠ Serial sudah ada");
            return;
        }
    
        setFormData((prev) => ({
            ...prev,
            serials: prev.serials ? `${prev.serials},${currentSerial}` : currentSerial,
        }));
    
        setCurrentSerial("");
        setErrorMsg("");
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    
        setLoading(true);
    
        try {
            const responseClients = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`);
            const clients = responseClients.data;
    
            const ocNumbers = clients
                .map((client) => client.no)
                .filter((no) => typeof no === "string" && /^OC\d{4}$/.test(no));
            const ocNumbersInt = ocNumbers.map((no) => parseInt(no.slice(2), 10));
            const maxOC = ocNumbersInt.length > 0 ? Math.max(...ocNumbersInt) : 0;
            const nextOC = `OC${(maxOC + 1).toString().padStart(4, "0")}`;
    
            const dataToSubmit = {
                ...formData,
                serial: formData.serials,
                no: nextOC,
                type: "PM",
                teknisi: user.name,
                active: formData.status === "Active" ? formatDateTime() : null,
            };
    
            await axios.post(`${import.meta.env.VITE_API_URL}/api/clients`, dataToSubmit, {
                headers: { "Content-Type": "application/json" },
            });
    
            const responseUsers = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            const teknisiEmail = responseUsers.data.find(user => user.name === formData.teknisi)?.email;
    
            if (!teknisiEmail) {
                throw new Error("Email teknisi tidak ditemukan");
            }
    
            console.log("Email sent!");
    
            setFormData({
                serials: "",
                model: "",
                namacabang: "",
                teknisi: user.name,
                date: formatDateTime(),
                status: "Active",
                createby: user.name,
                emailadmin: user.email,
                type: "PM",
                active: "",
                alamat: ""
            });
    
            window.location.href = "/";
    
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            setErrorMsg("Gagal mengirim email atau menyimpan data. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        window.location.href = "/";
    };

    const fetchAvailableSerials = async (model, namacabang) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/machine`);
            const allMachines = response.data;

            const filtered = allMachines.filter(machine => {
                const matchModel = model ? machine.MachineType?.toLowerCase().includes(model.toLowerCase()) : true;
                const matchCabang = namacabang ? machine.Customer?.toLowerCase().includes(namacabang.toLowerCase()) : true;
                return matchModel && matchCabang;
            });

            setAvailableSerials(filtered.map((m) => m.SerialNo));
        } catch (error) {
            console.error("Error fetching available serials:", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-lg font-semibold text-center">Tambah Data PM</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                name="serial" 
                                list="serial-suggestions"
                                value={currentSerial} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                placeholder="Tambah Serial" 
                            />
                        </div>
                        <datalist id="serial-suggestions">
                            {availableSerials.map((serial, index) => (
                                <option key={index} value={serial} />
                            ))}
                        </datalist>
                        <button 
                            type="button" 
                            onClick={handleAddSerial} 
                            className="btn btn-outline mt-2"
                        >
                            Tambah Serial
                        </button>
                        <p className="text-sm text-red-500">{errorMsg}</p>
                    </div>

                    {/* Other inputs here */}

                    <div className="col-span-2">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                        >
                            {loading ? "Menunggu..." : "Kirim"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
