const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, createUser, deleteUserById, updateUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/', requireAuth, getUsers);
router.get('/:id', requireAuth, getUserById);
router.post('/', requireAuth, createUser);
router.delete('/:id', requireAuth, deleteUserById);
router.put('/:id', requireAuth, updateUserById);

module.exports = router;
