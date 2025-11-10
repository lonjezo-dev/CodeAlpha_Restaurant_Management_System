import  { Inventory } from "../model/Inventory.mjs";

// Create a new inventory item
export const createInventoryItem = (req, res) => {
    const { item_name, quantity, unit } = req.body;

    Inventory.create({
        item_name,
        quantity,
        unit
    })          
    .then(inventoryItem => {
        res.status(201).json(inventoryItem);
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to create inventory item', details: error.message });
    });
};

// Get all inventory items
export const getAllInventoryItems = (req, res) => {
    Inventory.findAll({ 
       attributes:['id','item_name','quantity','unity','last_updated']
    })
    .then(inventoryItems => {
        res.status(200).json(inventoryItems);
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve inventory items', details: error.message });
    });
};

// Get a specific inventory item by ID
export const getInventoryItemById = (req, res) => {
    const id = req.params.id;

    Inventory.findByPk(id)
    .then(inventoryItem => {
        res.status(200).json(inventoryItem);
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve inventory item', details: error.message });
    });
};      
// Update an inventory item by ID
export const updateInventoryItem = (req, res) => {
    const id = req.params.id;
    const { item_name, quantity, unit } = req.body;

    Inventory.update(
        { item_name, quantity, unit, last_updated: new Date() },
        { where: { id } }
    )
    .then(() => {
        res.status(200).json({ message: 'Inventory item updated successfully' });
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to update inventory item', details: error.message });
    });
};

// Delete a specific inventory item by ID
export const deleteInventoryItem = (req, res) => {
    const id = req.params.id;

    Inventory.destroy({ where: { id } })
    .then(() => {
        res.status(200).json({ message: 'Inventory item deleted successfully' });
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to delete inventory item', details: error.message });
    });
};

