# My IMC Tracker

Our work for the practical assignment for the “Cloud Computing Systems Design and Architecture” course at UQAC.  
This project is a web application that allows users to track their weight and calculate their Body Mass Index (BMI). It is built using a Flask backend and a React frontend, with a PostgreSQL database for data storage. The application can be deployed with Docker and Docker Compose or on a Kubernetes cluster.

## Features

Here are some of the features of the application:
- User registration and authentication
- BMI, weight, and height entry forms for BMI calculation and history tracking
- History of BMI, weight, and height entries
- Data persistence with PostgreSQL

## Installation

### Prerequisites

To deploy the application, you need to have the following software installed on your machine:
- [Python 3.10+](https://www.python.org/downloads)
- [Node.js 14+](https://nodejs.org/en/download/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Docker](https://docs.docker.com/desktop/) and [Docker Compose](https://docs.docker.com/compose/install/) OR [Kubernetes](https://kubernetes.io/releases/download/) (The simple way is to use [Docker Dekstop](https://docs.docker.com/desktop/) which supports both Docker/Docker Compose and Kubernetes)

### Steps for Docker Compose Deployment

Here are the steps to deploy the application:
1. Unzip the project folder or clone the repository:
   ```bash
   git clone https://github.com/AubinSeptier/TP-Cloud-Computing.git
   ```

2. Navigate to the project directory.

3. Configure the environment variables:
    - Copy the `.env.example` file to `.env`:
     ```bash
        cp .env.example .env
    ```

    - Replace the values in the `.env` file with your own configuration. Make sure to set the `DATABASE_URL` to point to your PostgreSQL database.

4. Build and run the application using Docker Compose:
   ```bash
    docker-compose up -d --build
    ```

5. Check if everything is running correctly:
   ```bash
    docker-compose ps
   ```

6. Initialize the database by running these commands (if first time running):
   ```bash
    docker-compose exec backend flask db init
    docker-compose exec backend flask db migrate
    docker-compose exec backend flask db upgrade
   ```

6. Access the application in your web browser at `http://localhost`.

7. To stop the application, run:
   ```bash
   docker-compose down
   ```


### Steps for Kubernetes Deployment

Here are the steps to deploy the application:
1. Unzip the project folder or clone the repository:
   ```bash
   git clone https://github.com/AubinSeptier/TP-Cloud-Computing.git
   ```

2. Navigate to the project directory.

3. Build the Docker images:
   ```bash
    docker build -t imc-tracker-backend:latest ./backend
    docker build -t imc-tracker-frontend:latest ./frontend
   ```

4. Create the Kubernetes configurations:
    - Copy the `secrets.yaml.example` file to `secrets.yaml`:
     ```bash
        cp secrets.yaml.example secrets.yaml
    ```

    - Update the secrets int the file copiying the values from following commands:
     ```bash
        echo -n "YOUR_POSTGRES_USER" | base64 
        echo -n "YOUR_POSTGRES_PASSWORD" | base64
     ```

    - Update `configmap.yaml` if needed, especially the `DATABASE_URL` to point to your PostgreSQL database.

5. Install the NGINX Ingress Controller if you haven't already:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
   ```

   - Wait for the Ingress Controller to be ready:
   ```bash
    kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s
   ```

6. Deploy the application:
   ```bash
    kubectl apply -f k8s/config/
    kubectl apply -f k8s/db/
    kubectl wait --for=condition=available --timeout=60s deployment/db
    kubectl apply -f k8s/backend/
    kubectl wait --for=condition=available --timeout=60s deployment/backend
    kubectl apply -f k8s/backend/migration-job.yaml
    kubectl apply -f k8s/frontend/
    kubectl apply -f k8s/ingress/
   ```

7. In the `/etc/hosts` file of your system, add the following line to access the application:
   ```
   127.0.0.1 imc-tracker.local
   ```
**ℹ️Note**: `C:\Windows\System32\drivers\etc\hosts` on Windows, or `/etc/hosts` on Linux/MacOS.

8. Check if everything is running correctly:
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

9. Access the application in your web browser at `http://imc-tracker.local`.

10. To delete the application, run:
    ```bash
    kubectl delete -f k8s/
    ```

### Troubleshooting

If you encounter any issues during the deployment, here are some common troubleshooting steps:
- Docker Compose:
    - Check the logs of the containers:
        ```bash
        docker-compose logs
        ```

    - Restart a service:
        ```bash
        docker-compose restart <service_name>
        ```

- Kubernetes:
    - Check the logs of the pods:
        ```bash
        kubectl logs <pod_name>
        ```

    - Describe a pod to get more information:
        ```bash
        kubectl describe pod <pod_name>
        ```

    - Restart a deployment:
        ```bash
        kubectl rollout restart deployment/<deployment_name>
        ```