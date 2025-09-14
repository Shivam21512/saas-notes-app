const express = require('express');
const { authenticate, requireMember } = require('../middleware/auth');
const { validateRequest, noteSchemas } = require('../middleware/validation');
const { createNote, getNotes, getNote, updateNote, deleteNote, getNoteStats } = require('../controllers/noteController');

const router = express.Router();

router.use(authenticate);
router.use(requireMember);

router.post('/', validateRequest(noteSchemas.create), createNote);
router.get('/', getNotes);
router.get('/stats', getNoteStats);
router.get('/:id', getNote);
router.put('/:id', validateRequest(noteSchemas.update), updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
