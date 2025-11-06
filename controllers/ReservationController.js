const { Reservation } = require("../model/Reservation");

// Create a new reservation
const createReservation =  (req, res) => {
    const { customer_name, customer_phone, reservation_time, number_of_guests, table_id } = req.body;

    Reservation.create({
        customer_name,
        customer_phone,
        reservation_time,
        number_of_guests,
        table_id
    })
    .then(reservation => {
        res.status(201).json(reservation);
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to create reservation', details: error.message });
    });
}                           

// Get all reservations
const getAllReservations = (req, res) => {
    Reservation.findAll(
        {attributes: ['customer_name', 'customer_phone', 'reservation_time', 'number_of_guests', 'status']}
    )
    .then(reservations => {
        res.status(200).json(reservations);
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve reservations', details: error.message });
    });
};

// Get a specific reservation by ID
const getReservationById = (req, res) => {
    const  id = req.params.id;

    Reservation.findByPk(id, {
        attributes: ['customer_name', 'customer_phone', 'reservation_time', 'number_of_guests', 'status']
    })
    .then(reservation => {
            res.status(200).json(reservation);
        })
    .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve reservation', details: error.message });
    }); 
};

// Update a reservation by ID
const updateReservation = (req, res) => {
    const id = req.params.id;
    const { customer_name, customer_phone, reservation_time, number_of_guests, status, table_id } = req.body;

    Reservation.update(
        { customer_name, customer_phone, reservation_time, number_of_guests, status, table_id },
        { where: { id } }
    )
    .then(() => {
        res.status(200).json({ message: 'Reservation updated successfully' });
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to update reservation', details: error.message });
    });
};

// Delete a specific reservation by ID
const deleteReservation = (req, res) => {
    const id = req.params.id;

    Reservation.destroy({ where: { id } })
    .then(() => {
        res.status(200).json({ message: 'Reservation deleted successfully' });      
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to delete reservation', details: error.message });
    });
};

module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation,
    deleteReservation
};
