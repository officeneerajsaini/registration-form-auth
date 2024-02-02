import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// import session from "express-session";
// import passport from "passport";
// import passportLocalMongoose from "passport-local-mongoose";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import findOrCreate from "mongoose-findorcreate";
import bcrypt from "bcrypt";


const app = express();
const port = 3000;
const saltRounds = 10;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(session({
//     secret: "our little secret",
//     resave: false,
//     saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect(process.env.MONGODB_URL);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    // googleId: String
});

// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

const User = new mongoose.model("user", userSchema);

// passport.use(User.createStrategy());

// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });
// passport.deserializeUser(async function (id, done) {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     }
//     catch (error) {
//         done(error, null);
//     }
// });

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/main",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
// },

//     function (accessToken, refrenshToken, profile, cb) {
//         console.log(profile);
//         User.findOrCreate({ googleId: profile.id }, function (err, user) {
//             return cb(err, user);
//         })
//     }
// ));

// app.get("/auth/google",
//     passport.authenticate("google", { scope: ["profile"] })
// );

// app.get("/auth/google/main",
//     passport.authenticate("google", { failureRedirect: "/login" }),
//     function (req, res) {
//         res.redirect("/main");
//     }
// );

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.get("/main", (req, res) => {
    // if (req.isAuthenticated()) {
        res.render("main.ejs");
    // }
    // else {
        // res.redirect("/login");
    // }
})


// app.post("/register", (req, res) => {
//     User.register({ username: req.body.username }, req.body.password, function (err, user) {
//         if (err) {
//             console.log(err);
//             res.redirect("/register");
//         }
//         else {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/login");
//             })
//         }
//     });
// });

// app.post("/login", async (req, res) => {
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     })

//     req.login(user, function (err) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/main");
//             });
//         }
//     });
// });

app.post("/register", async (req, res) => {
    const username = req.body.password;
    const foundUser = await User.findOne({ username: username });
    if (foundUser) {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            try {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });

                newUser.save();
                res.redirect("/login");
            }
            catch (error) {
                console.error("Failed to make a request");
                res.send(error.message);
            }
        });
    }
    else {
        res.send("this email already have account");
    }
});


app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const foundUser = await User.findOne({ username: username });
        console.log(foundUser);

        if (foundUser) {
            bcrypt.compare(password, foundUser.password, function (err, result) {
                if (result === true) {
                    res.redirect("/main");
                }
            })
        }
        else {
            res.send("User not found");
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is runing on port ${port}`);
});