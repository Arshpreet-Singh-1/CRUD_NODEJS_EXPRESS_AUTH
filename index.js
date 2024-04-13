// Import necessary modules
const express = require('express'); // Import Express.js framework
const jwt = require('jsonwebtoken'); // Import JSON Web Token library
const session = require('express-session'); // Import express-session library for session management
const routes = require('./router/friends.js'); // Import router for friend-related routes

// Initialize an empty array to store user data
let users = [];

// Function to check if a user with a given username already exists
const doesExist = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  // If usersWithSameName array has any elements, it means user already exists
  if (usersWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Function to authenticate a user based on username and password
const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // If validUsers array has any elements, it means the username and password match
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Create an instance of Express application
const app = express();

// Middleware for session management using express-session
app.use(session({ 
    secret: "fingerpint",
    resave: true, 
    saveUninitialized: true 
}));

// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

// Middleware to authenticate requests to the "/friends" route
app.use("/friends", function auth(req, res, next) {
  // Check if the user is authorized (i.e., if there is a valid session)
  if (req.session.authorization) {
    // If authorization exists, extract the accessToken from the session
    let token = req.session.authorization['accessToken'];
    // Verify the token using the secret key
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        // If verification succeeds, attach the user data to the request object
        req.user = user;
        // Call the next middleware or route handler
        next();
      } else {
        // If verification fails, return a 403 Forbidden status
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    // If no authorization exists, return a 403 Forbidden status
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Route to handle user login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided in the request body
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Check if the provided username and password are authenticated
  if (authenticatedUser(username, password)) {
    // If authenticated, generate a JWT token with a secret key and expiration time
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store the accessToken and username in the session
    req.session.authorization = {
      accessToken,
      username
    }
    // Send a success message
    return res.status(200).send("User successfully logged in");
  } else {
    // If authentication fails, return a 208 status with an error message
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Route to handle user registration
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided in the request body
  if (username && password) {
    // If both username and password are provided
    if (!doesExist(username)) {
      // If the user does not already exist, add the user to the users array
      users.push({ "username": username, "password": password });
      // Send a success message
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      // If the user already exists, return a 404 status with an error message
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // If username or password is missing, return a 404 status with an error message
  return res.status(404).json({ message: "Unable to register user." });
});

// Define the port number
const PORT = 5000;

// Mount the router for friend-related routes
app.use("/friends", routes);

// Start the server
app.listen(PORT, () => console.log("Server is running"));
