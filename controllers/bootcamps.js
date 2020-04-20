const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
//@desc         Get all bootcamps
//@route        GET /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(req.advancedResult);
});

//@desc         Get single bootcamps
//@route        GET /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  res.status(200).json(bootcamp);
});

//@desc         Create new bootcamp
//@route        POST /api/v1/bootcamps
//@access       Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  // Add user to req.body
  req.body.user = req.user;
  // Check for publisher bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: id });

  // If the User is non an admin, they can only add one bootcamp
  if (publishedBootcamp && role !== 'admin') {
    return next(
      new ErrorHandler(
        `User with ID${id} has already published  a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

//@desc         update bootcamp
//@route        PUT /api/v1/bootcamps/:id
//@access       Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorHandler(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== id && role !== 'admin') {
    return next(
      new ErrorHandler(
        `User with ID ${id} not authorized to update this bootcamp`,
        401
      )
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc         Delete bootcamp
//@route        DELETE /api/v1/bootcamps/:id
//@access       Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(
      new ErrorHandler(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== id && role !== 'admin') {
    return next(
      new ErrorHandler(
        `User with ID ${id} not authorized to delete this bootcamp`,
        401
      )
    );
  }
  bootcamp.remove();

  return res.status(200).json({ success: true, data: {} });
});

//@desc         Get bootcamps within a radius
//@route        DELETE /api/v1/bootcamps/radius/:zipcode/:distance
//@access       Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng from geocoder

  const [{ latitude: lat, longitude: lng }] = await geocoder.geocode(zipcode);

  //Calc radius using radius
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

//@desc         Upload photo from bootcamp
//@route        PUT /api/v1/bootcamps/:id/photo
//@access       Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const { id, role } = req.user;
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(
      new ErrorHandler(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== id && role !== 'admin') {
    return next(
      new ErrorHandler(
        `User with ID ${id} not authorized to change photo this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    next(new ErrorHandler(`Please upload file`, 400));
  }
  const file = req.files.file;

  //CreateCustomPhotoName
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;
  console.log(file.name);
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorHandler(`Problem with file`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    return res.status(200).json({ success: true, data: file.name });
  });
});
