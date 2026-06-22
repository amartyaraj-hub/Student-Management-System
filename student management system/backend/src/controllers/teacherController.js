import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

// Helper to generate unique teacher ID (TCH-YYYY-XXXX)
const generateTeacherId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Teacher.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `TCH-${currentYear}-${sequence}`;
};

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private/Admin
export const createTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      dob,
      phone,
      address,
      qualification
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Create credentials user
    const user = await User.create({
      name,
      email,
      password: password || 'teacher123', // default password
      role: 'teacher'
    });

    // Auto-generate teacher ID
    const teacherId = await generateTeacherId();

    // Create teacher profile
    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      name,
      gender,
      dob,
      phone,
      address,
      qualification
    });

    res.status(201).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    // Clean up created user if teacher profile creation fails
    if (error.name !== 'ValidationError') {
      try {
        await User.findOneAndDelete({ email: req.body.email });
      } catch (err) {
        console.error('Rollback user creation failed', err);
      }
    }
    next(error);
  }
};

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin, Teacher, Student)
export const getTeachers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await Teacher.find(query).populate('user', 'email avatar isActive');

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'email avatar isActive');

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    // Role-based check: Teachers can only view their own profile (unless admin/other)
    if (req.user.role === 'teacher' && req.user._id.toString() !== teacher.user.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this profile' });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
export const updateTeacher = async (req, res, next) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    const {
      name,
      email,
      gender,
      dob,
      phone,
      address,
      qualification,
      photo
    } = req.body;

    // Update credentials user
    const user = await User.findById(teacher.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      await user.save();
    }

    // Update teacher details
    teacher.name = name || teacher.name;
    teacher.gender = gender || teacher.gender;
    teacher.dob = dob || teacher.dob;
    teacher.phone = phone || teacher.phone;
    teacher.address = address || teacher.address;
    teacher.qualification = qualification || teacher.qualification;
    teacher.photo = photo || teacher.photo;

    await teacher.save();

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    // Delete credentials user
    await User.findByIdAndDelete(teacher.user);

    // Delete teacher profile
    await teacher.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
