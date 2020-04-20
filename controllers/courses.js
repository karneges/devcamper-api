const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('../middleware/async');

//@desc         Get all courses
//@route        GET /api/v1/courses
//@route        GET /api/v1/bootcamps/:bootcampsId/courses
//@access       Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  }
  res.status(200).json(req.advancedResult);
});

//@desc         Get  courses by id
//@route        GET /api/v1/courses/:id
//@access       Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  if (!course) {
    return next(
      new ErrorHandler(`No course with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc         Get  courses by id
//@route        POST /api/v1/bootcamps/:bootcampsId/courses
//@access       Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  req.body.user = req.user;
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorHandler(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== id && role !== 'admin') {
    return next(
        new ErrorHandler(
            `User with ID ${id} not authorized to add course to bootcamp ${bootcamp.id}`,
            401
        )
    );
  }

  const course = await Course.create(req.body);
  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc         Update  courses by id
//@route        PUT /api/v1/courses/:id
//@access       Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorHandler(`No course with the id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is course owner
  if (course.user.toString() !== id && role !== 'admin') {
    return next(
        new ErrorHandler(
            `User with ID ${id} not authorized to change course  ${course.id}`,
            401
        )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc         Delete courses by id
//@route        DELETE /api/v1/courses/:id
//@access       Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorHandler(`No course with the id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is course owner
  if (course.user.toString() !== id && role !== 'admin') {
    return next(
        new ErrorHandler(
            `User with ID ${id} not authorized to delete course  ${course.id}`,
            401
        )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
