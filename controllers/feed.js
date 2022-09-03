const { validationResult } = require('express-validator');
const { default: mongoose } = require('mongoose');
const Post = require('../models/post')
const User = require('../models/user')

exports.getPost = (req, res, next) => {

    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalCount;

    Post.find().countDocuments().then((count) => {
        totalCount = count;
        return Post.find().skip((currentPage - 1) * perPage).limit(perPage);


    }).then((post) => {
        res.status(200).json(
            {
                message: "post fetched successfully", posts: post, totalItems: totalCount
            }
        )
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })

}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Invalid input");
        error.statusCode(422);
        throw error;
    }

    if (!req.file) {
        const error = new Error('no image provided.');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path;
    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        imageUrl: imageUrl,
        creator: req.userId
    })

    let freshPost;

    newPost.save().then((result) => {
        freshPost = result;
    }).then(() => {
        return User.findOne({ _id: req.userId })
    }).then((user) => {
       
        user.post.push(freshPost)
        return user.save();
    }).then((user) => {
       
        res.json({
            message: "post created successfully",
            post: user.post[user.post.length - 1],
            creator: user
        })
    }).catch((err) => {
        console.log(err)
    })
   
}

exports.getPostById = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            res.status(200).json({ message: 'post fetched successfully', post: post });
        }).catch((err) => {
            const error = new Error('could not find post.')
            error.statusCode = 404;
             next(error);
        })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        console.log(req.file.path)
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        let error = new Error("No file picked up");
        error.statusCode = 422;
        throw error;
    }

    Post.findOne({_id:postId}).then((post)=>{
        if(!post){
            throw new Error("Invalid post id")
        }
        if(post.creator.toString() != req.userId){
            throw new Error("you are not authorized to update this post")
        }

        return post.updateOne({ title, content, imageUrl });
    }).then((docs)=>{
        res.json({
            message: "post updated successfully",
            post: docs
        })
       
    }).catch((err)=>{
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}


exports.deletePost = (req, res, next) => {
    const postID = req.params.postId;
    if (!postID) {
        throw new Error("Invalid post id")
    }
    
    Post.findOne({_id:postID}).then((post)=>{
        if(!post){
            throw new Error("Invalid post id")
        }
        if(post.creator.toString() != req.userId){
            throw new Error("you are not authorized to delete this post")
        }

        return post.delete();
    }).then((docs)=>{

        User.findOne({_id:req.userId}).then((user)=>{
            user.post.pull(req.params.postId);
            user.save();
            return docs;
        }).then((docs)=>{
            res.json({
                message: "post deleted successfully",
                post: docs
            })
        }).catch((err)=>{
            throw new Error(err);
        })

      
    }).catch((err)=>{
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}