const pool = require("./database");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
    try {
        console.log("🌱 Seeding admin user...");

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const query = `
            INSERT INTO users (full_name, phone, password_hash, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (phone) DO UPDATE 
            SET password_hash = EXCLUDED.password_hash
            RETURNING id, full_name, phone, role;
        `;

        const values = ["System Admin", "08000000000", hashedPassword, "admin"];
        const res = await pool.query(query, values);

        console.log("✅ Admin user ready:", res.rows[0]);
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
}

seedAdmin();