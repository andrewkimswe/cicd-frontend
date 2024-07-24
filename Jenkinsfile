pipeline {
    agent any
    environment {
        NODE_VERSION = '14'
        REACT_APP_API_URL = 'http://localhost:3000/api' // 실제 배포 시에는 외부에서 접근 가능한 API로 변경
        VERSION = "${env.BUILD_NUMBER}"
        GITHUB_TOKEN = credentials('github-token')
        DOCKERHUB_USERNAME = credentials('dockerhub-username') // DockerHub 사용자 이름
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials' // DockerHub 자격 증명 ID
        K8S_DEPLOYMENT_NAME = 'frontend-deployment' // Kubernetes 배포 이름, 배포 후 입력
        K8S_CONTAINER_NAME = 'frontend-container' // Kubernetes 컨테이너 이름, 배포 후 입력
    }
    stages {
         stage('Install Docker') {
                    steps {
                        sh '''
                        if ! [ -x "$(command -v docker)" ]; then
                          apt-get update
                          apt-get install -y apt-transport-https ca-certificates curl software-properties-common
                          curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
                          add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
                          apt-get update
                          apt-get install -y docker-ce
                        fi
                        '''
                    }
                }
        stage('Install Node.js') {
                    steps {
                        sh 'curl -sL https://deb.nodesource.com/setup_18.x | bash -'
                        sh 'apt-get install -y nodejs'
                    }
                }
        stage('Install Yarn') {
                    steps {
                        sh 'npm install -g yarn'
                    }
                }
        stage('Checkout') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh """
                        if [ -d "cicd-frontend" ]; then
                            rm -rf cicd-frontend
                        fi
                        git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
                        git clone https://github.com/andrewkimswe/cicd-frontend.git
                        """
                    }
                }
            }
        }
        stage('Install dependencies') {
            steps {
                dir('cicd-frontend/frontend') {
                    sh 'yarn install'
                }
            }
        }
        stage('Test') {
            steps {
                dir('cicd-frontend/frontend') {
                    sh 'yarn test'
                }
            }
        }
        stage('Build') {
            steps {
                dir('cicd-frontend/frontend') {
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
