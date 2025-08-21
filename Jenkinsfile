pipeline {
    agent { label 'microgrid-agent' }

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

        // stage('Install Dependencies Frontend') {
        //     steps {
        //         dir('microgrid/EVPlanFRONTEND/frontend') {  
        //             sh '''
        //                 echo "=== Vérification de la structure du répertoire front ==="
        //                 ls -la
        //                 npm cache clean --force
        //                 npm install --legacy-peer-deps --force
        //                 npm install ajv@8.12.0 ajv-keywords@5.1.0 --force
        //             '''
        //         }
        //     }
        // }

        // stage('Build Frontend') {
        //     steps {
        //         dir('microgrid/EVPlanFRONTEND/frontend') {
        //             sh 'export CI=false && npm run build'
        //         }
        //     }
        // }


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
                    // Build Frontend
                    // dir('microgrid2/frontend') {
                    //     sh 'ls -la'
                    //     sh 'cat Dockerfile'
                    //     docker.build("${env.DOCKER_USERNAME}/${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}", ".")
                    // }

                    // // // // Build Backend
                    // dir('microgrid2/backend') {
                    //     sh 'ls -la'
                    //     sh 'cat Dockerfile'
                    //     docker.build("${env.DOCKER_USERNAME}/${env.BACKEND_IMAGE}:${env.IMAGE_TAG}", ".")
                    // }

                    // Build Database
                    dir('/db') {
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
                        echo "Logged in to Docker Registry"

                        // Push Frontend
                        // docker.image("${env.DOCKER_USERNAME}/${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}").push()
                        // docker.image("${env.DOCKER_USERNAME}/${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}").push('latest')
                        
                        // // Push Backend
                        // docker.image("${env.DOCKER_USERNAME}/${env.BACKEND_IMAGE}:${env.IMAGE_TAG}").push()
                        // docker.image("${env.DOCKER_USERNAME}/${env.BACKEND_IMAGE}:${env.IMAGE_TAG}").push('latest')

                        // Push Database
                        docker.image("${env.DOCKER_USERNAME}/${env.POSTGRES_IMAGE}:${env.IMAGE_TAG}").push('latest')
                    
                    }
                }
            }
        }

        // stage('Déploiement Kubernetes de la base de donnes') {
            steps {
                withEnv([
                    "PATH+KUBECTL=/usr/local/bin",
                    "KUBECONFIG=/home/jenkins/.kube/config"
                ]) {
                    dir('/k8s/bd') {
                        sh """
                            kubectl apply -f postgres-pvc.yaml
                            kubectl apply -f postgres-deployment.yaml
                            kubectl apply -f postgres-service.yaml
                        """
                    }
                }
            }
        }

        // stage('Déploiement Kubernetes de redis') {
        //     steps {
        //         withEnv([
        //             "PATH+KUBECTL=/usr/local/bin",
        //             "KUBECONFIG=/home/jenkins/.kube/config"
        //         ]) {
        //             dir('microgrid/k8s/redis') {
        //                 sh """
        //                     kubectl apply -f redis-deployment.yaml
        //                     kubectl apply -f redis-service.yaml
        //                 """
        //             }
        //         }
        //     }
        // }
// stage('Deploy to Staging') {
//     steps {
//                    echo 'Skipping for now.'

//     }
// }


// stage('Approve Prod') {
//     steps {
//         input message: 'Approve production deployment?'
//     }
// }


//        stage('Deploy to Production') {
//     steps {
//         withEnv([
//             "PATH+KUBECTL=/usr/local/bin",
//             "KUBECONFIG=/home/jenkins/.kube/config"
//         ]) {
//             dir('microgrid2/k8s/microgrid') {
//                 sh """
//                     echo "Déploiement sur K3s..."
//                    kubectl replace -f backend-deployment.yaml
//                    kubectl replace -f backend-service.yaml
//                    kubectl replace -f frontend-deployment.yaml
//                    kubectl replace -f frontend-service.yaml
//                    kubectl replace -f microgrid-ingress.yaml

//                 """
//             }
//         }
//     }
// }

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
