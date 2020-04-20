const { Router } = require('express');
const Users = require('../models/User');
const router = Router({ mergeParams: true });
const {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  createUser
} = require('../controllers/users');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorized } = require('../middleware/auth');

router.use(protect);
router.use(authorized('admin'));

router
  .route('/')
  .get(advancedResults(Users), getUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
