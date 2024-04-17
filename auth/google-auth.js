const passport =require("passport")
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const Student = require('../models/Student');


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
        done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback   : true
    },
    async function(request, accessToken, refreshToken, profile, done) {
            
        try {

            let user = await Student.findByEmail(profile.email);
            if (user) {
                return done(null, user);
            }
    
            const newUser = new Student({
                username: profile.displayName,
                email: profile.email,
                password: ''
            });
            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error);
        }

    }
));