pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
        REACT_APP_API_URL = 'http://localhost:3000/api' // 실제 배포 시에는 외부에서 접근 가능한 API로 변경
        VERSION = "${env.BUILD_NUMBER}"
        GITHUB_TOKEN = credentials('github-token')
        DOCKERHUB_USERNAME = credentials('dockerhub-username') // DockerHub 사용자 이름
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials' // DockerHub 자격 증명 ID
        K8S_DEPLOYMENT_NAME = 'frontend-deployment' // Kubernetes 배포 이름, 배포 후 입력
        K8S_CONTAINER_NAME = 'frontend-container' // Kubernetes 컨테이너 이름, 배포 후 입력
        AWS_REGION = 'eu-north-1'  // AWS 리전 설정
        CLUSTER_NAME = 'my-cluster'  // 클러스터 이름 설정
    }
    stages {
        stage('Start Docker Daemon') {
            steps {
                sh '''
                if ! pgrep -x "dockerd" > /dev/null
                then
                    dockerd > /var/log/dockerd.log 2>&1 &
                    sleep 10
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
        stage('Configure AWS CLI') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh '''
                    aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
                    '''
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    dir('cicd-frontend') {
                        withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                            sh '''
                            export KUBECONFIG=${KUBECONFIG}
                            echo "Using KUBECONFIG: ${KUBECONFIG}"

                            # 환경 변수 치환
                            sed -i "s/\\${VERSION}/${VERSION}/g" frontend-deployment.yml

                            echo "Applying deployment configuration..."
                            cat frontend-deployment.yml
                            kubectl apply --dry-run=client -f frontend-deployment.yml || { echo "Deployment failed"; exit 1; }

                            echo "Updating container image..."
                            kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${K8S_CONTAINER_NAME}=${DOCKERHUB_USERNAME}/frontend-app:${VERSION} || { echo "Image update failed"; exit 1; }

                            echo "Checking rollout status..."
                            kubectl rollout status deployment/${K8S_DEPLOYMENT_NAME} || { echo "Rollout failed"; exit 1; }

                            echo "Deployment completed successfully"
                            '''
                        }
                    }
                }
            }
        }
    }
    post {
        failure {
            script {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh '''
                    export KUBECONFIG=$KUBECONFIG
                    kubectl rollout undo deployment/${K8S_DEPLOYMENT_NAME}
                    '''
                }
            }
        }
    }
}