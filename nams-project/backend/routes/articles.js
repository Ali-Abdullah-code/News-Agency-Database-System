const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET all articles
router.get('/', async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT A.ArtID, A.Title, E.EmpName AS Journalist,
                    A.SecName, A.Status, A.PubDate
             FROM ARTICLE A
             JOIN JOURNALIST J ON A.JournalistID = J.EmpID
             JOIN EMPLOYEE   E ON J.EmpID = E.EmpID`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conn.close();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET single article
router.get('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT * FROM ARTICLE WHERE ArtID = :id`,
            [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conn.close();
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST create article
router.post('/', async (req, res) => {
    try {
        const { ArtID, Title, Content, Status, JournalistID, EditorID, SecName } = req.body;
        const conn = await getConnection();
        await conn.execute(
            `INSERT INTO ARTICLE VALUES (:1,:2,:3,:4,SYSDATE,:5,:6,:7)`,
            [ArtID, Title, Content, Status, JournalistID, EditorID, SecName],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Article created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update article status
router.put('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.execute(
            `UPDATE ARTICLE SET Status = :1 WHERE ArtID = :2`,
            [req.body.Status, req.params.id],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Article updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE article
router.delete('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.execute(
            `DELETE FROM ARTICLE WHERE ArtID = :id`,
            [req.params.id], { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Article deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
