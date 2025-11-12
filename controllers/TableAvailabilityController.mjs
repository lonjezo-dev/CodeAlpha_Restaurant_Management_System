import  TableAvailabilityService  from "../services/TableAvailabilityService.mjs";

class TableAvailabilityController {
  
  /**
   * Check availability of a specific table
   */
  static async checkTableAvailability(req, res) {
    try {
      const { tableId } = req.params;
      const { reservation_time, duration_minutes } = req.body;

      const availability = await TableAvailabilityService.checkTableAvailability(
        tableId, 
        reservation_time ? new Date(reservation_time) : new Date(),
        duration_minutes || 120
      );

      res.json(availability);

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to check table availability',
        details: error.message 
      });
    }
  }

  /**
   * Quick check for immediate order placement
   */
  static async checkImmediateAvailability(req, res) {
    try {
      const { tableId } = req.params;

      const availability = await TableAvailabilityService.canAcceptImmediateOrder(tableId);

      res.json(availability);

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to check table availability',
        details: error.message 
      });
    }
  }

  /**
   * Find available tables for criteria
   */
  static async findAvailableTables(req, res) {
    try {
      const { party_size, reservation_time, duration_minutes } = req.body;

      if (!party_size) {
        return res.status(400).json({ 
          error: 'party_size is required' 
        });
      }

      const availableTables = await TableAvailabilityService.findAvailableTables(
        parseInt(party_size),
        reservation_time ? new Date(reservation_time) : new Date(),
        duration_minutes || 120
      );

      res.json({
        available_tables: availableTables,
        count: availableTables.length,
        search_criteria: {
          party_size: parseInt(party_size),
          reservation_time: reservation_time || new Date().toISOString(),
          duration_minutes: duration_minutes || 120
        }
      });

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to find available tables',
        details: error.message 
      });
    }
  }

  /**
   * Get detailed table status
   */
  static async getTableStatus(req, res) {
    try {
      const { tableId } = req.params;

      const statusInfo = await TableAvailabilityService.getTableStatus(tableId);

      res.json(statusInfo);

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get table status',
        details: error.message 
      });
    }
  }

  /**
   * Get all tables with their current status
   */
  static async getAllTablesStatus(req, res) {
    try {
      const result = await TableAvailabilityService.getAllTablesStatus();

      res.json(result);

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get tables status',
        details: error.message 
      });
    }
  }
}

export default TableAvailabilityController;