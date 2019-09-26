const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

mongoose.connect(
    "Add Database credentials here",
    {useNewUrlParser: true});

mongoose.connection.on("connected" , err =>{
    if(err) throw err;
    console.log("Connected to database ...");
});

//Mongoose Schema
const PostSchema = mongoose.Schema({
    title: String,
    content: String,
    author: String,
    timestamp: String
});

const PostModel = mongoose.model("post" , PostSchema);

//Middleware (Modern versions of express have 
// bodyparser built in so you dont have to install it)
//so the below line allows Json data to be parsed
app.use(express.json());
//This buit-in middleaware function in express parses
//incoming requests with urlencoded payloads and is based
//on bodyparser
app.use(express.urlencoded({ extended: true}));
app.use(cors());


app.post("/api/post/new" , (req, res) => {
    let payload = {
        title : req.body.title,
        content: req.body.content,
        author: req.body.author,
        timestamp: new Date().getTime()
    }

    let newPost = new PostModel(payload);

    newPost.save((err , result) => {
        if(err) res.send({success: false, msg: err});

        res.send({ success: true, result: result });
    });
});

//Fetch all posts
app.get("/api/posts/all" , (req, res) => {
    PostModel.find((err, result) => {
        if(err) res.send({ success: false , msg: err});

        res.send({success: true, result: result});
    });
});

//Update a single post by its id
app.post("/api/post/update" , (req, res) => {
    let id= req.body._id;
    let payload = req.body;
    PostModel.findByIdAndUpdate(id , payload , (err, result) => {
        if(err) res.send({success: false, msg: err });
        res.send({ success: true, result: result });
    });
});

//Delete a post
app.post("/api/post/remove" , (req, res) => {
    let id = req.body._id;

    PostModel.findById(id).remove((err, result) => {
        if(err) res.send({ success: false , msg: err});
        res.send({ success: true, result: result});
    });
});

//Handle Production 
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(__dirname + '/public/'));

    app.get(/.*/ , (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 5000;

//Start server
app.listen(port , err => {
    if(err) console.error(err);
    console.log(`Server started on port ${port}`);
});