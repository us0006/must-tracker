const router = require("express").Router();
const db = require("../db");
const multer = require("multer");

// Configure Storage for Supporting Documents
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// 1. Submit New Achievement
router.post("/submit", upload.single("file"), (req, res) => {
    if (!req.session.user) return res.status(401).send("Unauthorized");

    const { title } = req.body;
    const fileName = req.file ? req.file.filename : null;
    const userId = req.session.user.id;

    if (!fileName) return res.status(400).send("Supporting document required.");

    // Default status is 'pending' upon submission
    const sql = "INSERT INTO achievements (user_id, title, file, status) VALUES (?, ?, ?, 'pending')";
    // Agar DB mein 'skills' column hai, aur aap HTML mein use nahi kar rahe, to yahan default NULL ya empty string bhej dein.
    db.query(sql, [userId, title, fileName], (err) => {
        if (err) return res.status(500).send("Database error");
        res.send("Submitted");
    });
});

// 2. View Personal Achievements
router.get("/my", (req, res) => {
    if (!req.session.user) return res.status(401).send("Unauthorized");
    const userId = req.session.user.id;

    const sql = "SELECT * FROM achievements WHERE user_id = ? ORDER BY id DESC";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// 3. Update Existing Achievement (Smart Update)
router.put("/update/:id", upload.single("file"), (req, res) => {
    if (!req.session.user) return res.status(401).send("Unauthorized");

    const achId = req.params.id;
    const userId = req.session.user.id;
    const { title } = req.body;
    
    // Agar Edit karte waqt nayi file upload ki gayi hai
    if (req.file) {
        const sql = "UPDATE achievements SET title = ?, file = ? WHERE id = ? AND user_id = ? AND status = 'pending'";
        db.query(sql, [title, req.file.filename, achId, userId], (err, result) => {
            if (err) return res.status(500).send("Database error");
            res.send("Updated with new file");
        });
    } 
    // Agar sirf text edit kiya hai, purani file rehne do
    else {
        const sql = "UPDATE achievements SET title = ? WHERE id = ? AND user_id = ? AND status = 'pending'";
        db.query(sql, [title, achId, userId], (err, result) => {
            if (err) return res.status(500).send("Database error");
            res.send("Updated without changing file");
        });
    }
});

// 4. Delete Achievement (Restricted to Pending items)
router.delete("/delete/:id", (req, res) => {
    if (!req.session.user) return res.status(401).send("Unauthorized");
    const achId = req.params.id;
    const userId = req.session.user.id;

    const sql = "DELETE FROM achievements WHERE id = ? AND user_id = ? AND status = 'pending'";
    db.query(sql, [achId, userId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(403).send("Cannot delete approved records.");
        res.send("Deleted");
    });
});

module.exports = router;