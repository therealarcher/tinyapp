const express = require("express");
const {getUserByEmail} = require("./helpers")
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

//app.use(cookieParser());
app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'session',
  keys: ['Jonathan'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// email lookup helper
// const getUserByEmail = function(email, database) {
//   for (let user in database) {
//     if (database[user].email === email) {
//       return database[user];
//     }
//   }
//   return false;
// };

// urls helper function which returns the URLs where the userID is equal
// to the id of the currently loggin in user.

const urlsForUser = function(id) {
  let urls = {}
  for (let shorty in urlDatabase) {
    if (id === urlDatabase[shorty].userID) {
      urls[shorty] = urlDatabase[shorty];
    } 
  }
  return urls;
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
  console.log('APP.GET("/urls/new)')
  console.log(`value of req.params`, req.params);
  console.log(`value of users[req.session.user_id]`, users[req.session.user_id]) 
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
  console.log('test', templateVars);
  res.render("urls_show", templateVars);
  console.log('*********************');
});

app.get("/u/:shortURL", (req, res) => {
  console.log(`APP.GET("/u/:shortURL")`);
  console.log(urlDatabase);
  console.log(req.params);
  console.log(urlDatabase[req.params.shortURL])
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //res.status(200);
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
  console.log(`APP.GET("/login")`)
  let templateVars = {
    //user: null
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
  console.log('*********************');
});

// ********************* POSTS *************************

app.post("/register", (req, res) => {
  console.log(`APP.POST("/register")`)
  console.log(req.body.email);
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please add email and password');
  } 
  else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Your email already exists. Please login.');
  } else {
    console.log('req.body', req.body);
    let password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log(hashedPassword);
    console.log(bcrypt.compareSync(password, hashedPassword));
    const userId = generateRandomString();
    const user = {id: userId, email: req.body.email, password: hashedPassword};
    users[userId] = user;
    req.session.user_id = userId;
    res.redirect('/urls');
    console.log(user);
    console.log('*********************');
  }});

app.post("/login", (req, res) => {
  console.log(`APP.POST("/login")`);
  console.log('req.body', req.body);
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  console.log(bcrypt.compareSync(password, hashedPassword));
  console.log(req.body);
  console.log('email lookup function', getUserByEmail(req.body.email, users));
  let userInfo = getUserByEmail(req.body.email, users);
  //console.log('user info: ', userInfo); 
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
  console.log('logging out');
  req.session = null;
  res.redirect('/urls');
  console.log('*********************');
});

app.post("/urls/:id", (req, res) => {
  console.log(`APP.POST("/urls/:id)`)
  console.log('updating URL', req.body);
  console.log(req.params.id);
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls'); //was '/urls'
  console.log('*********************');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`APP.POST("/urls/:shortURL/delete")`)
  //console.log('req.params: ', req.params);
  //if username of user matches that of the URL, follow through with delete funciton
  //console.log('userId', urlDatabase[req.params.shortURL].userID);
  //console.log(req.params);
  //console.log(users[req.session.user_id].id)
  //console.log('cookie', users[req.session.user_id].id);
  //delete urlDatabase[req.params.shortURL];
  //  res.redirect("/urls");
  // console.log('225', users[req.session.user_id].id)
  const user = users[req.session.user_id];
  if (user) {
    if (urlDatabase[req.params.shortURL].userID === users[req.session.user_id].id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
    else {
      console.log('230')
      res.status(400).send("You are not authorized to delete!")
    }
  } else {
    res.status(400).send('User not found');
  }
  //console.log('urlDatabase: ', urlDatabase);
  console.log('*********************');
});

app.post("/urls", (req, res) => {
  console.log(`APP.POST("/urls")`)
  console.log('req body: ', req.body);
  console.log(`users[req.session.user_id]`, users[req.session.user_id]);
  const shorty = generateRandomString();
  //urlDatabase[shorty] = req.body.longURL;
  urlDatabase[shorty] = {longURL: req.body.longURL, userID: users[req.session.user_id].id};
  console.log('urlDatabase: ', urlDatabase);
  res.redirect(`/urls/${shorty}`);
  console.log('*********************')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});