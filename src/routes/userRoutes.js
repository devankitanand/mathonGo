const express = require('express');
const multer = require('multer');
const { getAllUsers,getAllList, createList, uploadUsers, deleteAllUsers, deleteAllList } = require('../controllers/userController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/users', getAllUsers);
router.get('/lists', getAllList);
router.post('/create-list', createList);
router.post('/upload-users', upload.single('file'), uploadUsers);
router.delete('/deleteusers', deleteAllUsers)
router.delete('/deletelist', deleteAllList)

module.exports = router;
