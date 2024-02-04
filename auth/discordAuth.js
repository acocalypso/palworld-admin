const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  BOT_TOKEN,
  SESSION_SECRET,
  DISCORD_GUILD_ID,
  DISCORD_REQUIRED_ROLE,
  AUTH_STRATEGY,
} = process.env;

const router = express.Router();

// Passport Setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

if (AUTH_STRATEGY === 'discord') {
  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: DISCORD_REDIRECT_URI,
        scope: ['identify', 'guilds'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Verify that the user has the required role in the specified guild
          const guildId = DISCORD_GUILD_ID;
          const requiredRole = DISCORD_REQUIRED_ROLE;

          const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!guildsResponse.ok) {
            throw new Error('Error fetching user guilds');
          }

          const guilds = await guildsResponse.json();

          const targetGuild = guilds.find((guild) => guild.id === guildId);

          if (!targetGuild) {
            return done(null, false, { message: 'User is not a member of the specified guild' });
          }

          const memberResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${profile.id}`, {
            method: 'GET',
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
            },
          });

          if (!memberResponse.ok) {
            throw new Error('Error fetching guild member');
          }

          const member = await memberResponse.json();

          if (!member.roles.includes(requiredRole)) {
            return done(null, false, { message: 'User does not have the required role' });
          }

          return done(null, profile);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

router.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

if (AUTH_STRATEGY === 'discord') {
  router.use(passport.initialize());
  router.use(passport.session());
}

// Discord Auth Routes
if (AUTH_STRATEGY === 'discord') {
  router.get('/login/discord', passport.authenticate('discord'));
  router.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);
}

module.exports = router;
