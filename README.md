# MealMetrics

MealMetrics is a MERN Stack application for meal planning with a focus on budget consciousness. It allows users to track meals, monitor nutrition, and stay within a weekly budget.

## Features

- **User Authentication**: Secure Login and Register.
- **Budget Mode**: Set a weekly budget limit and track expenses.
- **Meal Tracker**: Add meals with nutritional info (calories, macros) and cost.
- **Dashboard**: Visual progress bar showing Budget vs Actual spending.
- **Meal Planner**: Calendar-based view (list) of meals.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, TailwindCSS, Lucide-React.
- **Backend**: Node.js, Express, Mongoose, TypeScript, JWT.
- **Database**: MongoDB.

## Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)

## Installation

1.  **Clone the repository** (if applicable) or navigate to the project root.

2.  **Install Dependencies**:
    ```bash
    # Install Server Dependencies
    cd server
    npm install

    # Install Client Dependencies
    cd ../client
    npm install
    ```

3.  **Environment Setup**:
    - The server comes with a default `.env` file. Ensure MongoDB is running locally on `mongodb://localhost:27017/mealmetrics` or update `MONGO_URI` in `server/.env`.

## Running the Application

You need to run both the backend and frontend servers.

1.  **Start the Backend**:
    Open a terminal and run:
    ```bash
    cd server
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

2.  **Start the Frontend**:
    Open a new terminal and run:
    ```bash
    cd client
    npm run dev
    ```
    The client will start on `http://localhost:5173` (or similar).

3.  **Access the App**:
    Open your browser and go to the URL shown in the client terminal (usually `http://localhost:5173`).

## Usage

1.  Register a new account and set your Weekly Budget Limit.
2.  Log in to access the Dashboard.
3.  Go to "Planner" to add meals with their cost.
4.  Check the Dashboard to see your budget progress.
