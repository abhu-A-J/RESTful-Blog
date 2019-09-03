var bodyParser = require("body-parser"),
    methodOverride=require("method-override"),
    express = require("express"),
    expressSanitizer = require('express-sanitizer'),
    app = express(),
    mongoose = require("mongoose");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());

app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/blog_site", { useNewUrlParser: true });

var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes
//ROOT Route
app.get("/", function(req, res) {
  res.redirect("/blogs");
});

//INDEX Route
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, allBlogs) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: allBlogs });
    }
  });
});

//NEW Route
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

//Create Route

app.post("/blogs", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, blogAdded) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/blogs");
    }
  });
});

//Show Route
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show",{ blog: foundBlog });
    }
  });
});

//EDIT Route

app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, editBlog) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit",{blog:editBlog}); 
        }
    });
    
});

// UPDATE Route
app.put("/blogs/:id", function (req, res) { 
 
    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/blogs/" + req.params.id);
       }
    });
});

// DELETE Route
app.delete("/blogs/:id", function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err, deletedBlog) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/blogs");
       }
    });
});
// APP Check
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Blog Site is running");
});
