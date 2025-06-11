import { query } from "../db.js";

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

export const getUsersEmail = async (email) => {
    const { rows } = await query('SELECT * FROM users WHERE "email" = $1', [email]);
    return rows;
};

export const getUsers = async () => {
    const { rows } = await query('SELECT * FROM users');
    return rows;
};

export const createClient = async (clientData) => {
    try {
        console.log("Data yang akan Disimpan ke DB:", clientData); // Debug

        const {
            serial, model, namacabang, alamat, teknisi, problem,
            kategorikerusakan, date, namacustomer,
            notelcustomer, status, createby, emailadmin, no, type
        } = clientData;

        // Tidak perlu generate nextNo di sini karena sudah dari frontend
        const { rows } = await query(
            `INSERT INTO OnCall (
                serial, model, namacabang, alamat, teknisi, problem, 
                kategorikerusakan, date, namacustomer, 
                notelcustomer, status, createby, emailadmin, no, type
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`, 
            [serial, model, namacabang, alamat, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, createby, emailadmin, no, type]
        );

        console.log("Data Berhasil Disimpan:", rows[0]);
        return rows[0];
    } catch (err) {
        console.error("Gagal menyimpan data ke DB:", err);
        throw err;
    }
};

export const createMachine = async (clientData) => {
    try {
        console.log("Data yang akan Disimpan ke DB:", clientData); // Debug

        const {
            model, serial, namacabang, alamat, date,  
        } = clientData;

        // Tidak perlu generate nextNo di sini karena sudah dari frontend
        const { rows } = await query(
            `INSERT INTO public."Machine"(
            "MachineType", "SerialNo", "Customer", "CustomerAddress", "TanggalKeluar")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`, 
            [ model, serial ,namacabang, alamat, date]
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
            serial, model, namacabang, alamat, teknisi, problem,
            kategorikerusakan, date, namacustomer,
            notelcustomer, status, note, no, createby,
            emailadmin, lapker, type, images // pakai images sebagai string CSV
        } = clientData;

        const { rows } = await query(
            `INSERT INTO OnCall (serial, model, namacabang, alamat, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, no, note, createby, emailadmin, lapker, type, images) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [serial, model, namacabang, alamat, teknisi, problem, kategorikerusakan, date, namacustomer, notelcustomer, status, no, note, createby, emailadmin, lapker, type, images]
        );

        return rows[0];
    } catch (err) {
        console.error("Gagal menyimpan data ke DB:", err);
        throw err;
    }
};

export const createUsers = async (clientData) => {
    try {
        console.log("Data yang akan Disimpan ke DB:", clientData);

        const { name, email, password, userType } = clientData;

        // Ambil user_id terbesar saat ini dari tabel users
        const { rows: maxRows } = await query(`
            SELECT MAX(user_id::int) AS max_id FROM public.users
        `);

        const maxId = maxRows[0]?.max_id || 1000; // Jika belum ada, mulai dari 1001
        const newUserId = maxId + 1; // Menambah 1 untuk user_id baru

        // Simpan user baru dengan user_id tersebut
        const { rows } = await query(
            `INSERT INTO public.users(
                user_id, name, email, password, "userType"
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [newUserId, name, email, password, userType]
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


