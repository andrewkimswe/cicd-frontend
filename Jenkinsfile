pipeline {
    agent any
    environment {
        NODE_VERSION = '14'
        REACT_APP_API_URL = 'http://localhost:3000/api' // 실제 배포 시에는 외부에서 접근 가능한 API로 변경
        VERSION = "${env.BUILD_NUMBER}"
        GITHUB_TOKEN = credentials('github-token')
        DOCKERHUB_USERNAME = credentials('dockerhub-username') // DockerHub 사용자 이름
        DOCKERHUB_CREDENTIALS_ID = credentials('docker-hub-credentials') // DockerHub 자격 증명 ID
        K8S_DEPLOYMENT_NAME = 'frontend-deployment' // Kubernetes 배포 이름, 배포 후 입력
        K8S_CONTAINER_NAME = 'frontend-container' // Kubernetes 컨테이너 이름, 배포 후 입력
    }
    stages {
        stage('Checkout') {
            steps {
                script {
                    sh """
                    git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
                    git clone https://github.com/andrewkimswe/cicd-frontend.git
                    """
                }
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
                    def myApp = docker.build("${DOCKERHUB_USERNAME}/frontend-app:${VERSION}", "src/main/frontend/.")
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
                    sh "kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_CONTAINER_NAME}=${DOCKERHUB_USERNAME}/frontend-app:${VERSION}"
                    sh "kubectl rollout status deployment/${K8S_DEPLOYMENT_NAME}"
                }
            }
        }
    }
    post {
        failure {
            script {
                sh "kubectl rollout undo deployment/${K8S_DEPLOYMENT_NAME}"
            }
        }
    }
}