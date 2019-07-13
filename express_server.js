const express = require("express");
const {getUserByEmail} = require("./helpers");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['Jonathan'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// urls helper function which returns the URLs where the userID is equal
// to the id of the currently loggin in user.

const urlsForUser = function(id) {
  let urls = {};
  for (let shorty in urlDatabase) {
    if (id === urlDatabase[shorty].userID) {
      urls[shorty] = urlDatabase[shorty];
    }
  }
  return urls;
};

// 6 alphanumeric random string generator
let generateRandomString = function () {
  return Math.random().toString(36).substring(2,8);
};

// a database to keep track of all the URLs and their shortened forms
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// a global object for users.
const users = { 
};


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
  if (!users[req.session.user_id]) {
    return res.redirect('/login');
  };
  //console.log(users[req.session.user_id].id)
  let signedInUser = users[req.session.user_id].id
  let templateVars = {
    urls: urlsForUser(signedInUser), //helper function
    user: users[req.session.user_id]
  };
 
  res.render("urls_index",templateVars);

  console.log('*********************');
});

app.get("/urls/new", (req, res) => {
  console.log('APP.GET("/urls/new)');
  //console.log(`value of req.params`, req.params);
  //console.log(`value of users[req.session.user_id]`, users[req.session.user_id]); 
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (!users[req.session.user_id]) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new",templateVars);
  }
  console.log('*********************');
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(`APP.GET("/urls/:shortURL)`)
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
  console.log('*********************');
});

app.get("/u/:shortURL", (req, res) => {
  console.log(`APP.GET("/u/:shortURL")`);
  //console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  console.log('*********************');
});

app.get("/register", (req, res) => {
  console.log(`APP.GET("/register")`)
  let templateVars = {
    user: null
  };
  res.render("register", templateVars);
  console.log('*********************');
});

app.get("/login", (req, res) => {
  console.log(`APP.GET("/login")`);
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
  console.log('*********************');
});

// ********************* POSTS *************************

app.post("/register", (req, res) => {
  console.log(`APP.POST("/register")`)
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please add email and password');
  } 
  else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Your email already exists. Please login.');
  } else {
    //console.log('req.body', req.body);
    let password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    //console.log(hashedPassword);
    //console.log(bcrypt.compareSync(password, hashedPassword));
    const userId = generateRandomString();
    const user = {id: userId, email: req.body.email, password: hashedPassword};
    users[userId] = user;
    req.session.user_id = userId;
    res.redirect('/urls');
    console.log('*********************');
  }});

app.post("/login", (req, res) => {
  console.log(`APP.POST("/login")`);
  let password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);
  //console.log(hashedPassword);
  //console.log(bcrypt.compareSync(password, hashedPassword));
  //console.log('email lookup function', getUserByEmail(req.body.email, users));
  let userInfo = getUserByEmail(req.body.email, users);
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send('email not found.  Please try again or create an account.');
  } else if (!bcrypt.compareSync(password, userInfo.password)) {
    res.status(403).send('wrong password! Please try again.');
  } else {
    req.session.user_id = userInfo.id;
    res.redirect('/urls');
  }
  console.log('*********************');
});

app.post("/logout", (req, res) => {
  console.log(`APP.POST("/logout")`)
  req.session = null;
  res.redirect('/urls');
  console.log('*********************');
});

app.post("/urls/:id", (req, res) => {
  console.log(`APP.POST("/urls/:id)`)
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls'); //was '/urls'
  console.log('*********************');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`APP.POST("/urls/:shortURL/delete")`)
  const user = users[req.session.user_id];
  if (user) {
    if (urlDatabase[req.params.shortURL].userID === users[req.session.user_id].id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
    else {
      res.status(400).send("You are not authorized to delete!")
    }
  } else {
    res.status(400).send('User not found');
  }
  console.log('*********************');
});

app.post("/urls", (req, res) => {
  console.log(`APP.POST("/urls")`)
  console.log(`users[req.session.user_id]`, users[req.session.user_id]);
  const shorty = generateRandomString();
  urlDatabase[shorty] = {longURL: req.body.longURL, userID: users[req.session.user_id].id};
  res.redirect(`/urls/${shorty}`);
  console.log('*********************')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});