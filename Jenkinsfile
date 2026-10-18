pipeline {
  agent any

  environment {
    VITE_DELCOM_BASEURL = 'https://open-api.delcom.org/api/v1'
    APP_PORT = '3005'
    PATH = "${env.HOME}/.bun/bin:${env.PATH}"
  }

  stages {
    stage('Install') {
      steps {
        sh 'bun install --frozen-lockfile || bun install'
      }
    }

    stage('Type Check') {
      steps {
        sh 'bun run check'
      }
    }

    stage('Test & Coverage') {
      steps {
        // Gagal bila coverage < 100% (threshold di vite.config.ts)
        sh 'bun run test:coverage'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh 'sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build') {
      steps {
        sh 'bun run build'
      }
    }
  }
}
