const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

//a database to keep track of all the URLs and their shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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