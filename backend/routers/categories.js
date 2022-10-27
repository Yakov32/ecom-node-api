const {Category} = require('./../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
   const categoryList = await Category.find();
   
   if(!categoryList) {
      res.status(500).json({success: false});
   }
   res.send(categoryList);
});

router.get('/:id', (req, res) => {
   Category.findById(req.params.id).then(category => {
      if(!category) {
         return res.status(404).json({success: false, message: 'category not found'});
      }
      res.json(category);
   }).catch(err => res.status(500).json({success: false, error: err}));
});

router.post('/', async (req, res) => {
   try{
      let category = new Category({
         name: req.body.name,
         icon: req.body.icon,
         color: req.body.color,
      });
      category = await category.save();
      
      if(!category){
         return res.status(404).send('Category cant be created');
      }

      res.send(category);
   } catch (err) {
      res.send({error: err, success: false})
   }
});

router.delete('/:id', (req, res) => {
   Category.findByIdAndRemove(req.params.id)
      .then(category => {
         if(category) {
            return res.json({success: true, message: 'the category is deleted'});
         } else {
            return res.status(404).json({success: false, message: 'category not found'});
         }
      }).catch(err => {
         return res.status(400).json({success: false, error: err})
      })
});

router.put('/:id', (req, res) => {
   Category.findByIdAndUpdate(
      req.params.id,
      {
         name: req.body.name,
         icon: req.body.icon,
         color: req.body.color,
      },
      {
         new: true,
         runValidators: true,
      }
   ).then(category => {
      if(category){
         res.json(category);
      } else {
         res.status(404).json({success: false, message: 'category for update not found'});
      }
   }).catch(err => res.status(400).json({success: false, error: err}));
});

module.exports = router;