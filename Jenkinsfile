pipeline {
    agent any
    environment {
        NODE_VERSION = '14'
        REACT_APP_API_URL = 'https://api.yourapp.com'
        VERSION = "${env.BUILD_NUMBER}"
        DOCKERHUB_USERNAME = credentials('dockerhub-username') // DockerHub 사용자 이름
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials' // DockerHub 자격 증명 ID
        K8S_DEPLOYMENT_NAME = 'your-frontend-deployment' // Kubernetes 배포 이름
        K8S_CONTAINER_NAME = 'your-frontend-container' // Kubernetes 컨테이너 이름
    }
    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'your-git-credentials-id', url: 'https://github.com/your-username/project_202.git'
            }
        }
        stage('Install dependencies') {
            steps {
                dir('src/main/frontend') {
                    sh 'npm ci'
                }
            }
        }
        stage('Test') {
            steps {
                dir('src/main/frontend') {
                    sh 'npm run test'
                }
            }
        }
        stage('Build') {
            steps {
                dir('src/main/frontend') {
                    sh 'npm run build'
                }
            }
        }
        stage('Docker Build and Push') {
            steps {
                script {
                    def myApp = docker.build("${env.DOCKERHUB_USERNAME}/frontend-app:${env.BUILD_NUMBER}", "src/main/frontend/.")
                    docker.withRegistry('https://registry.hub.docker.com', "${env.DOCKERHUB_CREDENTIALS_ID}") {
                        myApp.push()
                        myApp.push('latest')
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh "kubectl set image deployment/${env.K8S_DEPLOYMENT_NAME} ${env.K8S_CONTAINER_NAME}=${env.DOCKERHUB_USERNAME}/frontend-app:${env.BUILD_NUMBER}"
                    sh "kubectl rollout status deployment/${env.K8S_DEPLOYMENT_NAME}"
                }
            }
        }
    }
    post {
        failure {
            script {
                sh "kubectl rollout undo deployment/${env.K8S_DEPLOYMENT_NAME}"
            }
        }
    }
}
