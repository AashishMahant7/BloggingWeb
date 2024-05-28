const { Router } = require('express');
const multer = require('multer');
const router = Router();
const path = require('path');
const Blog = require('../models/blog');
const Comment = require('../models/comment');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user
    });
});

router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
        return res.render('blog', {
            user: req.user,
            blog,
            comments,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/", upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL: `/uploads/${req.file.filename}`,
        });
        return res.redirect(`/blog/${blog._id}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/comment/:blogId', async (req, res) => {
    try {
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
