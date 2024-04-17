const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Student = require('../models/Student');


// Set up Passport Local Strategy for username/password login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    async (username, password, done) => {

        try {
            const student = await Student.findByEmail(username);
            if (!student) {
                console.log(`${username} not found`)
                return done(null, false, { message: "Your Username or Password is Incorrect !" });
            }
            const passwordMatch = await student.verifyPassword(password);
            if (!passwordMatch) {
                console.log(`${password} incorrect`)
                return done(null, false, { message: "Your Username or Password is Incorrect !" });
            }

            console.log(student);
            return done(null, student);
        } catch (error) {
            return done(error);
        }

    }
));

// Serialize user object into session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user object from session
passport.deserializeUser(async (id, done) => {
    try {
        const student = await Student.findById(id);
        done(null, student);
    } catch (error) {
        done(error);
    }
});