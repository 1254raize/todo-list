//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.listen(port, () => console.log(`Listening on ${ port }`));

mongoose.connect("mongodb+srv://admin-daniel:Harumi94@cluster0.2u30o.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "1"});
const item2 = new Item({name: "2"});
const item3 = new Item({name: "3"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String, 
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  Item.find({}, function(err, docs){
    console.log(docs);
    if (docs.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
        console.log(err);
      } else {
        console.log("Default success");
        res.redirect("/");
      }
      });
    } else {
      console.log(docs);

      res.render("list", {listTitle: "Today", newListItems: docs});
    }
  });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const newItem = new Item({name: itemName});

  if (listName ==="Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  

});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(itemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Removed successfully!");    
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
  

  
})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("Doesn't exist!");
        const list = new List({name: customListName, items: defaultItems});
        list.save();
        res.redirect("/" + customListName)
      } else {
        console.log("Exist!")
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    } 
  })

  
});

app.get("/about", function(req, res){
  res.render("about");
});
