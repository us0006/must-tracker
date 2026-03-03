const router = require("express").Router();
const db = require("../db");

/* ==========================================
   1. GET STATS (Monitor Trends)
   ========================================== */
router.get("/stats", (req, res) => {
    if (!req.session.user || req.session.user.role !== 'teacher') return res.status(401).send("Unauthorized");
    
    // Teacher ki stats mein bhi ab sirf uski apni evaluated ki hui cheezein aur pending show hongi
    const sql = `
        SELECT a.status, COUNT(*) as count 
        FROM achievements a
        JOIN users u ON a.user_id = u.id
        WHERE u.role = 'student' 
        AND (a.evaluated_by = ? OR a.status = 'pending')
        GROUP BY a.status
    `;
    db.query(sql, [req.session.user.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

/* ==========================================
   2. GET PENDING SUBMISSIONS (Only Students)
   ========================================== */
router.get("/pending", (req, res) => {
    if (!req.session.user || req.session.user.role !== 'teacher') {
        return res.status(401).send("Unauthorized");
    }

    // Pending sabko show hongi taake koi bhi free teacher evaluate kar sake
    const sql = `
        SELECT a.*, u.name, u.reg_id 
        FROM achievements a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status = 'pending' AND u.role = 'student'
    `;
    
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

/* ==========================================
   3. APPROVE ACHIEVEMENT (Save Teacher ID)
   ========================================== */
router.post("/approve", (req, res) => {
    const { id, remarks } = req.body;
    const teacherId = req.session.user.id; 

    db.query(
        "UPDATE achievements SET status = 'approved', remarks = ?, evaluated_by = ? WHERE id = ?",
        [remarks || 'Approved by teacher', teacherId, id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Approved");
        }
    );
});

/* ==========================================
   4. REJECT WITH REMARKS (Save Teacher ID)
   ========================================== */
router.post("/reject", (req, res) => {
    const { id, remarks } = req.body;
    const teacherId = req.session.user.id; 

    db.query(
        "UPDATE achievements SET status = 'rejected', remarks = ?, evaluated_by = ? WHERE id = ?",
        [remarks, teacherId, id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Rejected");
        }
    );
});

/* ==========================================
   5. VERIFICATION HISTORY (Only Logged-in Teacher's)
   ========================================== */
router.get("/history", (req, res) => {
    if (!req.session.user || req.session.user.role !== 'teacher') return res.status(401).send("Unauthorized");

    const teacherId = req.session.user.id; // Yahan humne logged-in teacher ki ID nikal li

    // Yahan query mein 'AND a.evaluated_by = ?' add kiya gaya hai
    const sql = `
        SELECT a.*, u.name as student_name, u.reg_id 
        FROM achievements a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status != 'pending' AND u.role = 'student' AND a.evaluated_by = ?
        ORDER BY a.created_at DESC
    `;
    
    db.query(sql, [teacherId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

module.exports = router;