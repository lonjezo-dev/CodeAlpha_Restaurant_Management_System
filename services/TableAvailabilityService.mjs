import { Table } from '../model/Table.mjs';
import { Reservation } from '../model/Reservation.mjs';
import { Order } from '../model/Order.mjs';
import { Op } from '@sequelize/core';

class TableAvailabilityService {
  
  /**
   * Check if a table is available at a specific time
   */
  static async checkTableAvailability(tableId, reservationTime = new Date(), durationMinutes = 120) {
    try {
      const table = await Table.findByPk(tableId);
      if (!table) {
        throw new Error('Table not found');
      }

      // Calculate time range for the reservation
      const reservationStart = new Date(reservationTime);
      const reservationEnd = new Date(reservationStart.getTime() + durationMinutes * 60000);

      // Check current table status
      if (table.status !== 'available') {
        return {
          available: false,
          reason: `Table is currently ${table.status}`,
          table
        };
      }

      // Check for overlapping reservations
      const overlappingReservations = await Reservation.findAll({
        where: {
          table_id: tableId,
          status: ['pending', 'confirmed'],
          reservation_time: {
            [Op.between]: [reservationStart, reservationEnd]
          }
        }
      });

      if (overlappingReservations.length > 0) {
        return {
          available: false,
          reason: 'Table is reserved for that time',
          table,
          conflictingReservations: overlappingReservations
        };
      }

      // Check for active orders (table might be occupied)
      const activeOrder = await Order.findOne({
        where: {
          table_id: tableId,
          order_status: ['pending', 'in_progress']
        }
      });

      if (activeOrder) {
        return {
          available: false,
          reason: 'Table has active orders',
          table,
          activeOrder
        };
      }

      return {
        available: true,
        table,
        message: 'Table is available'
      };

    } catch (error) {
      throw new Error(`Availability check failed: ${error.message}`);
    }
  }

  /**
   * Quick check for immediate order (no reservation time needed)
   */
  static async canAcceptImmediateOrder(tableId) {
    try {
      const table = await Table.findByPk(tableId);
      if (!table) {
        return { available: false, reason: 'Table not found' };
      }

      // For immediate orders, only check current status and active orders
      if (table.status !== 'available') {
        return { available: false, reason: `Table is ${table.status}` };
      }

      const activeOrder = await Order.findOne({
        where: {
          table_id: tableId,
          order_status: ['pending', 'in_progress']
        }
      });

      if (activeOrder) {
        return { available: false, reason: 'Table has active orders' };
      }

      return { available: true, table };

    } catch (error) {
      throw new Error(`Immediate order check failed: ${error.message}`);
    }
  }

  /**
   * Find available tables for a party size and time
   */
  static async findAvailableTables(partySize, reservationTime = new Date(), durationMinutes = 120) {
    try {
      const reservationStart = new Date(reservationTime);
      const reservationEnd = new Date(reservationStart.getTime() + durationMinutes * 60000);

      // Get all tables that can accommodate the party
      const suitableTables = await Table.findAll({
        where: {
          capacity: {
            [Op.gte]: partySize
          },
          status: 'available'
        }
      });

      const availableTables = [];

      for (const table of suitableTables) {
        // Check for overlapping reservations
        const overlappingReservations = await Reservation.count({
          where: {
            table_id: table.id,
            status: ['pending', 'confirmed'],
            reservation_time: {
              [Op.between]: [reservationStart, reservationEnd]
            }
          }
        });

        // Check for active orders
        const activeOrder = await Order.findOne({
          where: {
            table_id: table.id,
            order_status: ['pending', 'in_progress']
          }
        });

        if (overlappingReservations === 0 && !activeOrder) {
          availableTables.push(table);
        }
      }

      return availableTables;

    } catch (error) {
      throw new Error(`Finding available tables failed: ${error.message}`);
    }
  }

  /**
   * Update table status when order is created/completed
   */
  static async updateTableStatus(tableId, status) {
    try {
      const table = await Table.findByPk(tableId);
      if (!table) {
        throw new Error('Table not found');
      }

      await table.update({ status });
      return table;

    } catch (error) {
      throw new Error(`Table status update failed: ${error.message}`);
    }
  }

  /**
   * Get table status with details
   */
  static async getTableStatus(tableId) {
    try {
      const table = await Table.findByPk(tableId, {
        include: [
          {
            model: Order,
            where: {
              order_status: ['pending', 'in_progress']
            },
            required: false
          },
          {
            model: Reservation,
            where: {
              status: ['pending', 'confirmed'],
              reservation_time: {
                [Op.gte]: new Date()
              }
            },
            required: false,
            order: [['reservation_time', 'ASC']]
          }
        ]
      });

      if (!table) {
        throw new Error('Table not found');
      }

      const statusInfo = {
        table,
        currentStatus: table.status,
        hasActiveOrder: table.Orders && table.Orders.length > 0,
        upcomingReservations: table.Reservations || [],
        isAvailable: table.status === 'available' && 
                    (!table.Orders || table.Orders.length === 0)
      };

      return statusInfo;

    } catch (error) {
      throw new Error(`Table status check failed: ${error.message}`);
    }
  }

  /**
   * Get all tables with their current status
   */
  static async getAllTablesStatus() {
    try {
      const tables = await Table.findAll({
        include: [
          {
            model: Order,
            where: {
              order_status: ['pending', 'in_progress']
            },
            required: false
          }
        ],
        order: [['table_number', 'ASC']]
      });

      const tablesWithStatus = tables.map(table => ({
        id: table.id,
        table_number: table.table_number,
        capacity: table.capacity,
        status: table.status,
        has_active_order: table.Orders && table.Orders.length > 0,
        is_available: table.status === 'available' && 
                     (!table.Orders || table.Orders.length === 0)
      }));

      return {
        tables: tablesWithStatus,
        summary: {
          total_tables: tables.length,
          available_tables: tablesWithStatus.filter(t => t.is_available).length,
          occupied_tables: tablesWithStatus.filter(t => !t.is_available).length
        }
      };

    } catch (error) {
      throw new Error(`Getting all tables status failed: ${error.message}`);
    }
  }
}

export default TableAvailabilityService;