const {User} = require('./../models/user');
const express = require('express');
const router = express.Router();
const Err = require('./../errors/error');
const bcrpypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
   try {
   const userList = await User.find().select('-passwordHash');
   
   if(!userList) {
      res.status(500).json({success: false});
   }
   res.send(userList);
   }catch(err) {
      res.status(500).json(err.message);
   }
});

router.get('/:id', async (req, res) => {  
   try {
      let user = await User.findById(req.params.id).select('-passwordHash');
      
      if(!user) {
         return res.status(404).json(new Err('user not found'));
      }
      res.json(user);
   } catch (err) {
      res.status(404).json(err);
   }
});

router.post('/', async (req, res) => {
   try{
      let user = new User({
         name: req.body.name,
         email: req.body.email,
         passwordHash: bcrpypt.hashSync(req.body.password, 10),
         phone: req.body.phone,
         isAdmin: req.body.isAdmin,
         apartament: req.body.apartament,
         zip: req.body.zip,
         city: req.body.city,
         country: req.body.country
      });
      user = await user.save();
      
      if(!user){
         return res.status(404).send('User cant be created');
      }

      res.json(user);
   } catch (err) {
      res.status(400).json(err.message);
   }
});

router.post('/login', async (req, res) => {
   
   let user = await User.findOne({email: req.body.email});

   if(!user) {
      return res.status(400).json(new Err('email not registered'));
   } 
   if(req.body.password && bcrpypt.compareSync(req.body.password, user.passwordHash)) {

      const token = jwt.sign(
         {
            userEmail: user.email,
            isAdmin: user.isAdmin,
         },
         process.env.JWT_SECRET,
         {
            expiresIn: '1d'
         }
      );
      res.json({user: user.email, token: token});
   } else {
      res.status(400).json(new Err('wrong password'));
   }
});


module.exports = router;