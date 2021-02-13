const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, (req, res) => {
   res.render('add', {
      title: 'Add new course',
      isAdd: true
   });
});

router.post('/', auth, async (req, res) => {
   // Without Mongoose
   // const course = new Course(req.body.title, req.body.price, req.body.img);

   const course = new Course({
      title: req.body.title,
      price: req.body.price,
      img: req.body.img,
      userId: req.user._id // same userId: req.user
   });

   try {
      await course.save();
      res.redirect('/courses');
   } catch (error) {
      console.log(error);
   }

});

module.exports = router;