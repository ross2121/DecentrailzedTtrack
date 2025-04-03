# Decentralized Solana Betting App Backend

This repository contains the backend implementation for a decentralized betting application built on the Solana blockchain. The backend is responsible for managing user interactions, processing bets, and ensuring seamless communication with the Solana blockchain.

## Features

- **Decentralized Architecture**: Leverages Solana's blockchain to ensure transparency and immutability of betting transactions.
- **User Management**: Handles user authentication and wallet integration.
- **Bet Processing**: Manages the lifecycle of bets, including creation, validation, and settlement.
- **Blockchain Interaction**: Facilitates communication with the Solana blockchain for transaction execution and data retrieval.
- **Cron Job Functionality**: Automates periodic tasks to ensure smooth operation of the betting platform.

## Cron Job Functionality

The backend includes a cron job system that performs the following tasks:

1. **Bet Settlement**: Automatically checks for bets that have reached their conclusion and processes the results.
2. **Payout Distribution**: Ensures timely distribution of winnings to the respective users' wallets.
3. **Data Cleanup**: Removes expired or invalid bets from the system to maintain database efficiency.
4. **Blockchain Sync**: Periodically syncs with the Solana blockchain to fetch the latest state and ensure data consistency.
5. **Notification Dispatch**: Sends reminders or updates to users about their bets or platform activities.

## Getting Started

To set up and run the backend locally, follow these steps:

1. Clone the repository:
    ```
    git clone https://github.com/your-repo/decentralized-solana-betting-backend.git
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Build the project:
    ```
    npm run build
    ```
4. Configure environment variables in a `.env` file.
    ```
    DATABASE_URL=""
    PRIVATE_KEY=""
    ```
5. Start the server:
    ```
    npm start
    ```

### Using Docker

Alternatively, you can use Docker to build and run the project:

1. Build the Docker image:
    ```
    docker build -t decentralized-betting-backend .
    ```
2. Run the Docker container:
    ```
    docker run -p 3000:3000 --env-file .env decentralized-betting-backend
    ```

## FRONTEND REPO

[Steps Decentralized React Expo](https://github.com/ross2121/Steps-decemtralized-react-Expo)

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
