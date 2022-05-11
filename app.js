const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb+srv://admin-srijan:srijan123@cluster0.hzjmu.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "How you doin?"
});
const item2 = new Item({
  name: "I am fine!"
});
const item3 = new Item({
  name: "Nah I am asking otherwise.."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  //res.send("Welcome to my server");
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }



      });
      res.redirect("/");

    } else {
      res.render("list", {
        kindOfDay: "Today",
        newListItems: foundItems
      });

    }

  });



});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);

      }
      else{
        res.render("list", {kindOfDay: foundList.name, newListItems: foundList.items});
      }
    }
  });


});


app.post("/", function(req, res) {
  const itemName = req.body.fname;
  const listName = req.body.list;

  const fun = new Item({
    name: itemName
  });

  if(listName === "Today"){
    fun.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(fun);
      foundList.save();
      res.redirect("/"+listName);
    });
  }






});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      console.log(checkedItemId);
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });

  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });

  }


});




app.listen(3000, function() {
  console.log("Yupp the servers all set up!");
});
