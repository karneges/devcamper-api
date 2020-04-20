const { Router } = require('express');
const router = Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto
} = require('../controllers/bootcamps');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorized } = require('../middleware/auth');
const Bootcamp = require('../models/Bootcamp');

// Include other resource routers
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');

//Re-route into other resource routers

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);
router
  .route('/:id/photo')
  .put(protect, authorized('publisher', 'admin'), uploadBootcampPhoto);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorized('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorized('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorized('publisher', 'admin'), deleteBootcamp);

module.exports = router;
