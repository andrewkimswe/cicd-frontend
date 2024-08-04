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
        DO_PAT = credentials('digitalocean-pat')  // Personal Access Token
        DO_CLUSTER_NAME = 'my-do-cluster'
        DO_REGION = 'nyc1'
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
        stage('Install doctl') {
            steps {
                sh '''
                curl -sL https://github.com/digitalocean/doctl/releases/download/v1.64.0/doctl-1.64.0-linux-amd64.tar.gz | tar -xzv
                sudo mv doctl /usr/local/bin
                doctl version
                '''
            }
        }
        stage('Configure doctl') {
            steps {
                sh '''
                doctl auth init -t $DO_PAT
                doctl kubernetes cluster kubeconfig save $DO_CLUSTER_NAME
                '''
            }
        }
        stage('Debug DigitalOcean and kubectl') {
            steps {
                sh '''
                echo "Debugging DigitalOcean and kubectl configuration"
                echo "DO_CLUSTER_NAME: $DO_CLUSTER_NAME"
                echo "DO_REGION: $DO_REGION"

                doctl account get
                kubectl version --client
                kubectl cluster-info
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
