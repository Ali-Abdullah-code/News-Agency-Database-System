const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET all editors
router.get('/', async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT E.EmpID, E.EmpName, E.Email, ED.SeniorityLevel
             FROM EMPLOYEE E
             JOIN EDITOR ED ON E.EmpID = ED.EmpID`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conn.close();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST create editor
router.post('/', async (req, res) => {
    try {
        const { EmpID, EmpName, Email, EditorLevel } = req.body;
        const conn = await getConnection();
        
        // Use a transaction to insert into both tables
        await conn.execute(
            `INSERT INTO EMPLOYEE (EmpID, EmpName, Email) VALUES (:1, :2, :3)`,
            [EmpID, EmpName, Email],
            { autoCommit: false }
        );
        
        await conn.execute(
            `INSERT INTO EDITOR (EmpID, SeniorityLevel) VALUES (:1, :2)`,
            [EmpID, EditorLevel],
            { autoCommit: true }
        );
        
        await conn.close();
        res.json({ message: 'Editor created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// PUT update editor seniority
router.put('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.execute(
            `UPDATE EDITOR SET SeniorityLevel = :1 WHERE EmpID = :2`,
            [req.body.SeniorityLevel, req.params.id],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Editor updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE editor
router.delete('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        
        // Delete from EDITOR first (FK constraint), then EMPLOYEE
        await conn.execute(
            `DELETE FROM EDITOR WHERE EmpID = :1`,
            [req.params.id],
            { autoCommit: false }
        );
        
        await conn.execute(
            `DELETE FROM EMPLOYEE WHERE EmpID = :1`,
            [req.params.id],
            { autoCommit: true }
        );
        
        await conn.close();
        res.json({ message: 'Editor deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
