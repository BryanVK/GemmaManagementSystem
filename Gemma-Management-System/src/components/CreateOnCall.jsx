import { useState, useEffect } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";

export function CreateOnCall() {
    const formatDateTime = () => {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, "0");

        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };
    const user = JSON.parse(localStorage.getItem("user"));
    const [formData, setFormData] = useState({
        serial: "",
        model: "",
        namacabang: "",
        alamat: "",
        teknisi: "",
        problem: "",
        kategorikerusakan: "",
        date: formatDateTime(),
        namacustomer: "",
        notelcustomer: "",
        status: "Active",
        createby: user.name,
        emailadmin: user.email,
        type: "OnCall",
        active: formatDateTime() // Langsung isi saat init
    });    

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [errors, setErrors] = useState({});
    const [availableSerials, setAvailableSerials] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [availableCabangs, setAvailableCabangs] = useState([]);
    const [availableTeknisi, setAvailableTeknisi] = useState([]); // State for teknisi

    useEffect(() => {
        // Fetch teknisi data from backend (assuming API endpoint is available)
        const fetchAvailableTeknisi = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`); // Adjust the endpoint as needed
                setAvailableTeknisi(response.data); // Assuming response contains teknisi data
                console.log(response.data); // Cek apakah data teknisi ada
            } catch (err) {
                console.error("Error fetching teknisi:", err);
            }
        };
        
        fetchAvailableTeknisi(); // Call on component mount
    }, []);

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
        if (name === "status" && value === "Active") {
            setFormData((prev) => ({ ...prev, active: formatDateTime() }));
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
                    alamat: machine.CustomerAddress || ""  // Add the address field here
                }));
    
                setErrorMsg("");
            } else {
                setFormData((prev) => ({
                    ...prev,
                    model: "",
                    namacabang: "",
                    alamat: "-"  // Set to "-" if no machine data found
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
    
            // Buat list unik
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    
        setLoading(true);
    
        try {
            // Ambil data client dan teknisi
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
                no: nextOC,
                type: "CM",
                active: formData.status === "Active" ? formatDateTime() : null,
            };
    
            await axios.post(`${import.meta.env.VITE_API_URL}/api/clients`, dataToSubmit, {
                headers: { "Content-Type": "application/json" },
            });
    
            // Ambil data teknisi dari API
            const responseUsers = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            const teknisiEmail = responseUsers.data.find(user => user.name === formData.teknisi)?.email;
            
            if (!teknisiEmail) {
                throw new Error("Email teknisi tidak ditemukan");
            }
    
            // Kirim email menggunakan EmailJS
            await emailjs.send('service_wbyy3q9', 'template_nxfux4g', {
                nextOC: nextOC,
                email: teknisiEmail, // Kirim email ke teknisi yang dipilih
                model: formData.model,
                name: formData.teknisi,
                serial: formData.serial,
                namacabang: formData.namacabang,
                alamat: formData.alamat,  // Use formData.alamat here
                namacustomer: formData.namacustomer,
                notelcustomer: formData.notelcustomer,
                problem: formData.problem,
                kategorikerusakan: formData.kategorikerusakan
            }, 'KzSlC3IojJpUAFOoY');            
    
            console.log("Email sent!");
    
            setFormData({
                serial: "",
                model: "",
                namacabang: "",
                alamat: "",
                teknisi: "",
                problem: "",
                kategorikerusakan: "",
                date: formatDateTime(),
                namacustomer: "",
                notelcustomer: "",
                status: "Active",
                createby: user.name,
                emailadmin: user.email,
                type: "OnCall",
                active: ""
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

    const fetchAvailableSerials = async ({ model, namacabang }) => {
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
                <h2 className="text-lg font-semibold text-center">Tambah Data OnCall</h2>

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
                            value={formData.alamat || ""}  // Set default value to empty string if not filled
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Alamat" 
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
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Problem" 
                        />
                        {errors.problem && <p className="text-red-500 text-sm">{errors.problem}</p>}
                    </div>

                    <div>
                        <select
                            name="kategorikerusakan"
                            value={formData.kategorikerusakan}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        >
                            <option value="">Pilih Kategori Kerusakan</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Error">Error</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                        {errors.kategorikerusakan && <p className="text-red-500 text-sm">{errors.kategorikerusakan}</p>}
                    </div>

                    <div>
                        <input 
                            type="text" 
                            name="namacustomer" 
                            value={formData.namacustomer} 
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="Nama Customer" 
                        />
                        {errors.namacustomer && <p className="text-red-500 text-sm">{errors.namacustomer}</p>}
                    </div>

                    <div>
                        <input 
                            type="text" 
                            name="notelcustomer" 
                            value={formData.notelcustomer} 
                            onChange={handleChange} 
                            className="input input-bordered w-full" 
                            placeholder="No Tel Customer" 
                        />
                        {errors.notelcustomer && <p className="text-red-500 text-sm">{errors.notelcustomer}</p>}
                    </div>

                    <div>
                        <input 
                            type="text" 
                            name="status" 
                            value={formData.status} 
                            readOnly
                            className="input input-bordered w-full" 
                            placeholder="Status" 
                        />
                        {errors.notelcustomer && <p className="text-red-500 text-sm">{errors.status}</p>}
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
