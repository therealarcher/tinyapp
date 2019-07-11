const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");

// email lookup helper
const emailLookup = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//a global object for users.  Maybe an array of objects??
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "123"
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
  console.log(`APP.GET("/urls")`)
  let templateVars = {
    urls: urlDatabase, 
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
  console.log('*********************')
});

app.get("/urls/new", (req, res) => {
  console.log('APP.GET("/urls/new)')
  console.log(`value of req.params`, req.params);
  console.log(`value of users[req.cookies.user_id]`, users[req.cookies.user_id]) 
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  if (!users[req.cookies.user_id]) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new",templateVars);
  }
  console.log('*********************')
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(`APP.GET("/urls/:shortURL)`)
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  console.log('test', templateVars);
  res.render("urls_show", templateVars);
  console.log('*********************')
});

app.get("/u/:shortURL", (req, res) => {
  console.log(`APP.GET("/u/:shortURL")`)
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  console.log('*********************')
});

app.get("/register", (req, res) => {
  console.log(`APP.GET("/register")`)
  let templateVars = {
    user: null
  };
  res.render("register", templateVars);
  console.log('*********************')
});

app.get("/login", (req, res) => {
  console.log(`APP.GET("/login")`)
  let templateVars = {
    //user: null
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
  console.log('*********************')
});

// ********************* POSTS *************************

app.post("/register", (req, res) => {
  console.log(`APP.POST("/register")`)
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
    res.cookie('user_id', userId);
    res.redirect('/urls');
    console.log('*********************')
  }});

app.post("/login", (req, res) => {
  console.log(`APP.POST("/login")`)
  console.log(req.body);
  console.log(emailLookup(req.body.email))
  let userInfo = emailLookup(req.body.email)
  console.log('user info: ', userInfo);
  if (!emailLookup(req.body.email)) {
    res.status(403).send('email not found.  Please try again or create an account.')
  } else if 
    (userInfo.password !== req.body.password) {
    res.status(403).send('wrong password! Please try again.')
  } else {
    res.cookie('user_id', userInfo.id);
    res.redirect('/urls');
  }
  console.log('*********************')
});

app.post("/logout", (req, res) => {
  console.log(`APP.POST("/logout")`)
  console.log('logging out');
  res.clearCookie('user_id');
  res.redirect('/urls');
  console.log('*********************')
});

app.post("/urls/:id", (req, res) => {
  console.log(`APP.POST("/urls/:id)`)
  console.log('updating URL', req.body);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls'); //was '/urls'
  console.log('*********************')
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`APP.POST("/urls/:shortURL/delete")`)
  console.log('deleting post');
  //console.log('req.params: ', req.params);
  delete urlDatabase[req.params.shortURL];
  console.log('urlDatabase: ', urlDatabase);
  res.redirect("/urls");
  console.log('*********************')
});

app.post("/urls", (req, res) => {
  console.log(`APP.POST("/urls")`)
  console.log('req body: ', req.body);
  console.log(`users[req.cookies.user_id]`, users[req.cookies.user_id]);
  const shorty = generateRandomString();
  //urlDatabase[shorty] = req.body.longURL;
  urlDatabase[shorty] = {longURL: req.body.longURL, userID: users[req.cookies.user_id].id};
  console.log('urlDatabase: ', urlDatabase);
  res.redirect(`/urls/${shorty}`);
  console.log('*********************')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});