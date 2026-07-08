const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET all subscribers
router.get('/', async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT S.SubID, S.Username, S.Email, S.MembershipType,
                    (SELECT COUNT(*) FROM COMMENT_T C WHERE C.SubID = S.SubID) AS CommentCount
             FROM SUBSCRIBER S`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conn.close();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST create subscriber
router.post('/', async (req, res) => {
    try {
        const { SubID, Username, Email, MembershipType } = req.body;
        const conn = await getConnection();
        await conn.execute(
            `INSERT INTO SUBSCRIBER (SubID, Username, Email, MembershipType) 
             VALUES (:1, :2, :3, :4)`,
            [SubID, Username, Email, MembershipType || 'Free'],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Subscriber created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE subscriber
router.delete('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        // Delete comments by subscriber first to avoid foreign key constraints
        await conn.execute(
            `DELETE FROM COMMENT_T WHERE SubID = :id`,
            [req.params.id],
            { autoCommit: false }
        );
        
        await conn.execute(
            `DELETE FROM SUBSCRIBER WHERE SubID = :id`,
            [req.params.id],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Subscriber deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// PUT update subscriber membership
router.put('/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.execute(
            `UPDATE SUBSCRIBER SET MembershipType = :1 WHERE SubID = :2`,
            [req.body.MembershipType, req.params.id],
            { autoCommit: true }
        );
        await conn.close();
        res.json({ message: 'Subscriber updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
