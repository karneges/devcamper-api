const { Router } = require('express');
const router = Router({ mergeParams: true });

const {
  getReviews,
  getReview,
  createReview
} = require('../controllers/reviews');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorized } = require('../middleware/auth');
const Review = require('../models/Review');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  )
  .post(protect, authorized('user','admin'), createReview);
router.route('/:id').get(getReview);

module.exports = router;
