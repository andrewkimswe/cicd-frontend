pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
        REACT_APP_API_URL = 'http://localhost:3000/api'
        VERSION = "${env.BUILD_NUMBER}"
        GITHUB_TOKEN = credentials('github-token')
        DOCKERHUB_USERNAME = credentials('dockerhub-username')
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials'
        K8S_DEPLOYMENT_NAME = 'frontend-deployment'
        K8S_CONTAINER_NAME = 'frontend-container'
        GCP_PROJECT_ID = 'elite-variety-430807'
        GCP_CLUSTER_NAME = 'gke-cluster'
        GCP_COMPUTE_ZONE = 'us-central1-a'
        GOOGLE_APPLICATION_CREDENTIALS = credentials('gcp-service-account-key')
    }
    stages {
        stage('Start Docker Daemon') {
            steps {
                sh '''
                if ! pgrep -x "dockerd" > /dev/null; then
                    dockerd > /var/log/dockerd.log 2>&1 &
                    sleep 10
                fi
                '''
            }
        }
        stage('Install Node.js and Yarn') {
            steps {
                sh '''
                curl -sL https://deb.nodesource.com/setup_18.x | bash -
                apt-get update && apt-get install -y nodejs
                npm install -g yarn
                '''
            }
        }
        stage('Install kubectl and gcloud') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh '''
                    # Install kubectl
                    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                    chmod +x kubectl
                    mv kubectl /usr/local/bin/

                    # Install gcloud CLI
                    curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-367.0.0-linux-x86_64.tar.gz
                    tar -xf google-cloud-sdk-367.0.0-linux-x86_64.tar.gz
                    ./google-cloud-sdk/install.sh -q
                    '''
                }
                sh '''#!/bin/bash
                # Source the path.bash.inc script to update PATH
                . ./google-cloud-sdk/path.bash.inc

                # Authenticate with service account
                gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}
                gcloud config set project ${GCP_PROJECT_ID}
                gcloud config set compute/zone ${GCP_COMPUTE_ZONE}
                gcloud container clusters get-credentials ${GCP_CLUSTER_NAME}
                '''
            }
        }
        stage('Checkout') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh '''
                        if [ -d "cicd-frontend" ]; then
                            rm -rf cicd-frontend
                        fi
                        git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
                        git clone https://github.com/andrewkimswe/cicd-frontend.git
                        '''
                    }
                }
            }
        }
        stage('Install dependencies') {
            steps {
                dir('cicd-frontend') {
                    sh 'yarn install'
                }
            }
        }
        stage('Test') {
            steps {
                dir('cicd-frontend') {
                    sh 'yarn test -- --outputFile=./test-results.xml'
                    junit 'cicd-frontend/test-results.xml'
                }
            }
        }
        stage('Build') {
            steps {
                dir('cicd-frontend') {
                    sh 'yarn build'
                }
            }
        }
        stage('Docker Build and Push') {
            steps {
                script {
                    def myApp = docker.build("${DOCKERHUB_USERNAME}/frontend-app:${VERSION}",
                        "--build-arg REACT_APP_API_URL=${REACT_APP_API_URL} -f cicd-frontend/Dockerfile cicd-frontend")
                    docker.withRegistry('https://registry.hub.docker.com', DOCKERHUB_CREDENTIALS_ID) {
                        myApp.push()
                        myApp.push('latest')
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                    kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_CONTAINER_NAME}=${DOCKERHUB_USERNAME}/frontend-app:${VERSION} --record
                    '''
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
        always {
            cleanWs()
        }
    }
}
