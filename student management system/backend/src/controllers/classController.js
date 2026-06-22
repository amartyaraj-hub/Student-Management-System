import Class from '../models/Class.js';

// @desc    Create a new class/section
// @route   POST /api/classes
// @access  Private/Admin
export const createClass = async (req, res, next) => {
  try {
    const { name, section, classTeacherId, subjects } = req.body;

    const classExists = await Class.findOne({ name, section });
    if (classExists) {
      return res.status(400).json({ success: false, error: 'Class section already exists' });
    }

    const newClass = await Class.create({
      name,
      section,
      classTeacher: classTeacherId || null,
      subjects: subjects || []
    });

    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'name teacherId')
      .populate('subjects', 'name code');

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = async (req, res, next) => {
  try {
    const singleClass = await Class.findById(req.params.id)
      .populate('classTeacher', 'name teacherId phone')
      .populate('subjects', 'name code teacher');

    if (!singleClass) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.status(200).json({
      success: true,
      data: singleClass
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class details
// @route   PUT /api/classes/:id
// @access  Private/Admin
export const updateClass = async (req, res, next) => {
  try {
    let singleClass = await Class.findById(req.params.id);

    if (!singleClass) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const { name, section, classTeacherId, subjects } = req.body;

    singleClass.name = name || singleClass.name;
    singleClass.section = section || singleClass.section;
    if (classTeacherId !== undefined) singleClass.classTeacher = classTeacherId || null;
    if (subjects !== undefined) singleClass.subjects = subjects;

    await singleClass.save();

    res.status(200).json({
      success: true,
      data: singleClass
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
export const deleteClass = async (req, res, next) => {
  try {
    const singleClass = await Class.findById(req.params.id);

    if (!singleClass) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    await singleClass.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
