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
        AWS_REGION = 'eu-north-1'
        CLUSTER_NAME = 'my-cluster'
        AWS_CREDENTIALS_ID = 'aws-credentials'
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
        stage('Install AWS CLI v2') {
            steps {
                sh '''
                curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                unzip awscliv2.zip
                ./aws/install
                rm -rf awscliv2.zip aws
                '''
            }
        }
        stage('Install kubectl') {
            steps {
                sh '''
                curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                chmod +x kubectl
                mv kubectl /usr/local/bin/
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
        stage('Configure AWS and Kubectl') {
            steps {
                withCredentials([usernamePassword(credentialsId: AWS_CREDENTIALS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                    aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
                    aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
                    aws configure set region ${AWS_REGION}
                    aws sts get-caller-identity
                    aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}
                    kubectl config view --raw
                    kubectl cluster-info
                    '''
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([usernamePassword(credentialsId: AWS_CREDENTIALS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    dir('cicd-frontend') {
                        sh '''
                        sed -i "s/\\${VERSION}/${VERSION}/g" frontend-deployment.yml
                        echo "Applying deployment configuration..."
                        cat frontend-deployment.yml
                        kubectl apply -f frontend-deployment.yml
                        kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_CONTAINER_NAME}=${DOCKERHUB_USERNAME}/frontend-app:${VERSION}
                        kubectl rollout status deployment/${K8S_DEPLOYMENT_NAME}
                        '''
                    }
                }
            }
        }
    }
    post {
        failure {
           withCredentials([usernamePassword(credentialsId: AWS_CREDENTIALS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                sh '''
                aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
                aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
                aws configure set region ${AWS_REGION}
                aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}
                kubectl rollout undo deployment/${K8S_DEPLOYMENT_NAME}
                echo "Deployment rolled back due to failure"
                '''
            }
        }
    }
}
