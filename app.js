const express = require('express');
const app = express();
const port = 8000;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session');

const server = app.listen(port, () => console.log("Server listening on port " + port));
const io = require("socket.io")(server, { pingTimeout: 60000 });

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
const notificationsRoutes = require('./routes/notificationsRoutes');

// Api routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/posts", middleware.requireLogin, postRoutes);
app.use("/profile", middleware.requireLogin, profileRoutes);
app.use("/uploads", uploadRoutes);
app.use("/logout", logoutRoutes);
app.use("/search", middleware.requireLogin, searchRoutes);
app.use("/messages", middleware.requireLogin, messagesRoutes);
app.use("/notifications", middleware.requireLogin, notificationsRoutes);

app.use("/api/posts", postsApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);
app.use("/api/messages", messagesApiRoute);
app.use("/api/notifications", notificationsApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
    let payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    };

    res.status(200).render("home", payload);
});

io.on("connection", (socket) => {

    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected")
    });

    socket.on("join room", room => socket.join(room));
    socket.on("typing", room => socket.in(room).emit("typing"));
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    socket.on("notification received", room => socket.in(room).emit("notification received"));
    socket.on("new message", newMessage => {
        const chat = newMessage.chat;

        if (!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            if (user._id === newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        });
    });
});