import Subject from '../models/Subject.js';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
export const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, teacherId } = req.body;

    const subjectExists = await Subject.findOne({ code });
    if (subjectExists) {
      return res.status(400).json({ success: false, error: 'Subject with this code already exists' });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      teacher: teacherId || null
    });

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('teacher', 'name teacherId');

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('teacher', 'name teacherId');

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
export const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const { name, code, description, teacherId } = req.body;

    subject.name = name || subject.name;
    subject.code = code || subject.code;
    subject.description = description || subject.description;
    if (teacherId !== undefined) subject.teacher = teacherId || null;

    await subject.save();

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    await subject.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
