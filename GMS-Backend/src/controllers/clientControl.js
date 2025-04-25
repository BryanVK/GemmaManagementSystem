import * as clientService from "../services/clientService.js";

export const getClients = async (req, res) => {
    try{
        const clients = await clientService.getClients();
        res.status(200).json(clients);
    }
    catch (err){
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'internal server error'});
    }
};

export const getMachine = async (req, res) => {
    try {
        const { serialNo } = req.query; // Ambil serialNo dari request
        if (!serialNo) {
            return res.status(400).json({ message: 'serialNo is required' });
        }
        
        const machine = await clientService.getMachine(serialNo);
        if (machine.length === 0) {
            return res.status(404).json({ message: 'Machine not found' });
        }

        res.status(200).json(machine);
    } catch (err) {
        console.error('Error fetching machine:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getUsers = async (req, res) => {
    try{
        const clients = await clientService.getUsers();
        res.status(200).json(clients);
    }
    catch (err){
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'internal server error'});
    }
};

export const createClients = async (req, res) => {
    try{
        const clientData = req.body;
        const newClient = await clientService.createClient(clientData);
        res.status(200).json(newClient);
    }
    catch (err){
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'internal server error'});
    }
};

export const createMachine = async (req, res) => {
    try{
        const clientData = req.body;
        const newClient = await clientService.createMachine(clientData);
        res.status(200).json(newClient);
    }
    catch (err){
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'internal server error'});
    }
};

export const createClientsStatus = async (req, res) => {
    try {
        const clientData = req.body;
        const image = req.file;

        if (image) {
            clientData.image = image.filename; // atau path lengkap kalau perlu
        }

        const newClient = await clientService.createClientsStatus(clientData);
        res.status(200).json(newClient);
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'internal server error' });
    }
};

export const updateClients = async (req, res) => {
    try {
        const { id } = req.params; // Tangkap ID dari parameter URL
        const clientData = req.body; // Ambil data yang ingin diupdate

        if (!id) {
            return res.status(400).json({ message: "Client ID is required" });
        }

        const updatedClient = await clientService.updateClient(id, clientData);
        res.status(200).json(updatedClient);
    } 
    catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};
