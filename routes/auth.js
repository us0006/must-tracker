const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
    const { name, email, reg_id, role, department, session, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users(name, email, reg_id, role, department, session, password, status) VALUES(?,?,?,?,?,?,?, 'active')";
        db.query(sql, [name, email, reg_id, role, department, session, hash], (err) => {
            if (err) return res.status(500).json({ success: false, message: "Registration failed. ID or Email might already exist." });
            res.json({ success: true });
        });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

router.post("/login", (req, res) => {
    const { id, role, password } = req.body;
    const sql = "SELECT * FROM users WHERE reg_id = ? AND role = ?";
    db.query(sql, [id, role], async (err, result) => {
        if (err || result.length === 0) return res.json({ success: false, message: "Invalid credentials or role mismatch." });
        if (result[0].status === 'inactive') return res.json({ success: false, message: "Your account has been deactivated by the Admin." });

        const match = await bcrypt.compare(password, result[0].password);
        if (!match) return res.json({ success: false, message: "Invalid credentials or role mismatch." });

        req.session.user = { id: result[0].id, name: result[0].name, reg_id: result[0].reg_id, role: result[0].role };
        res.json({ success: true, role: result[0].role });
    });
});

router.get("/profile", (req, res) => {
    if (req.session.user) {
        db.query("SELECT email FROM users WHERE id = ?", [req.session.user.id], (err, results) => {
            let userEmail = "";
            if(!err && results.length > 0) userEmail = results[0].email;
            res.json({ success: true, name: req.session.user.name, reg_id: req.session.user.reg_id, email: userEmail });
        });
    } else {
        res.status(401).json({ success: false });
    }
});

router.put("/update-profile", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const userId = req.session.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    try {
        db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, results) => {
            if (err || results.length === 0) return res.status(500).json({ success: false, message: "User not found." });
            
            const match = await bcrypt.compare(currentPassword, results[0].password);
            if (!match) return res.status(400).json({ success: false, message: "Incorrect current password!" });

            let finalPasswordHash = results[0].password;
            if (newPassword && newPassword.trim() !== "") {
                finalPasswordHash = await bcrypt.hash(newPassword, 10);
            }

            db.query("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?", [name, email, finalPasswordHash, userId], (updateErr) => {
                if (updateErr) return res.status(500).json({ success: false, message: "Failed to update. Email might be in use." });
                req.session.user.name = name;
                res.json({ success: true, message: "Profile updated successfully!" });
            });
        });
    } catch (error) { res.status(500).json({ success: false, message: "Server error" }); }
});

module.exports = router;