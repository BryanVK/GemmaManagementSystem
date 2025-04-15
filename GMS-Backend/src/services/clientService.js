import { query } from "../db.js";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email) => {
    const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows[0]; // hanya ambil 1 user
};


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
            notelcustomer, status, no
        } = clientData;

        // Tidak perlu generate nextNo di sini karena sudah dari frontend
        const { rows } = await query(
            `INSERT INTO OnCall (
                serial, model, namacabang, teknisi, problem, 
                kategorikerusakan, date, namacustomer, 
                notelcustomer, status, no
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`, 
            [serial, model, namacabang, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, no]
        );

        console.log("Data Berhasil Disimpan:", rows[0]);
        return rows[0];
    } catch (err) {
        console.error("Gagal menyimpan data ke DB:", err);
        throw err;
    }
};

export const createClientsStatus = async (clientData) => {
    try {
        const {
            serial, model, namacabang, teknisi, problem,
            kategorikerusakan, date, namacustomer,
            notelcustomer, status, note, no, image
        } = clientData;

        const { rows } = await query(
            `INSERT INTO OnCall (serial, model, namacabang, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, no, note, image) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING *`, 
            [serial, model, namacabang, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, no, note, image]
        );

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

    const { rows } = await query(
        `UPDATE OnCall 
         SET serial = $1, model = $2, namacabang = $3, teknisi = $4, problem = $5,
             kategorikerusakan = $6, date = $7, namacustomer = $8, notelcustomer = $9,
             status = $10, note = $11
         WHERE id = $12
         RETURNING *`,
        [serial, model, namacabang, teknisi, problem, kategorikerusakan,
         date, namacustomer, notelcustomer, status, note, id]
    );

    return rows[0];
};


