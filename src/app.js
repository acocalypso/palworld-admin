const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const localAuth = require('../auth/localAuth');
const flash = require('connect-flash');
const { executeRconCommand } = require('../rcon/rcon');
const { getServerStats } = require('./serverStats');
const ejs = require('ejs');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('./db');

dotenv.config();

const {
  SESSION_SECRET,
  PORT,
  AUTH_STRATEGY,
  FIRST_LAUNCH,
} = process.env;

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Express Middleware
app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(express.urlencoded({ extended: true }));
  
  app.use(flash());
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  
  app.get('/login', async (req, res) => {
    // If it's the first launch, redirect to account creation page
    if (FIRST_LAUNCH === 'true') {
      return res.redirect('/create-admin');
    }
  
    // Pass flash messages to the template
    const messages = req.flash();
    res.render('login', { authStrategy: AUTH_STRATEGY, messages });
  });
  
  app.get('/create-admin', async (req, res) => {
    // Only allow account creation if it's the first launch
    if (FIRST_LAUNCH !== 'true') {
      return res.redirect('/login');
    }
  
    res.render('create-admin');
  });
  
  app.post('/create-admin', async (req, res) => {
    // Create admin account only on the first launch
    if (FIRST_LAUNCH === 'true') {
      const { username, password } = req.body;
  
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      try {
        // Create the 'users' table if it doesn't exist
        await db.createTable();
  
        // Save the user data to MySQL database using the db module
        await db.executeQuery('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
      } catch (error) {
        console.error('Error creating admin account:', error);
        return res.status(500).send('Internal Server Error');
      }
  
      // Update FIRST_LAUNCH to indicate that user creation is complete
      process.env.FIRST_LAUNCH = 'false';
  
      return res.send('Admin account created. Restart the app without FIRST_LAUNCH to use local authentication.');
    }
  
    return res.send('Admin account already created. Use local authentication.');
  });

  app.post('/auth/login/local', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));
  

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.use('/server-stats', async (req, res, next) => {
  try {
    const rconResponseInfo = await executeRconCommand('info');
    res.locals.rconResponseInfo = rconResponseInfo;
    next();
  } catch (error) {
    console.log("Error fetching server info:", error);
    res.locals.rconResponseInfo = ''; // Set a default value or handle the error as needed
    next();
  }
});

app.get('/server-stats', isAuthenticated, async (req, res) => {
  try {
    // Retrieve server stats (you need to implement this part)
    //const serverStats = await getServerStats();
  
    // Render the server stats template
    // res.render('server-stats', { serverStats, user: req.user });
    res.render('server-stats', { user: req.user });
  } catch (error) {
    console.log("Error getting server stats:", error);
    res.status(500).send(error);
  }
});

app.get('/server-stats/data', isAuthenticated, async (req, res) => {
  try {
    // Retrieve server stats
    const serverStats = await getServerStats();

    // Send the server stats as JSON
    res.json(serverStats);
  } catch (error) {
    console.log("Error getting server stats:", error);
    res.status(500).json({ error: 'Error getting server stats' });
  }
});

app.get('/', isAuthenticated, async (req, res) => {
    // Authenticated users can access this route
    try {
      const rconResponseShowPlayers = await executeRconCommand('showplayers');
      const rconResponseInfo = await executeRconCommand('info');
      
      // Ensure that the 'user' object is available in the request
      res.render('index', { rconResponseShowPlayers,rconResponseInfo: rconResponseInfo || '', user: req.user });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });

// Start the server
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));