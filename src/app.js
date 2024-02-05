const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const dotenv = require('dotenv');
const localAuth = require('../auth/localAuth');
const flash = require('connect-flash');
const { executeRconCommand } = require('../rcon/rcon');
const { getServerStats } = require('./serverStats');
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

const sessionMiddleware = session({
  store: new FileStore(),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});

const app = express();

app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.get('/login', async (req, res) => {
  if (FIRST_LAUNCH === 'true') {
    return res.redirect('/create-admin');
  }

  const messages = req.flash();
  res.render('login', { authStrategy: AUTH_STRATEGY, messages });
});

app.get('/create-admin', async (req, res) => {
  if (FIRST_LAUNCH !== 'true') {
    return res.redirect('/login');
  }

  res.render('create-admin');
});

app.post('/create-admin', async (req, res) => {
  if (FIRST_LAUNCH === 'true') {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await db.createTable();
      await db.executeQuery('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    } catch (error) {
      console.error('Error creating admin account:', error);
      return res.status(500).send('Internal Server Error');
    }

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
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Internal Server Error');
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Internal Server Error');
      }

      res.redirect('/login');
    });
  });
});

app.use('/server-stats', async (req, res, next) => {
  try {
    const rconResponseInfo = await executeRconCommand('info');
    res.locals.rconResponseInfo = rconResponseInfo;
    next();
  } catch (error) {
    console.log("Error fetching server info:", error);
    res.locals.rconResponseInfo = '';
    next();
  }
});

app.get('/server-stats', isAuthenticated, async (req, res) => {
  try {
    res.render('server-stats', { user: req.user });
  } catch (error) {
    console.log("Error getting server stats:", error);
    res.status(500).send(error);
  }
});

app.get('/server-stats/data', isAuthenticated, async (req, res) => {
  try {
    const serverStats = await getServerStats();
    res.json(serverStats);
  } catch (error) {
    console.log("Error getting server stats:", error);
    res.status(500).json({ error: 'Error getting server stats' });
  }
});

app.post('/admin-command/kick', isAuthenticated, async (req, res) => {
  try {
    const { steamId } = req.body; 
    console.log(req);
    if (steamId) {
      const kickCommand = `KickPlayer ${steamId}`;
      await executeRconCommand(kickCommand);
      res.json({ success: true, message: `Kicked player with Steam ID: ${steamId}` });
    } else {
      res.status(400).json({ success: false, message: 'Missing Steam ID' });
    }
  } catch (error) {
    console.error('Error kicking player:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/admin-command/ban', isAuthenticated, async (req, res) => {
  try {
    const { steamId } = req.body;
    if (steamId) {
      const banCommand = `BanPlayer ${steamId}`;
      await executeRconCommand(banCommand);
      res.json({ success: true, message: `Banned player with Steam ID: ${steamId}` });
    } else {
      res.status(400).json({ success: false, message: 'Missing Steam ID' });
    }
  } catch (error) {
    console.error('Error banning player:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/', isAuthenticated, async (req, res) => {
  try {
    const rconResponseShowPlayers = await executeRconCommand('showplayers');
    const playersInfoWithoutHeader = rconResponseShowPlayers.split('\n').slice(1).join('\n');
    const onlinePlayerCount = playersInfoWithoutHeader.split('\n').length - 1;
    const rconResponseInfo = await executeRconCommand('info');

    res.render('index', { onlinePlayerCount, playersInfoWithoutHeader, rconResponseInfo: rconResponseInfo || '', user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
