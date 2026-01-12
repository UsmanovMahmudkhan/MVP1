const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');

const multer = require('multer');
const upload = multer({ dest: 'temp/uploads/' });

router.post('/chat', upload.single('audio'), mentorController.getMentorResponse);

module.exports = router;
