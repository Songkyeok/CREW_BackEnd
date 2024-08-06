const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const app = express();

const authRouter = require('./routes/auth');
const moimRouter = require('./routes/moim');
const adminRouter = require('./routes/admin');

dotenv.config();
// app.use(morgan('dev'));

app.use(cors({ 
    origin: 'http://localhost:8001',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));

app.use('/auth', authRouter);
app.use('/moim', moimRouter);
app.use('/admin', adminRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.listen(4000, () => {
    console.log(`backend server : ${4000}번 포트`);
  });