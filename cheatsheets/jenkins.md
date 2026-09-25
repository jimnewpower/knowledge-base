# Jenkins Maven pipelines cheat sheet

> Baseline: Jenkins Declarative Pipeline with Pipeline and JUnit plugins, a configured Linux JDK[^jdk] 21 agent, and Maven Wrapper. Reviewed: 2026-09-25.

Keep verification in a versioned Jenkinsfile and project POM[^pom]. The agent, plugins, and credentials are part of the delivery environment.

Related: [Maven](maven.md), [GitLab CI/CD](gitlab-ci.md)[^ci][^cd], [GitHub Actions](github-actions-maven.md), [reproducible builds](reproducible-builds.md).

## Verification Jenkinsfile

Example for a Maven application loaded from SCM[^scm]. Configure the `linux-jdk21` agent label first; commit an executable, LF[^lf]-terminated `mvnw` and its wrapper files. This job verifies code and publishes reports, without deploying it.

```groovy
pipeline {
    agent { label 'linux-jdk21' }
    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }
    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }
        stage('Verify') {
            steps {
                sh './mvnw --batch-mode --no-transfer-progress verify'
            }
        }
    }
    post {
        always {
            junit testResults: '**/target/surefire-reports/TEST-*.xml,**/target/failsafe-reports/TEST-*.xml',
                  allowEmptyResults: false
        }
    }
}
```

`deleteDir()` removes the allocated job workspace before checkout; use dedicated agents/workspaces, never a manually assigned shared directory. On Windows agents, use the appropriate label and `bat 'mvnw.cmd ...'`. Adjust test-report paths for the project, while making unexpectedly missing tests visible.

## Credentials and agent trust

- Treat a Jenkinsfile, POM, plugin and test as executable code. Untrusted pull requests need agents without production credentials or privileged host access.
- Scope credentials to the stage/command requiring them; masking is not an access boundary.
- Avoid Groovy interpolation of secrets into shell command strings. Let a fixed shell script read a scoped environment binding.
- Pin/review shared libraries and plugins; record the agent image/toolchain version.
- A container using the host Docker socket can control much of the host; isolate it accordingly.

## Release path

Make Surefire/Failsafe, analysis, and coverage part of Maven `verify`. Keep deployment credentials and approval/promotion rules in a protected release path. Archive the exact release artifacts, hashes, SBOM[^sbom] and provenance; do not rebuild independently for every environment.

Distinguish failed, unstable, aborted, and successful outcomes in downstream promotion rules. Confirm that an intentionally failing test blocks the release path and that archived test output contains no credentials.

## References

- [Jenkins Declarative Pipeline syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins credentials binding](https://www.jenkins.io/doc/pipeline/steps/credentials-binding/)
- [Jenkins JUnit step](https://www.jenkins.io/doc/pipeline/steps/junit/)

[^jdk]: Java Development Kit.
[^pom]: Project Object Model — Maven's project configuration.
[^ci]: Continuous Integration.
[^cd]: Continuous Delivery or Continuous Deployment; delivery keeps changes releasable, while deployment automatically releases them to production.
[^scm]: Source Code Management.
[^lf]: Line Feed — the newline character used by Unix-style text files.
[^sbom]: Software Bill of Materials.
