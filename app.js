let express = require('express');
let app = express();
/// for reading value form .env 
let dotenv = require('dotenv');
dotenv.config();
// for logging purposes
let morgan = require('morgan');
let fs = require('fs');
let port = process.env.PORT || 9800;
let cors = require('cors');
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let mongoUrl = process.env.MongoLive;
let bodyParser = require('body-parser');
let db;

// middleware
app.use(morgan('short',{stream:fs.createWriteStream('./app.logs')}))
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.get('/',(req,res) => {
    res.send('This is From Express App code')
})

// List of Category

app.get('/category',(req,res)=>{
    db.collection('category').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// List of Items

app.get('/items',(req,res)=>{
    db.collection('data').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// List of Items wrt Category


 app.get('/products',(req,res) => {
    let query = {};
    let categoryid = Number(req.query.categoryid);
    if(categoryid){
        query={category_id:categoryid}
    }
    db.collection('data').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// List of Items wrt Brand


app.get('/brand',(req,res) => {
    let query = {};
    let brandid = Number(req.query.brandid);
    if(brandid){
        query={brand_id:brandid}
    }
    db.collection('data').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// Items wrt cost & Brand & sort


app.get('/filter/:brandid',(req,res) => {
    let query = {};
    let sort = {cost:1}
    let brandid = Number(req.params.brandid);
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);
    if(req.query.sort){
        sort={cost:req.query.sort}
    }
    if(brandid){
        query={"brand_id":brandid}
    }
    if(lcost && hcost){
        query={
            "brand_id":brandid,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    db.collection('data').find(query).sort(sort).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

// Details of the product


app.get('/details/:id',(req,res) => {
      //  let id = mongo.ObjectId(req.params.id)
        let id = Number(req.params.id)
        db.collection('data').find({id:id}).toArray((err,result) =>{
            if(err) throw err;
            res.send(result)
        })
    })

 // Item Details

app.post('/Itemdetails',(req,res) => {
    if(Array.isArray(req.body.id)){
        db.collection('data').find({product_id:{$in:req.body.id}}).toArray((err,result) =>{
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Invalid Input')
    }
})

 // List of orders


 app.get('/orders',(req,res) => {
        let email = req.query.email
        let query = {};
        if(email){
           // query={email:email}
            query={email}
        }
        db.collection('orders').find(query).toArray((err,result) =>{
            if(err) throw err;
            res.send(result)
        })
    })

 // Place Order


 app.post('/placeOrder',(req,res) => {
        console.log(req.body);
        db.collection('orders').insert(req.body,(err,result) => {
            if(err) throw err;
            res.send('Order Placed')
        })
    })

    // Update Payment Details (PUT)


    app.put('/updateOrder/:id',(req,res) => {
            let oid = Number(req.params.id);
            db.collection('orders').updateOne(
                {orderid:oid},
                {
                    $set:{
                        "status":req.body.status,
                        "bank_name":req.body.bank_name,
                        "date":req.body.date
                    }
                },(err,result) => {
                    if(err) throw err;
                    res.send('Order Updated')
                }
            )
        })

    // Delete Order (Delete)

        app.delete('/deleteOrder/:id',(req,res) => {
                let _id = mongo.ObjectId(req.params.id);
                db.collection('orders').deleteOne({_id},(err,result) => {
                    if(err) throw err;
                    res.send('Order Deleted')
                })
            })
            
    
// // list of restaurant
// app.get('/restaurants',(req,res) => {
//     let query = {};
//     let stateId = Number(req.query.stateId);
//     let mealId = Number(req.query.mealId);
//     if(stateId){
//         query={state_id:stateId}
//     }else if(mealId){
//         query={"mealTypes.mealtype_id":mealId}
//     }
//     db.collection('restaurants').find(query).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// app.get('/filter/:mealId',(req,res) => {
//     let query = {};
//     let sort = {cost:1}
//     let mealId = Number(req.params.mealId);
//     let cuisineId = Number(req.query.cuisineId);
//     let lcost = Number(req.query.lcost);
//     let hcost = Number(req.query.hcost);
//     if(req.query.sort){
//         sort={cost:req.query.sort}
//     }
//     if(cuisineId && lcost && hcost){
//         query={
//             "mealTypes.mealtype_id":mealId,
//             "cuisines.cuisine_id":cuisineId,
//             $and:[{cost:{$gt:lcost,$lt:hcost}}]
//         }
//     }
//     else if(cuisineId){
//         query={
//             "mealTypes.mealtype_id":mealId,
//             "cuisines.cuisine_id":cuisineId
//         }
//     }else if(lcost && hcost){
//         query={
//             "mealTypes.mealtype_id":mealId,
//             $and:[{cost:{$gt:lcost,$lt:hcost}}]
//         } 
//     }
//     db.collection('restaurants').find(query).sort(sort).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// // list of meals
// app.get('/meals',(req,res) => {
//     db.collection('mealType').find().toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// //restaurant details
// app.get('/details/:id',(req,res) => {
//     //let id = mongo.ObjectId(req.params.id)
//     let id = Number(req.params.id)
//     db.collection('restaurants').find({restaurant_id:id}).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// restaurant menu details
// app.get('/menu/:id',(req,res) => {
//     let id = Number(req.params.id)
//     db.collection('menu').find({restaurant_id:id}).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// app.post('/placeOrder',(req,res) => {
//     console.log(req.body);
//     db.collection('orders').insert(req.body,(err,result) => {
//         if(err) throw err;
//         res.send('Order Placed')
//     })
// })

// // //menu details
// app.post('/menuItem',(req,res) => {
//     if(Array.isArray(req.body.id)){
//         db.collection('menu').find({menu_id:{$in:req.body.id}}).toArray((err,result) =>{
//             if(err) throw err;
//             res.send(result)
//         })
//     }else{
//         res.send('Inavlid Input')
//     }
// })


// //list of order
// app.get('/orders',(req,res) => {
//     let email = req.query.email
//     let query = {};
//     if(email){
//        // query={email:email}
//         query={email}
//     }
//     db.collection('orders').find(query).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// app.put('/updateOrder/:id',(req,res) => {
//     let oid = Number(req.params.id);
//     db.collection('orders').updateOne(
//         {orderId:oid},
//         {
//             $set:{
//                 "status":req.body.status,
//                 "bank_name":req.body.bank_name,
//                 "date":req.body.date
//             }
//         },(err,result) => {
//             if(err) throw err;
//             res.send('Order Updated')
//         }
//     )
// })

// app.delete('/deleteOrder/:id',(req,res) => {
//     let _id = mongo.ObjectId(req.params.id);
//     db.collection('orders').deleteOne({_id},(err,result) => {
//         if(err) throw err;
//         res.send('Order Deleted')
//     })
// })


// connection with mongo
MongoClient.connect(mongoUrl,(err,client)=>{
    if(err) console.log(`Error while connecting`);
    db = client.db('VisionRays')
    app.listen(port,() => {
        console.log(`Listing to port ${port}`)
    })
})