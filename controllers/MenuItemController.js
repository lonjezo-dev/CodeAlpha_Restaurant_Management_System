// const { where } = require("sequelize");
const { MenuItem } = require("../model/MenuItem");

const createMenuItem = (req, res) => {
     // Call the create function on the Menu Item model, and pass the data that you receive.
     const { name, description, price, category } = req.body;

     MenuItem.create({ name, description, price, category })
         .then((menuItem) => {
            //  res.status(201).json(menuItem);
             res.status(201).json({ message: "Menu item created successfully"});

         })
         .catch((error) => {
             res.status(500).json({ error: "Failed to create menu item" });
         });
};

const getAllMenuItems = (req, res) => {
    MenuItem.findAll(
        {
      attributes: ['name', 'description', 'price', 'category'],
        // where: {}
   }).then((result) => {
         return res.json(result);
      })
      .catch((error) => {
         console.log(error);
         return res.json({
            message: "Unable to fetch records!",
         });
      });
};

const getMenuItem = (req, res) => {
    const id = req.params.id;
    // console.log(id);
    MenuItem.findByPk(id,{
         attributes: ['name', 'description', 'price', 'category'],
    })
        .then((menuItem) => {
                res.json(menuItem);
        })
        .catch((error) => {
            res.status(500).json({ error: "Failed to retrieve menu item" });
        });
};

const updateMenuItem = (req, res) => {
MenuItem.update(
    {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
    },{
        where: {
            id: req.params.id,
        },
    })
    .then(() => {
        res.status(200).json({ message: "Menu item updated successfully" });
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to update menu item" });
    });
}

const deleteMenuItem = (req, res) => {
   MenuItem.destroy({
       where: {
           id: req.params.id,
       },
   })
       .then(() => {
           res.status(200).json({ message: "Menu item deleted successfully" });
       })
       .catch((error) => {
           res.status(500).json({ error: "Failed to delete menu item" });
       });
};

const deleteAllMenuItems = (req, res) => {
    MenuItem.destroy({
        truncate: true,
    }).then(() => { 
        res.status(200).json({ message: "All menu items deleted successfully" });
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to delete all menu items" });
    });
}
module.exports = { createMenuItem, getAllMenuItems,getMenuItem, updateMenuItem, deleteMenuItem, deleteAllMenuItems };