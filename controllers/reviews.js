const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('../middleware/async');

//@desc         Get all reviews
//@route        GET /api/v1/reviews
//@route        GET /api/v1/bootcamps/:bootcampsId/reviews
//@access       Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  }
  res.status(200).json(req.advancedResult);
});

//@desc         Get Single review
//@route        GET /api/v1/reviews/:id
//@access       Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  if (!review) {
    return next(new ErrorHandler(`Not find review by ID${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc         create review
//@route        POST /api/v1/bootcamp/:bootcampId/reviews
//@access       Private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcmap = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcmap) {
    return next(
      new ErrorHandler(`No bootcamps with the id ${req.params.bootcampId}`)
    );
  }
  const review = await Review.create(req.body);
  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc         update review
//@route        PUT /api/v1/reviews/:id
//@access       Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorHandler(`No review with the id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is course owner
  if (review.user.toString() !== id && role !== 'admin') {
    return next(
      new ErrorHandler(
        `User with ID ${id} not authorized to change review  ${review.id}`,
        401
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc         delete review
//@route        delete /api/v1/reviews/:id
//@access       Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorHandler(`No review with the id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is course owner
  if (review.user.toString() !== id && role !== 'admin') {
    return next(
      new ErrorHandler(
        `User with ID ${id} not authorized to change review  ${review.id}`,
        401
      )
    );
  }

  review.remove();
  res.status(200).json({
    success: true,
    data: {}
  });
});
