pipeline {
    agent any

    environment {
        // Define Docker Hub credentials and Docker image names
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials' // Replace with your Jenkins credentials ID for Docker Hub
        REGISTRY = 'singhjoginder321'
        IMAGE_NAME_BACKEND = 'devlinks-backend'
        IMAGE_NAME_MIGRATION = 'devlinks-backend-migration'
        // Ensure the version is provided via Git tag
        VERSION = sh(script: "echo ${GIT_TAG}", returnStdout: true).trim()
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from the repository
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Ensure VERSION is set and not empty
                    if (VERSION == '') {
                        error "VERSION environment variable is not set. Ensure you're using Git tags for versioning."
                    }

                    // Build backend Docker image
                    sh "docker build -t ${REGISTRY}/${IMAGE_NAME_BACKEND}:${VERSION} ."
                    
                    // Build migration Docker image
                    sh "docker build -t ${REGISTRY}/${IMAGE_NAME_MIGRATION}:${VERSION} -f Dockerfile.migration ."
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    // Log in to Docker Hub
                    withDockerRegistry([credentialsId: DOCKER_CREDENTIALS_ID, url: 'https://index.docker.io/v1/']) {
                        // Push backend Docker image
                        sh "docker push ${REGISTRY}/${IMAGE_NAME_BACKEND}:${VERSION}"
                        
                        // Push migration Docker image
                        sh "docker push ${REGISTRY}/${IMAGE_NAME_MIGRATION}:${VERSION}"
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'  // Only deploy on main branch
            }
            steps {
                script {
                    // Deploy to Kubernetes using kubectl
                    sh 'kubectl apply -f k8s/'
                }
            }
        }
    }

    post {
        always {
            // Clean up Docker images after the build
            sh 'docker system prune -af'
        }
    }
}
