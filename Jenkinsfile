pipeline {
    agent any
    


        environment {
            DOCKER_IMAGE = 'pet-sitter-web'
            DOCKER_TAG = "${BUILD_NUMBER}"
            CONTAINER_NAME = 'pet-sitter-web-container'
        }

        stages {
            stage('Checkout') {
                steps {
                    git branch: 'master', url: 'https://github.com/SDSamarasinghe/Pet-Sitter-Management-System-Web.git'
                }
            }

            stage('Stop Previous Container') {
                steps {
                    script {
                        sh '''
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            docker rmi ${DOCKER_IMAGE}:latest || true
                        '''
                    }
                }
            }

            stage('Build Docker Image') {
                steps {
                    sh '''
                        cat > Dockerfile << 'EOF'
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    FROM node:18-alpine AS production
    WORKDIR /app
    COPY --from=builder /app/.next ./.next
    # Removed public copy since it does not exist
    # COPY --from=builder /app/public ./public
    EXPOSE 3000
    CMD ["npm", "start"]
    EOF
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest .
                    '''
                }
            }

            stage('Deploy') {
                steps {
                    sh '''
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            -p 3000:3000 \
                            -e NODE_ENV=production \
                            -e NEXT_PUBLIC_API_URL=http://20.151.57.93:8000 \
                            --restart unless-stopped \
                            ${DOCKER_IMAGE}:latest
                    '''
                }
            }

            stage('Health Check') {
                steps {
                    script {
                        sh 'sleep 30'
                        sh '''
                            for i in {1..5}; do
                                if curl -f http://localhost:3000; then
                                    echo "Web app is healthy!"
                                    break
                                else
                                    echo "Attempt $i failed, retrying..."
                                    sleep 10
                                fi
                            done
                        '''
                    }
                }
            }

            stage('Cleanup') {
                steps {
                    sh 'docker image prune -f'
                }
            }
        }

        post {
            always {
                sh 'docker ps'
                sh 'docker logs ${CONTAINER_NAME} --tail=20 || true'
            }

            success {
                echo 'Deployment successful! 🎉'
                echo 'Web app is running at: http://20.151.57.93:3000'
            }

            failure {
                echo 'Deployment failed! 😞'
                sh 'docker logs ${CONTAINER_NAME} || true'
            }
        }
    }
