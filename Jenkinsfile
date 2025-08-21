pipeline {
    agent { label 'planner-agent' }

    tools {
        nodejs 'Node24'
    }

    environment {
        GIT_CREDENTIALS = 'git-key'
        DOCKER_REGISTRY = 'https://index.docker.io/v1/'
        DOCKER_CREDENTIALS = 'docker-key'
        DOCKER_USERNAME = 'emp79'
        BACKEND_IMAGE = 'microgrid-backend'
        FRONTEND_IMAGE = 'microgrid-frontend'
        POSTGRES_IMAGE = 'microgrid'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Cloner le code') {
            steps {
                sh 'git config --global http.postBuffer 524288000'
                git credentialsId: "${env.GIT_CREDENTIALS}",
                    url: 'https://github.com/emp-lab25/evplan.git',
                    branch: 'main'
            }
        }

        stage('Authentifier Docker pour build') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${env.DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "🔐 Connexion à Docker Hub avec le token stocké dans docker-key..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Exemple : build Database
                    dir('db') {
                        sh 'ls -la'
                        sh 'cat dockerfile'
                        docker.build("${env.DOCKER_USERNAME}/${env.POSTGRES_IMAGE}:${env.IMAGE_TAG}", ".")
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry("${env.DOCKER_REGISTRY}", "${env.DOCKER_CREDENTIALS}") {
                        echo "✅ Connexion réussie au Docker Registry"

                        // Push Database
                        docker.image("${env.DOCKER_USERNAME}/${env.POSTGRES_IMAGE}:${env.IMAGE_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Déploiement Kubernetes de la base de données') {
            steps {
                withEnv([
                    "PATH+KUBECTL=/usr/local/bin",
                    "KUBECONFIG=/home/jenkins/.kube/config"
                ]) {
                    dir('k8s/bd') {
                        sh """
                            kubectl apply -f postgres-pvc.yaml
                            kubectl apply -f postgres-deployment.yaml
                            kubectl apply -f postgres-service.yaml
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker system prune -f'
                cleanWs()
            }
        }

        success {
            echo '✅ Build réussi !'
            emailext(
                subject: "✅ Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """Bonjour,

Le build a réussi 🎉

Job : ${env.JOB_NAME}
Build : #${env.BUILD_NUMBER}
Lien : ${env.BUILD_URL}

-- Jenkins""",
                to: 'energymodellingplatform@gmail.com'
            )
        }

        failure {
            echo '❌ Build échoué !'
            emailext(
                subject: "❌ Build FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """Bonjour,

Le build a échoué ❌

Job : ${env.JOB_NAME}
Build : #${env.BUILD_NUMBER}
Lien : ${env.BUILD_URL}

-- Jenkins""",
                to: 'energymodellingplatform@gmail.com'
            )
        }
    }
}
