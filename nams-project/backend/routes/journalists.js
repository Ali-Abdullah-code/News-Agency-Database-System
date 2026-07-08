const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET all journalists
router.get('/', async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT E.EmpID, E.EmpName, E.Email, J.SpecialtyArea,
                    (SELECT COUNT(*) FROM ARTICLE A WHERE A.JournalistID = J.EmpID) AS ArticleCount
             FROM EMPLOYEE E
             JOIN JOURNALIST J ON E.EmpID = J.EmpID`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conn.close();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST create journalist
router.post('/', async (req, res) => {
    try {
        const { EmpID, EmpName, Email, SpecialtyArea } = req.body;
        const conn = await getConnection();
        
        // Use a transaction to insert into both tables
        await conn.execute(
            `INSERT INTO EMPLOYEE (EmpID, EmpName, Email) VALUES (:1, :2, :3)`,
            [EmpID, EmpName, Email],
            { autoCommit: false }
        );
        
        await conn.execute(
            `INSERT INTO JOURNALIST (EmpID, SpecialtyArea) VALUES (:1, :2)`,
            [EmpID, SpecialtyArea],
            { autoCommit: true }
        );
        
        await conn.close();
        res.json({ message: 'Journalist created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// PUT update journalist specialty
router.put('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.execute(
            `UPDATE JOURNALIST SET SpecialtyArea = :1 WHERE EmpID = :2`,
            [req.body.SpecialtyArea, req.params.id],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Journalist updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE journalist
router.delete('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.execute(
            `DELETE FROM JOURNALIST WHERE EmpID = :1`,
            [req.params.id],
            { autoCommit: false }
        );
        await conn.execute(
            `DELETE FROM EMPLOYEE WHERE EmpID = :1`,
            [req.params.id],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Journalist deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
