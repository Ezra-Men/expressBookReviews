const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// ✅ Check if username is valid (not already registered)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// ✅ Check if username and password match
const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

// ✅ Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if fields are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate
  const user = authenticatedUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  // Generate JWT and store in session
  const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: '1h' });
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "User successfully logged in" });
});

// ✅ Task 8: Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
