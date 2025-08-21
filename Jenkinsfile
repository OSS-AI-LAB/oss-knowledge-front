pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'registry.4.230.158.187.nip.io'
        IMAGE_NAME = 'oss-ai-vtf/oss-knowledge-front'
        GITLAB_URL = 'http://gitlab.4.230.158.187.nip.io'
        GITOPS_REPO = 'oss-ai-vtf/oss-knowledge-gitops'
        NAMESPACE = 'oss-knowledge-front-dev'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    def imageTag = env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME
                    def fullImageName = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${imageTag}"
                    
                    sh "docker build -t ${fullImageName} ."
                    sh "docker push ${fullImageName}"
                    
                    // Update GitOps repository with new image tag
                    updateGitOps(imageTag)
                }
            }
        }
        
        stage('Deploy to Dev') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Trigger ArgoCD sync
                    sh """
                        kubectl patch application oss-knowledge-front-dev -n argocd \
                        --type='merge' \
                        -p='{\"spec\":{\"source\":{\"targetRevision\":\"HEAD\"}}}'
                    """
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

def updateGitOps(String imageTag) {
    // Clone GitOps repository
    sh """
        git clone http://gitlab.4.230.158.187.nip.io/${GITOPS_REPO}.git gitops-temp
        cd gitops-temp
    """
    
    // Update image tag in kustomization
    sh """
        sed -i 's|image: .*|image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${imageTag}|' \
        apps/oss-knowledge-front/overlays/dev/kustomization.yaml
    """
    
    // Commit and push changes
    sh """
        git config user.email "jenkins@oss-knowledge.com"
        git config user.name "Jenkins"
        git add .
        git commit -m "Update oss-knowledge-front image to ${imageTag}"
        git push origin HEAD:main
    """
    
    // Cleanup
    sh "rm -rf gitops-temp"
}
