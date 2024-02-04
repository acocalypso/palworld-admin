const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const session = require('express-session');
const dotenv = require('dotenv');
const db = require('../src/db');
dotenv.config();

const { LOCAL_ADMIN_USERNAME, LOCAL_ADMIN_PASSWORD_HASH, SESSION_SECRET } = process.env;

const app = express();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Retrieve user from MySQL database based on the provided username
      const user = await db.executeQuery('SELECT * FROM users WHERE username = ?', [username]);

      if (!user || user.length === 0) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const hashedPassword = user[0].password;

      if (bcrypt.compareSync(password, hashedPassword)) {
        return done(null, { username: user[0].username, role: 'admin' });
      } else {
        return done(null, false, { message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      return done(error);
    }
  }
));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/auth/login/local', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = app;
