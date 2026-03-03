const router = require("express").Router();
const db = require("../db");

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).send("Unauthorized. Admin access required.");
    }
    next();
};

router.get("/stats", isAdmin, (req, res) => {
    const stats = { total_students: 0, total_teachers: 0, total_achievements: 0, pending_approvals: 0 };
    db.query("SELECT role, COUNT(*) as count FROM users GROUP BY role", (err, users) => {
        if (err) return res.status(500).send(err);
        users.forEach(u => {
            if(u.role === 'student') stats.total_students = u.count;
            if(u.role === 'teacher') stats.total_teachers = u.count;
        });
        db.query("SELECT status, COUNT(*) as count FROM achievements GROUP BY status", (err, achs) => {
            if (err) return res.status(500).send(err);
            achs.forEach(a => {
                stats.total_achievements += a.count;
                if(a.status === 'pending') stats.pending_approvals = a.count;
            });
            res.json(stats);
        });
    });
});

router.get("/leaderboard", isAdmin, (req, res) => {
    const sql = `
        SELECT u.name, u.reg_id, COUNT(a.id) as achievement_count 
        FROM users u
        JOIN achievements a ON u.id = a.user_id
        WHERE u.role = 'student' AND a.status = 'approved'
        GROUP BY u.id
        ORDER BY achievement_count DESC
        LIMIT 3
    `;
    db.query(sql, (err, result) => {
        if(err) return res.status(500).send(err);
        res.json(result);
    });
});

router.get("/users", isAdmin, (req, res) => {
    db.query("SELECT id, name, reg_id, role, status FROM users WHERE role != 'admin' ORDER BY name", (err, result) => {
        if(err) return res.status(500).send(err);
        res.json(result);
    });
});

router.post("/toggle-status", isAdmin, (req, res) => {
    const { id, currentStatus } = req.body;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    db.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, id], (err) => {
        if(err) return res.status(500).send(err);
        res.send("Status updated");
    });
});

// GET ALL ACHIEVEMENTS (With Teacher Info Joined)
router.get("/all-achievements", isAdmin, (req, res) => {
    // IMPORTANT: Assuming your database has an 'evaluated_by' column in the achievements table.
    const sql = `
        SELECT a.*, 
               u.name as user_name, u.reg_id, u.role,
               t.name as teacher_name, t.id as teacher_id
        FROM achievements a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN users t ON a.evaluated_by = t.id
        ORDER BY a.created_at DESC
    `;
    db.query(sql, (err, result) => {
        // Agar database mein evaluated_by column na mila to error return karega.
        if(err) {
            console.error("Database Join Error: Please ensure 'evaluated_by' column exists.", err);
            return res.status(500).send(err);
        }
        res.json(result);
    });
});

module.exports = router;