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
        GCP_PROJECT_ID = 'elite-variety-430807-n0'
        GCP_CLUSTER_NAME = 'gke-cluster'
        GCP_COMPUTE_ZONE = 'us-central1'
        GOOGLE_APPLICATION_CREDENTIALS = credentials('gcp-service-account-key')
    }
    stages {
        stage('Start Docker Daemon') {
            steps {
                sh 'bash -c "if ! pgrep -x dockerd > /dev/null; then dockerd > /var/log/dockerd.log 2>&1 & sleep 10; fi"'
            }
        }
        stage('Install Node.js and Yarn') {
            steps {
                sh 'bash -c "curl -sL https://deb.nodesource.com/setup_18.x | bash -; apt-get update && apt-get install -y nodejs; npm install -g yarn"'
            }
        }
        stage('Install gcloud CLI and gke-gcloud-auth-plugin') {
            steps {
                sh '''
                bash -c "
                if ! command -v gcloud &> /dev/null; then
                    echo gcloud CLI not found. Installing...
                    curl -sSL https://sdk.cloud.google.com | bash
                    echo 'source /root/google-cloud-sdk/path.bash.inc' >> ~/.bashrc
                    echo 'source /root/google-cloud-sdk/completion.bash.inc' >> ~/.bashrc
                    source /root/google-cloud-sdk/path.bash.inc
                    source /root/google-cloud-sdk/completion.bash.inc
                fi
                gcloud components install kubectl
                gcloud components install gke-gcloud-auth-plugin
                gcloud components update
                kubectl version --client
                "
                '''
            }
        }
        stage('Configure gcloud') {
            steps {
                sh '''
                bash -c "
                source /root/google-cloud-sdk/path.bash.inc
                gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
                gcloud config set project $GCP_PROJECT_ID
                gcloud container clusters get-credentials $GCP_CLUSTER_NAME --zone $GCP_COMPUTE_ZONE
                "
                '''
            }
        }
        stage('Debug GCP and kubectl') {
            steps {
                sh '''
                bash -c "
                source /root/google-cloud-sdk/path.bash.inc
                echo Debugging GCP and kubectl configuration
                echo GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS
                echo GCP_PROJECT_ID: $GCP_PROJECT_ID
                echo GCP_CLUSTER_NAME: $GCP_CLUSTER_NAME
                echo GCP_COMPUTE_ZONE: $GCP_COMPUTE_ZONE
                gcloud version
                gcloud config list
                gcloud auth list
                kubectl version --client
                kubectl cluster-info
                "
                '''
            }
        }
        stage('Checkout') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh '''
                        bash -c "
                        if [ -d cicd-frontend ]; then
                            rm -rf cicd-frontend
                        fi
                        git config --global url.https://${GITHUB_TOKEN}:x-oauth-basic@github.com/.insteadOf https://github.com/
                        git clone https://github.com/andrewkimswe/cicd-frontend.git
                        "
                        '''
                    }
                }
            }
        }
        stage('Install dependencies') {
            steps {
                dir('cicd-frontend') {
                    sh 'bash -c "yarn install"'
                }
            }
        }
        stage('Test') {
            steps {
                dir('cicd-frontend') {
                    sh 'yarn test'
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
                    bash -c "kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_CONTAINER_NAME}=${DOCKERHUB_USERNAME}/frontend-app:${VERSION} --record"
                    '''
                }
                sh '''
                kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_CONTAINER_NAME}=${DOCKERHUB_USERNAME}/frontend-app:${VERSION} --record
                '''
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