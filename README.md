# Inventory and Data Management System

A beginner-friendly REST API for managing products, stock, and inventory reports. The project is built with Node.js, Express, MongoDB, Mongoose, and dotenv.

## Features

- Create, view, update, and delete products
- Filter products by category and search product names
- Sort and paginate product listings
- Restock products and sell stock without allowing negative inventory
- View low-stock products and category-level inventory summaries
- Validate product data and return readable API errors

## Requirements

- Node.js and npm
- MongoDB running locally

## Setup

1. Install the project dependencies:

   ```powershell
   npm install
   ```

   On Windows PowerShell, if script execution blocks `npm`, use:

   ```powershell
   npm.cmd install
   ```

2. Configure the MongoDB connection. The provided `.env.example` uses the local database `inventoryDB`. Copy it to `.env` if `.env` does not already exist:

   ```powershell
   Copy-Item .env.example .env
   ```

   `.env` is ignored by Git; do not commit credentials or secrets.

3. Start the server:

   ```powershell
   npm start
   ```

   On Windows PowerShell, use `npm.cmd start` if needed. The API starts at `http://localhost:3000` after a successful MongoDB connection. Set `PORT` in `.env` to use a different port.

## Product fields

| Field | Type | Rules |
| --- | --- | --- |
| `name` | String | Required; trimmed |
| `category` | String | Required; trimmed |
| `price` | Number | Required; at least `0` |
| `quantity` | Number | At least `0`; defaults to `0` |
| `lowStockThreshold` | Number | At least `0`; defaults to `10` |
| `createdAt`, `updatedAt` | Date | Added automatically |

## API endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products` | List products; supports `category`, `search`, `sort`, `order`, `page`, and `limit` query parameters |
| `GET` | `/api/products/:id` | Get a product by ID |
| `PUT` | `/api/products/:id` | Update product fields with schema validation |
| `DELETE` | `/api/products/:id` | Delete a product |
| `PATCH` | `/api/products/:id/restock` | Increase stock by the `quantity` in the request body |
| `PATCH` | `/api/products/:id/sell` | Decrease stock if enough stock is available |
| `GET` | `/api/reports/low-stock` | List products at or below their low-stock threshold |
| `GET` | `/api/reports/category-summary` | Summarize product count, stock, and inventory value by category |

### Example requests

Create a product with `POST /api/products` and a JSON body:

```json
{
  "name": "Laptop",
  "category": "Electronics",
  "price": 50000,
  "quantity": 20,
  "lowStockThreshold": 5
}
```

Use the product `_id` returned by the API in `:id` routes. Stock routes expect a positive numeric quantity, for example:

```json
{
  "quantity": 3
}
```

Example product listing with category filtering, sorting, and pagination:

```text
GET /api/products?category=Electronics&sort=price&order=asc&page=1&limit=5
```

The `search` query parameter searches product names. The product list response includes `totalProducts`, `page`, `limit`, and `totalPages`.

## Project structure

```text
config/db.js                 MongoDB connection
models/Product.js            Product schema and validation
routes/productRoutes.js      Product and stock APIs
routes/reportRoutes.js       Inventory report APIs
middleware/errorHandler.js   Central API error responses
middleware/validateObjectId.js Product ID validation
server.js                    Express app and startup
.env.example                 Example local configuration
```

## Postman test screenshots

The following screenshots show the API requests and responses tested in Postman.

### Create product

![Create product: Laptop](screenshots/01-create-product.png)

### Get all products

![Get all products](screenshots/02-get-all-products.png)

### Get a single product

![Get a single product by ID](screenshots/03-get-single-product.png)

### Update product

![Update product](screenshots/04-update-product.png)

### Restock product

![Restock product](screenshots/05-restock.png)

### Sell product

![Sell product](screenshots/06-sell.png)

### Low-stock report with no matching products

![Low-stock report with an empty result](screenshots/07-low-stock-empty.png)

### Initial category summary

![Initial category summary](screenshots/08-category-summary-initial.png)

### Filter, sort, and paginate products

![Filter, sort, and pagination](screenshots/09-filter-sort-pagination.png)

### Create a low-stock product

![Create a product that is below its stock threshold](screenshots/10-create-low-stock-product.png)

### Low-stock report with a matching product

![Low-stock report showing a matching product](screenshots/11-low-stock-alert.png)

### Updated category summary

![Category summary after adding another product](screenshots/12-updated-category-summary.png)

### Product validation error

![Validation error for a negative product price](screenshots/13-validation-error.png)

### Delete product

![Delete product](screenshots/14-delete-product.png)

### Verify deletion

![Requesting the deleted product returns not found](screenshots/15-verify-deletion.png)
