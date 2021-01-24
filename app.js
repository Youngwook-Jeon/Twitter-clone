const express = require('express');
const app = express();
const port = 8000;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session');

const server = app.listen(port, () => console.log("Server listening on port " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "bbq chicken",
    resave: true,
    saveUninitialized: false
}))

// Routes
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const logoutRoutes = require('./routes/logout');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messagesRoutes = require('./routes/messagesRoutes');

// Api routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/posts", middleware.requireLogin, postRoutes);
app.use("/profile", middleware.requireLogin, profileRoutes);
app.use("/uploads", uploadRoutes);
app.use("/logout", logoutRoutes);
app.use("/search", middleware.requireLogin, searchRoutes);
app.use("/messages", middleware.requireLogin, messagesRoutes);

app.use("/api/posts", postsApiRoute);
app.use("/api/users", usersApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
    let payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    };

    res.status(200).render("home", payload);
});