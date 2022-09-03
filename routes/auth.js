const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth')
const User = require('../models/user')

router.post('/signup', [body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
            if (userDoc)
                return Promise.reject("Email already exists")
        })
    })
    .normalizeEmail(), body('password').isLength({ min: 5 }).withMessage(`password length must be at least 6 `),body('name').trim().isLength({min:5})], authController.signup)

router.post('/login', [body('email')
.isEmail()
.withMessage('please enter a valid email.'), body('password').isLength({ min: 5 }).withMessage(`password length must be at least 6 `)], authController.login)

module.exports = router;