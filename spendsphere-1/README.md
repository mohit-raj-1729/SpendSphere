# SpendSphere

SpendSphere is a budgeting and financial management application designed to help users track their income, expenses, and overall financial health. This application provides a user-friendly dashboard with various statistics, allowing users to make informed financial decisions.

## Features

- **Dashboard**: A comprehensive overview of your financial situation, including total balance, income, and expenses.
- **Transactions Management**: Easily manage and track your transactions with options to add, edit, or delete entries.
- **Budgeting Tools**: Set and compare budgets against actual spending to help you stay on track.
- **Analytics**: Detailed insights into your spending habits and trends over time.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- A database (e.g., PostgreSQL, MySQL) configured for use with Prisma

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/spendsphere.git
   ```

2. Navigate to the project directory:

   ```
   cd spendsphere
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Set up the database:

   - Update the `DATABASE_URL` in the `.env` file with your database connection string.
   - Run the Prisma migrations:

   ```
   npx prisma migrate dev --name init
   ```

### Running the Application

To start the development server, run:

```
npm run dev
```

The application will be available at `http://localhost:3000`.

### API Endpoints

- **GET /api/summary**: Fetches the summary data for the current month.
- **GET /api/transactions**: Retrieves a list of transactions.
- **POST /api/transactions**: Adds a new transaction.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for details.