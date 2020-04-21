const { Router } = require('express');
const router = Router({ mergeParams: true });

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
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
  .post(protect, authorized('user', 'admin'), createReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorized('user', 'admin'), updateReview)
  .delete(protect, authorized('user', 'admin'), deleteReview);

module.exports = router;
