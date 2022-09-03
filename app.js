const express = require('express');
const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const { json } = require('body-parser');
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const port = process.env.PORT || 8080

const app = express();


app.use(json())
app.use('/images', express.static(path.join(__dirname, 'images')))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.filename + '-' + file.originalname)
    }
})

function fileFilter(req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    if (path.extname(file.originalname) === '.png' || path.extname(file.originalname) === '.jpg' || path.extname(file.originalname) === '.jpeg') {
        return cb(null, true)
    } else {
        cb(null, false);
    }


    // To accept the file pass `true`, like so:


    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))

}

app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH')
    res.setHeader('Access-Control-Allow-Header', 'Content-Type,Authorization');
    next();
})
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);




app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data })
})

mongoose.connect('mongodb+srv://farhan:e7dAU6DHAmyyktuv@cluster0.bnacrmq.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => {
        console.log('connect')
        app.listen(port)
    }).catch((error) => {
        console.log(error)
    })



