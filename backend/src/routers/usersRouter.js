const express = require('express');
const { getUsers, getUserById, createUser, deleteUserById, updateUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.delete('/:id', deleteUserById);
router.put('/:id', updateUserById);

module.exports = router;
