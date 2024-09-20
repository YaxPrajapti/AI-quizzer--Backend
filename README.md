# Quiz Application

This is a Quiz Application built with Node.js and MongoDB. The application allows users to create quizzes, submit answers, and track their scores.

## Table of Contents

- [Features](#features)
- [API Documentation](#api-documentation)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Local Installation](#local-installation)
  - [Docker Installation](#docker-installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
  - [Running Locally](#running-locally)
  - [Running Using Docker](#running-using-docker)

## Features

- Create quizzes with multiple questions and options.
- Submit answers and get scores instantly.
- Track quiz history and retry quizzes.
- Filter quiz results based on date, grade, subject, and more.

## API Documentation

For detailed API documentation, please refer to the [Postman API Documentation](https://documenter.getpostman.com/view/21704786/2sAXjRWVP6).

## Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher (for local installation)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [Docker](https://www.docker.com/) (for Docker installation)

## Installation

### Local Installation

1. Download or extract the project files to your local machine.

2. Navigate to the project directory:

   ```bash
   cd your-project-directory
   npm install
   ```

# Docker Installation Guide

## Build the Docker Image

1. Navigate to the project directory where the Dockerfile is located.

2. Run the following command to build the Docker image:

   ```bash
   docker build -t yaxprajapati/quiz:latest .
   ```

3. Run the Docker container with the environment variables:

   ```bash
   docker run --env-file .env -p 3000:3000 yaxprajapati/quiz:latest
   ```

## Stop the Docker Container

To stop the running container, follow these steps:

1. Find the Container ID of the running container:

   ```bash
   docker ps
   ```

2. Stop the container using the Container ID:

   ```bash
   docker stop <container_id>
   ```

## Environment Variables

Make sure to configure your environment variables in the `.env` file. Here’s an example format:

    # Example of environment variables
    # Replace the values with your actual configuration

    DATABASE_URL=mongodb://localhost:27017/quiz
    JWT_SECRET=your_jwt_secret
    PORT=3000

## Running the Application

### Running Locally

1. Start MongoDB: Make sure MongoDB is running on your system.
2. Start the Application
   ```bash
   npm start
   ```
3. The application will be running on http://localhost:3000.

## Running Using Docker

If you followed the Docker Installation steps above, your application is already running inside a Docker container.

To check the logs of the running container:

```bash
    docker logs <container_id>
```
