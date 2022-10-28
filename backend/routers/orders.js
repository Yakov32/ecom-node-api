const {Order} = require('./../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const Err = require('../errors/error');
const router = express.Router();

router.get(`/`, async (req, res) => {
   try{
      const orderList = await Order
         .find()
         .populate('user', 'email name id')
         .populate({
            path: 'orderItems',
            populate: {
               path: 'product',
               populate: 'category',
            }
         })
         .sort({'dateOrdered': -1})
      
      if(!orderList) {
         res.status(500).json({success: false});
      }
      res.send(orderList);
   } catch (err){
      
      res.status(500).json(err.message);
   }
});

router.get(`/:id`, async (req, res) => {
   try{
      const order = await Order
         .findById(req.params.id)
         .populate('user', 'email name id')
         .populate({
            path: 'orderItems',
            populate: {
               path: 'product',
               populate: 'category',
            }
         })
         .sort({'dateOrdered': -1})
      
      if(!order) {
         res.status(500).json({success: false});
      }
      res.send(order);
   } catch (err){
      
      res.status(500).json(err.message);
   }
});

router.get(`/get/totalsales`, async (req, res) => {
   try{
      const totalSales = await Order.aggregate([{
         $group: {_id:null, totalSales: {$sum: '$totalPrice'}},
         
      }])

      if(totalSales) {
         res.json(totalSales.pop().totalSales);
      } else {
         res.status(500).json('something wrong. totalSales cant be generated');
      }

   } catch (err){ 
      res.status(500).json(err.message);
   }
});

router.get(`/get/totalcount`, async (req, res) => {
   try{
      const totalCount = await Order.countDocuments();

      if(totalCount) {
         res.json(totalCount);
      } else {
         res.status(500).json('something wrong. totalCount cant be generated');
      }

   } catch (err){ 
      res.status(500).json(err.message);
   }
});

router.get(`/get/userorders/:userId`, async (req, res) => {
   try{
      const orderList = await Order.find({user: req.params.userId})
         .populate({
               path: 'orderItems', 
               populate: {
                     path: 'product', populate: 'category'
               }
         })

      if(orderList) {
         res.json(orderList)
      } else{
         res.json('User dont have any orders');
      }
   } catch (err){ 
      res.status(500).json(err.message);
   }
});


router.post('/', async (req, res) => {
   try{
      const orderItemsIds = await Promise.all(req.body.orderItems.map(async orderItem => {
         let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
         });

         newOrderItem = await newOrderItem.save();
         //console.log(newOrderItem);
         return newOrderItem._id;
      }));

      // let prices = [];
      // Promise.all(orderItemsIds.map(orderItemId => {
      //    OrderItem.findById(orderItemId).populate('product')
      //       .then(orderItem => {
      //          prices.push(orderItem.product.price);
      //       });
      // })).then();

      const pricesArr = await Promise.all(orderItemsIds.map(async orderItemId => {
         let orderItem = await OrderItem.findById(orderItemId).populate('product');
         return orderItem;
      }));
      const totalPrice = pricesArr.reduce((sum, orderItem) => orderItem.product.price * orderItem.quantity + sum, 0);

      let order = new Order({
         orderItems: orderItemsIds,
         shippingAddress1: req.body.shippingAddress1,
         shippingAddress2: req.body.shippingAddress2,
         city: req.body.city,
         country: req.body.country,
         zip: req.body.zip,
         phone: req.body.phone,
         status: req.body.status,
         totalPrice: totalPrice,
         user: req.body.user,
      });

      order = await order.save();
      if(!order){
         return res.status(404).send('Order cant be created');
      }

      res.send(order);

   } catch (err) {
      res.status(400).json({error: err, success: false})
   }
});

router.put('/:id', (req, res) => {
   Order.findByIdAndUpdate(
      req.params.id,
      {
         status: req.body.status
      },
      {
         new: true,
         runValidators: true,
      }
   ).then(order => {
      if(order){
         res.json(order);
      } else {
         res.status(404).json({success: false, message: 'order for update not found'});
      }
   }).catch(err => res.status(400).json({success: false, error: err}));
});

router.delete('/:id', (req, res) => {
   Order.findByIdAndRemove(req.params.id)
      .then(order => {
         if(order) {
            Promise.all(order.orderItems.map(itemId => {
              return OrderItem.findByIdAndDelete(itemId)
            }))
            .then(() => {
               res.json(order);
            });
         }else {
            return res.status(404).json({success: false, message: 'order not found'});
         }
      })
      .catch(err => {
         return res.status(400).json({success: false, error: err})
      })
});

module.exports = router;