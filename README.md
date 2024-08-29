This repository contains the source code for our backend application built with Node.js. Follow the instructions below to get the project up and running using Docker.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Docker](https://www.docker.com/products/docker-desktop) (including Docker Compose, if required)
- [Git](https://git-scm.com/)

## Getting Started

### Clone the Repository

First, clone the repository from GitHub:

```bash
git clone https://github.com/singhjoginder321/Devlinks-backend-nodeJS.git
cd Devlinks-backend-nodeJS
```

### Configure Environment Variables

Before running the application, you need to configure environment variables. Create a `.env` file in the root directory of the project and add the following content:

```
PORT=8001
MONGO_URI=
JWT_SECRET=2
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=false # it should be true in production
MAIL_PASS=
MAIL_USER=
MAIL_HOST=smtp.gmail.com
MAIL_SECURE=
```

Make sure to replace the placeholders with actual values. For example, provide your MongoDB URI, Cloudinary credentials, and email configuration.

### Build and Run with Docker

1. **Create a Docker Image**

   You need to build the Docker image for the project. This will compile your application and prepare it for running in a container. Run the following command:

   ```bash
   docker build -t backend-project .
   ```

   This command uses the `Dockerfile` in the root of your project to create an image named `backend-project`.

2. **Run the Docker Container**

   After building the image, you can run the container using the following command:

   ```bash
   docker run -p 8001:8001 backend-project
   ```

   This maps port `8001` on your host machine to port `8001` in the container.

3. **Access the Application**

   The backend application will be accessible via `http://localhost:8001`. You can now test and interact with your API endpoints.

## Docker Compose (Optional)

If your project uses Docker Compose, you can start the application with a single command. Ensure you have a `docker-compose.yml` file in the root of your project directory, then run:

```bash
docker-compose up
```

This command will build the image and start the container as defined in your `docker-compose.yml` file.

## Troubleshooting

- **Port Conflicts**: If you encounter issues with port conflicts, ensure that port `8001` specified in the `docker run` command is not already in use on your host machine.
- **Environment Variables**: Ensure all required environment variables are properly set in the `.env` file.
