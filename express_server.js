const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");

// email lookup helper
let emailLookup = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    } 
  }
  return false;
};

// 6 alphanumeric random string generator
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
};

//a database to keep track of all the URLs and their shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//a global object for users.  Maybe an array of objects??
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}\n`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  }; // longURL same as short?
  console.log('test', templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("register", templateVars);
});

// ********************* POSTS *************************

app.post("/register", (req, res) => {
  //console.log(emailLookup("user2@example.com"));
  console.log(req.body.email);
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please add email and password');
  } 
  else if (emailLookup(req.body.email)) {
    res.status(400).send('Your email already exists. Please login.');
  } else {
    console.log('register post');
    console.log(req.body);
    const userId = generateRandomString();
    const user = {id: userId, email: req.body.email, password: req.body.password};
    users[userId] = user;
    console.log(users);
    res.cookie('userId', userId);
    res.redirect('/urls');
  }});

app.post("/login", (req, res) => {
  console.log('cookie login');
  console.log(req.body);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  console.log('logging out');
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  console.log('updating URL', req.body);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls'); //was '/urls'
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('deleting post');
  //console.log('req.params: ', req.params);
  delete urlDatabase[req.params.shortURL];
  console.log('urlDatabase: ', urlDatabase);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log('req body: ', req.body);  // Log the POST request body to the console
  const shorty = generateRandomString();
  urlDatabase[shorty] = req.body.longURL;
  console.log('urlDatabase: ', urlDatabase);
  res.redirect(`/urls/${shorty}`);
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});