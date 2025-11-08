# 🍽️ Restaurant Management System

A comprehensive backend system for restaurant operations with advanced order processing capabilities. Built with Node.js, Express, PostgreSQL, and Sequelize ORM.

## 🚀 Live Deployment

**API Base URL:** `https://codealpha-restaurant-management-system-1.onrender.com`

## 📋 Features

### Core System
- **Menu Management** - Complete CRUD operations for menu items
- **Table Management** - Table status tracking and capacity management
- **Inventory Management** - Stock tracking and item management
- **Reservation System** - Customer reservations with status tracking

### Order Processing
- **Order Lifecycle** - Complete order workflow (pending → in_progress → completed)
- **Kitchen Coordination** - Real-time order item tracking
- **Order Modifications** - Add/remove items from existing orders
- **Status Management** - Both order-level and item-level status updates
- **Analytics** - Order statistics and preparation time estimates

## 🛠️ Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL + Sequelize ORM
- **Deployment:** Render
- **Environment:** ES Modules

## 📁 API Endpoints

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `POST /api/menu-items` - Create new menu item
- `GET /api/menu-items/:id` - Get specific menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item

### Tables
- `GET /api/table` - Get all tables
- `POST /api/table` - Create new table
- `GET /api/table/:id` - Get specific table
- `PUT /api/table/:id` - Update table
- `DELETE /api/table/:id` - Delete table

### Orders
- `POST /api/orders` - Create complete order with items
- `GET /api/orders` - Get all orders (with filtering)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/items` - Add items to existing order
- `DELETE /api/orders/:orderId/items/:itemId` - Remove item from order
- `GET /api/orders/kitchen/display` - Kitchen orders display
- `GET /api/orders/statistics` - Order analytics
- `GET /api/orders/today` - Today's orders summary

### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations/:id` - Get specific reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `GET /api/inventory/:id` - Get specific inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

## 🎯 Order Processing Workflow

### Order States
- `pending` - Order received, waiting for kitchen
- `in_progress` - Kitchen is preparing order
- `completed` - Order ready and served
- `cancelled` - Order cancelled

### Item States
- `pending` - Item waiting for preparation
- `preparing` - Item being prepared
- `ready` - Item ready for serving
- `served` - Item served to customer

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Local Development
1. Clone the repository:
```bash
git clone https://github.com/lonjezo-dev/CodeAlpha_Restaurant_Management_System
cd restaurant-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env file
DB_NAME=restaurant_management_system_db
DB_USER=your_username
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

### Production Deployment
The application is configured for deployment on Render. Environment variables are automatically managed by Render when linking a PostgreSQL database.

## 📊 Database Models

- **MenuItem** - Restaurant menu items with categories and pricing
- **Table** - Restaurant tables with capacity and status
- **Order** - Customer orders with status tracking
- **Order_Item** - Individual items within orders
- **Reservation** - Table reservations with customer details
- **Inventory** - Stock management for ingredients

## 🧪 Testing the API

### Health Check
```bash
curl https://codealpha-restaurant-management-system-1.onrender.com/health
```

### Create Sample Order
```bash
curl -X POST https://codealpha-restaurant-management-system-1.onrender.com/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "customer_notes": "No onions please",
    "order_items": [
      {
        "menu_item_id": 1,
        "quantity": 2,
        "special_instructions": "Well done"
      }
    ]
  }'
```

### Update Order Status
```bash
curl -X PATCH https://codealpha-restaurant-management-system-1.onrender.com/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

## 🔄 Key Features in Detail

### Order Creation
- Creates orders with multiple items
- Calculates total amount automatically
- Updates table status to "occupied"
- Stores item prices at time of order

### Kitchen Workflow
- Real-time order display for kitchen staff
- Individual item status tracking
- Preparation time estimates
- Special instructions handling

### Data Integrity
- Database transactions for order operations
- Proper foreign key relationships
- Cascade delete operations
- Data validation and error handling

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Payment processing integration
- [ ] Real-time notifications with WebSockets
- [ ] Advanced reporting and analytics
- [ ] Multi-tenant support for chain restaurants
- [ ] Mobile app companion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Samuel Gondwe** - OpenView

---

**Live Demo:** https://codealpha-restaurant-management-system-1.onrender.com

For API documentation and testing, use the endpoints above with your preferred API client (Postman, curl, etc.).
