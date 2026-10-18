pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        skipStagesAfterUnstable()
    }

    stages {
        stage('Checkout') {
            agent { docker { image 'oven/bun:alpine'; reuseNode true } }
            steps { checkout scm }
        }

        stage('Install Dependencies') {
            agent { docker { image 'oven/bun:alpine'; reuseNode true } }
            steps {
                sh '''
                    set -e
                    bun install
                '''
            }
        }

        stage('Test') {
            agent { docker { image 'node:24-alpine'; reuseNode true } }
            steps {
                sh '''
                    set -e
                    # Gagal bila coverage < 100% (threshold di vite.config.ts)
                    npx vitest run --coverage
                '''
            }
        }

        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:0.74.0'
                    reuseNode true
                    args '--entrypoint="" -e HOME=/tmp -e XDG_CACHE_HOME=/tmp/.cache'
                }
            }
            steps {
                sh '''
                    set -e
                    mkdir -p .trivy-cache || true
                    trivy fs \
                        --cache-dir .trivy-cache \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --format sarif \
                        --output trivy-results.sarif \
                        --exit-code 1 \
                        .
                '''
            }
            post {
                always {
                    recordIssues(
                        enabledForFailure: true,
                        failOnError: false,
                        tools: [sarif(id: 'trivy', name: 'Trivy Security', pattern: 'trivy-results.sarif')]
                    )
                }
            }
        }

        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                    reuseNode true
                    args '--network cicd-network'
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        set -e
                        sonar-scanner
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Package Application') {
            agent { docker { image 'node:24-alpine'; reuseNode true; args '-u root' } }
            steps {
                sh '''
                    set -e
                    apk add --no-cache zip unzip
                    rm -f latest-app.zip
                    zip -r latest-app.zip . \
                        -x "node_modules/*" -x ".git/*" -x ".env" -x ".env.*" \
                        -x "coverage/*" -x "build/*" -x ".svelte-kit/*" -x ".vercel/*" \
                        -x ".trivy-cache/*" -x "latest-app.zip" -x "trivy-results.sarif" \
                        -x ".docs/*"
                    unzip -l latest-app.zip
                '''
            }
        }

        stage('Publish Application') {
            steps {
                archiveArtifacts artifacts: 'latest-app.zip', fingerprint: true, allowEmptyArchive: false
                script {
                    def appName = env.JOB_NAME
                        .replaceAll('[^a-zA-Z0-9._-]', '-')
                        .replaceAll('-+', '-')
                        .replaceAll('^-|-$', '')
                    def buildId = env.BUILD_NUMBER

                    sh """
                        set -e
                        docker exec cicd-jenkins mkdir -p "/var/jenkins_home/userContent/applications/${appName}/${buildId}"
                        docker cp latest-app.zip "cicd-jenkins:/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    """

                    def jenkinsBaseUrl = env.BUILD_URL
                        .substring(0, env.BUILD_URL.indexOf('/job/'))
                        .replace('localhost', 'host.docker.internal')

                    env.ARTIFACT_URL = "${jenkinsBaseUrl}/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    echo "Artifact URL: ${env.ARTIFACT_URL}"
                }
            }
        }

        stage('Deploy Application') {
            agent { docker { image 'curlimages/curl:8.15.0'; reuseNode true; args '--network cicd-network' } }
            steps {
                script {
                    sh '''
                        set -e
                        curl -sS --fail-with-body -X POST "$URL_REDEPLOY" \
                            -H "Content-Type: application/json" \
                            -d "{\\"token_access\\": \\"$DEPLOY_TOKEN\\", \\"website_id\\": \\"$WEBSITE_ID\\", \\"source_url\\": \\"$ARTIFACT_URL\\", \\"source_type\\": \\"jenkins\\"}"
                    '''

                    def maxAttempts = 120
                    def attempt = 0
                    def status = 'IN_PROGRESS'

                    while (status == 'IN_PROGRESS') {
                        attempt++
                        if (attempt > maxAttempts) {
                            error("Deployment timeout setelah ${maxAttempts} percobaan.")
                        }
                        sleep time: 5, unit: 'SECONDS'

                        def response = sh(
                            script: '''
                                set -e
                                curl -sS --fail-with-body -X POST "$URL_PROGRESS" \
                                    -H "Content-Type: application/json" \
                                    -d "{\\"token_access\\": \\"$DEPLOY_TOKEN\\", \\"website_id\\": \\"$WEBSITE_ID\\"}"
                            ''',
                            returnStdout: true
                        ).trim()

                        def json = readJSON text: response
                        status = json?.data?.status?.toString()?.toUpperCase()
                        if (!status) { error('Response progress tidak memiliki data.status') }
                        echo "Deployment Status: ${status}"

                        if (status == 'FAIL') {
                            echo(json?.data?.log ?: 'Deployment failed tanpa log.')
                            error("Deployment gagal untuk website ${WEBSITE_ID}")
                        }
                    }
                }
            }
        }
    }

    post {
        always { archiveArtifacts artifacts: 'trivy-results.sarif', allowEmptyArchive: true }
        success { echo "Pipeline sukses. Artifact: ${env.ARTIFACT_URL ?: '(tidak dipublikasikan)'}" }
        failure { echo 'Pipeline gagal. Periksa stage yang merah pada Console Output.' }
    }
}
