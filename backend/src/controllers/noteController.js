const Note = require('../models/Note');

const createNote = async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const limitCheck = await Note.checkNoteLimit(req.tenant._id);
    if (!limitCheck.canCreate) {
      return res.status(403).json({
        success: false,
        message: `Note limit reached. You can only create ${limitCheck.limit} notes on the Free plan.`,
        data: { limit: limitCheck.limit, current: limitCheck.current, subscription: req.tenant.subscription },
      });
    }

    const note = new Note({
      title, content, tags,
      authorId: req.user._id,
      tenantId: req.tenant._id,
    });
    await note.save();
    await note.populate('authorId', 'firstName lastName email');
    res.status(201).json({ success: true, message: 'Note created successfully', data: { note } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isArchived } = req.query;
    const skip = (page - 1) * limit;
    const query = { tenantId: req.tenant._id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';

    const notes = await Note.find(query).populate('authorId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Note.countDocuments(query);

    res.json({ success: true, data: { notes, pagination: { current: +page, pages: Math.ceil(total / limit), total } } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, tenantId: req.tenant._id }).populate('authorId', 'firstName lastName email');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: { note } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant._id }, { ...req.body, updatedAt: Date.now() }, { new: true, runValidators: true }).populate('authorId', 'firstName lastName email');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note updated successfully', data: { note } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getNoteStats = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const [totalNotes, archivedNotes, limitCheck] = await Promise.all([
      Note.countDocuments({ tenantId, isArchived: false }),
      Note.countDocuments({ tenantId, isArchived: true }),
      Note.checkNoteLimit(tenantId),
    ]);
    res.json({
      success: true,
      data: {
        totalNotes,
        archivedNotes,
        limit: limitCheck.limit,
        canCreateMore: limitCheck.canCreate,
        subscription: req.tenant.subscription,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createNote, getNotes, getNote, updateNote, deleteNote, getNoteStats };
