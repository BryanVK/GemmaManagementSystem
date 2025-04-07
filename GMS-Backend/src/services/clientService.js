import { query } from "../db.js";

export const getClients = async () => {
    const { rows } = await query('SELECT * FROM OnCall');
    return rows;
};

export const getMachine = async (serialNo) => {
    const { rows } = await query('SELECT * FROM "Machine" WHERE "SerialNo" = $1', [serialNo]);
    return rows;
};

export const createClient = async (clientData) => {
    try {
        console.log("Data yang akan Disimpan ke DB:", clientData); // Debug

        const {
            serial, model, namacabang, teknisi, problem,
            kategorikerusakan, date, namacustomer,
            notelcustomer, status, active
        } = clientData;

        const { rows: lastRow } = await query('SELECT No FROM OnCall ORDER BY id DESC LIMIT 1');

        let nextNo = 'OC0001'; 
        if (lastRow.length > 0 && lastRow[0]?.no) {
            const lastNo = lastRow[0].no;
            const lastNumber = parseInt(lastNo.substring(2), 10) || 0;
            nextNo = `OC${String(lastNumber + 1).padStart(4, '0')}`;
        }

        console.log("Nomor Tiket yang akan Disimpan:", nextNo);

        const { rows } = await query(
            `INSERT INTO OnCall (serial, model, namacabang, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, no, active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, 
            [serial, model, namacabang, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, nextNo, active]
        );

        console.log("Data Berhasil Disimpan:", rows[0]);
        return rows[0];
    } catch (err) {
        console.error("Gagal menyimpan data ke DB:", err);
        throw err;
    }
};

export const updateClient = async (id, clientData) => {
    const {
        serial, model, namacabang, teknisi, problem, kategorikerusakan,
        date, namacustomer, notelcustomer, status, note
    } = clientData;

// Ambil data sebelumnya
    const { rows: existingRows } = await query('SELECT * FROM OnCall WHERE id = $1', [id]);
    if (existingRows.length === 0) {
        throw new Error(`Data dengan ID ${id} tidak ditemukan`);
    }

    const previousData = existingRows[0];

    const completed = (status === "Completed") ? new Date().toISOString() : previousData.completed;
    const active = (status === "Active") ? new Date().toISOString() : previousData.active;
    const pending = (status === "Pending") ? new Date().toISOString() : previousData.pending;
    const cancelled = (status === "Cancelled") ? new Date().toISOString() : previousData.cancelled;


    const { rows } = await query(
        `UPDATE OnCall 
         SET serial = $1, model = $2, namacabang = $3, teknisi = $4, problem = $5,
             kategorikerusakan = $6, date = $7, namacustomer = $8, notelcustomer = $9,
             status = $10, note = $11, completed = $12, active = $13, pending = $14, cancelled = $15
         WHERE id = $16
         RETURNING *`,
        [serial, model, namacabang, teknisi, problem, kategorikerusakan,
         date, namacustomer, notelcustomer, status, note, completed, active, pending, cancelled, id]
    );

    return rows[0];
};


