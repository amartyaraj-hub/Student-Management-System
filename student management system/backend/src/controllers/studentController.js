import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';

// Helper to generate unique student ID (STU-YYYY-XXXX)
const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Student.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `STU-${currentYear}-${sequence}`;
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      dob,
      phone,
      address,
      parentName,
      parentPhone,
      classId,
      rollNo
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Create the credentials user
    const user = await User.create({
      name,
      email,
      password: password || 'student123', // default password
      role: 'student'
    });

    // Auto-generate student ID
    const studentId = await generateStudentId();

    // Create student profile
    const student = await Student.create({
      user: user._id,
      studentId,
      name,
      gender,
      dob,
      phone,
      address,
      parentName,
      parentPhone,
      class: classId || null,
      rollNo
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    // Clean up created user if student profile creation fails
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

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
export const getStudents = async (req, res, next) => {
  try {
    const { search, classId } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (classId) {
      query.class = classId;
    }

    const students = await Student.find(query)
      .populate('user', 'email avatar isActive')
      .populate('class', 'name section');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student profile
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'email avatar isActive')
      .populate('class', 'name section classTeacher');

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Role-based check: Students can only view their own profile
    if (req.user.role === 'student' && req.user._id.toString() !== student.user.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this profile' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const {
      name,
      email,
      gender,
      dob,
      phone,
      address,
      parentName,
      parentPhone,
      classId,
      rollNo,
      photo
    } = req.body;

    // Update User details if name or email changed
    const user = await User.findById(student.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      await user.save();
    }

    // Update student fields
    student.name = name || student.name;
    student.gender = gender || student.gender;
    student.dob = dob || student.dob;
    student.phone = phone || student.phone;
    student.address = address || student.address;
    student.parentName = parentName || student.parentName;
    student.parentPhone = parentPhone || student.parentPhone;
    student.class = classId || student.class;
    student.rollNo = rollNo || student.rollNo;
    student.photo = photo || student.photo;

    await student.save();

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Delete credentials user
    await User.findByIdAndDelete(student.user);

    // Delete student
    await student.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
