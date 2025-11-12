---
title: Github Actions로 배포 파이프라인 구축
description: Github Actions로 배포 파이프라인을 구축해보자
date: 2024-08-09T07:32:41.911Z
tags:
  - GitHub Actions
  - NEXTERS
  - 백엔드
---
# 서론

뽀모냥 팀의 백엔드 배포 파이프라인 구축 방식을 기록해두려고한다.

크게 Docker, Github Action이라는 두가지 키워드를 중심으로 배포가 구성된다.

전체적인 순서는 다음과 같다.

1. 수동 트리거 조작
2. 이미지 build & push
3. 이미지 pull & run

아주 대략적으로 설명한 방식이고 스크립트를 하나씩 보면서 살펴보자.

> 배포 스크립트를 구성해준 최고개발자 빛상운에게 무한 감사인사를 보냅니다 ⭐

# 수동 실행

보통 Github Action을 활용하여 배포를 수행할 때 `코드가 merge 되었을 때`를 일반적으로 생각했었는데 이번에는 수동으로 컨트롤하여 branch별로 배포가 가능하도록 구성할 수 있다는 것을 알았다.

> 참고 문서: [Github Actions 워크플로 - on.workflow_dispatch](https://docs.github.com/ko/actions/writing-workflows/workflow-syntax-for-github-actions#onworkflow_dispatch)

Github Actions workflow에는 `workflow_dispatch`라는 방식이 존재한다.
이 방식은 발생하는 이벤트에 값을 같이 담아줄 수 있는 방식이다.

> ⚠️ 이 방식은 default branch에 github workflow가 등록되어있어야 적용이 된다.

백문이 불여일견 결과물이 어떻게 나오는지 한번 보고 스크립트를 살펴보자.

![](/images/4f4bba4d-e4c1-4713-be6c-cc639b6f2a10-image.png)

Build and Deploy Pipeline이라는 workflow에 대해서 Run workflow로 수동으로 워크플로우를 동작시킬 수 있는 것을 볼 수 있다.

각각의 설정이 어떻게 들어가있는지 확인해보자.

```yaml
on:
  workflow_dispatch:
    inputs: # 아래 imageTag, env, deployOnly 라는 세개의 입력을 받는다.
      imageTag:
        description: 'Image tag'
        required: true
        default: 'latest' # 기본값
      env:
        description: 'Environment. [dev | prod]'
        required: true
        default: 'dev'
        type: choice
        options:
          - dev
          - prod
      deployOnly:
        description: 'Deploy only'
        required: true
        default: false
        type: boolean
```
대부분 직관적으로 확인할 수 있는 값들이다.
`description`은 설명하는 글이고, required는 필수값 여부, type은 각 input이 어떤 타입으로 받는지 선언하는 부분이라고 볼 수 있겠다.

> input 컨텍스트의 Type은 string, number, boolean, choice 4가지로 설정이 가능하다.
> 
> ![](/images/2c70eb77-c572-4a08-b916-8eb432bd7786-image.png)

이제 우리는 이렇게 input을 받아서 각 분기별로 어떻게 처리할지를 생각하면된다.

## jobs

jobs는 특정 워크플로우 내에서 실행되는 개별 작업 단위를 말한다.
여기서는 총 3개의 작업을 등록하여 사용하고있다.

### 배포알림

배포가 시작되었을 때 디스코드로 알림을 보내려고한다.

jobs에서는 위에서 설정한 inputs의 값들을 가져와 사용할 수 있다.
이 값들과 Github Actions에서 제공하는 기본값들, 비밀키로 설정한 값들 등을 조합하여 배포가 시작됨을 알리는 워크플로우를 구성해볼 수 있다.

```yaml
jobs:
  echo-inputs:
    runs-on: ubuntu-latest
    steps:
      - name: send custom message with args
        uses: tsickert/discord-webhook@v6.0.0
        with:
          webhook-url: ${{ secrets.DEPLOY_WEBHOOK_URL }}
          embed-title: "${{ inputs.env }}에 배포 시작한다냥"
          embed-url: "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          embed-description: |
            env: ${{ inputs.env }}
            targetBranch: ${{ steps.get_branch.outputs.branch }}
            imageTag: ${{ inputs.imageTag }}
            deployOnly: ${{ inputs.deployOnly }}

...
```

> 💡 Secret 변수 같은 경우는 `Repository - Settings - Secerets and variables - Actions` 에서 설정할 수 있다.
> Secrets는 암호화되어 저장되기 때문에 설정 후 재확인이 불가능하다. 반면에 variables는 그냥 생 데이터가 저장되고 확인 가능하다. 민감정보는 Secrets로 관리하자.
> 
> ![](/images/7cca050d-5a8e-493c-b131-d23070373a12-image.png)

[discord로 webhook을 보내는 action](https://github.com/tsickert/discord-webhook)을 활용하여 각 값을 적절하게 넣고 메시지를 전송한다.

![](/images/ea1f8786-5bd3-41ba-b2a2-faef91fb56af-image.png)

배포 시작 알림이 잘 전송 되는것을 확인할 수 있다.

> 💡 기본 변수들에 대해서는 아래 자료를 참고하면 된다. 필요한 값이 있다면 공식문서를 보고 뽑아서 활용하자.
> 참고 자료 : [Github Actions 기본 변수](https://docs.github.com/ko/actionswriting-workflows/choosing-what-your-workflow-does/variables#default-environment-variables)

### 이미지 build & push

배포 과정에서 Docker를 사용하기로 해서 이미지를 build하고 레지스트리에 push하는 job을 추가했다.

```yaml
jobs:
...
  build-image-and-push:
    if: ${{ inputs.deployOnly == false }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: bootBuildImage with gradle
        run: ./gradlew :clean :bootBuildImage --imageName=${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }} -x test

      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ vars.CR_ENDPOINT }}
          username: ${{ secrets.CR_USERNAME }}
          password: ${{ secrets.CR_PASSWORD }}

      - name: Docker Push
        run: docker push ${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }}
...
```

이 워크플로우도 직관적으로 읽어 볼 수 있겠다.

코드레벨에서 변경사항이 없고, 배포만 다시 해야하는 경우 (deployOnly가 false) 이 과정을 생략한다.

- Github Actions에서 제공하는 [checkout](https://github.com/actions/checkout), [setup-java](https://github.com/actions/setup-java)를 활용해서 자바 버전을 21로 설정한다.
- gradlew 를 실행하기 위해 `chmod +x gradlew` 명령어로 실행 권한을 부여해줬다.
- gradle의 bootBuildImage를 활용해서 Docker image를 빌드한다.
- 이후에는 docker Container Registry에 로그인해서 이미지를 push한다.

여기서 Container Registry로는 [NCP(Navaer Cloud Platform)의 Container Registry](https://www.ncloud.com/product/containers/containerRegistry)를 사용하고있다.

> bootBuildImage 
> 참고자료: https://spring.io/guides/gs/spring-boot-docker

### image pull & run

이제 도커 레지스트리에 이미지를 올렸으니 이미지를 pull 받고 컨테이너를 구동하면 된다!

```yaml
jobs:
...
  pull_and_run_container:
    name: pull oci image and run
    needs: build-image-and-push
    if: |
      always() &&
      (needs.build-image-and-push.result == 'success' || needs.build-image-and-push.result == 'skipped')
    runs-on: ubuntu-latest
    steps:
      - name: set stage
        run: |
          if [ ${{ inputs.env }} == 'dev' ]; then
              echo "stage is dev"
              echo "springProfile=dev" >> $GITHUB_ENV
              echo "serverHost=${{ vars.DEV_SERVER_HOST }}" >> $GITHUB_ENV
              echo "awsAccessKeyId=${{ secrets.DEV_SERVER_AWS_ACCESS_KEY_ID }}" >> $GITHUB_ENV
              echo "awsSecretAccessKey=${{ secrets.DEV_SERVER_AWS_SECRET_ACCESS_KEY }}" >> $GITHUB_ENV
          else
              echo "stage is prod"
              echo "springProfile=prod" >> $GITHUB_ENV
              echo "serverHost=${{ vars.PROD_SERVER_HOST }}" >> $GITHUB_ENV
              echo "awsAccessKeyId=${{ secrets.PROD_SERVER_AWS_ACCESS_KEY_ID }}" >> $GITHUB_ENV
              echo "awsSecretAccessKey=${{ secrets.PROD_SERVER_AWS_SECRET_ACCESS_KEY }}" >> $GITHUB_ENV
          fi
      - name: connect ssh and deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ env.serverHost }}
          username: ${{ secrets.GH_ACTIONS_USERNAME }}
          key: ${{ secrets.GH_ACTIONS_KEY }}
          passphrase: ${{ secrets.GH_ACTIONS_PASSPHRASE }}
          port: ${{ vars.SSH_PORT }}
          script: |
            docker login -u ${{ secrets.CR_USERNAME }} -p ${{ secrets.CR_PASSWORD }} ${{ vars.CR_ENDPOINT }}
            docker pull ${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }}
            docker stop $(docker ps --filter "name=api-server" -a -q)
            docker rm $(docker ps --filter "name=api-server" -a -q)
            docker run -m 1024m --memory-swap 3g -d --name api-server --network host -v /var/logs/api-server:/workspace/logs -v /etc/localtime:/etc/localtime:ro -e DD_PROFILING_ENABLED="true" -e DD_LOGS_INJECTION="true" -e DD_ENV=${{ env.springProfile }} -e TZ="Asia/Seoul" -e SPRING_PROFILES_ACTIVE=${{ env.springProfile }} -e AWS_ACCESS_KEY_ID=${{ env.awsAccessKeyId }} -e AWS_SECRET_ACCESS_KEY=${{ env.awsSecretAccessKey }} -p 8080:8080 ${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }}
            docker image prune -f
            docker logout ${{ vars.CR_ENDPOINT }}
...
```

뭔가 많아서 어지러울수도 있지만 하나씩 차근차근 읽어보자

- needs 블록을 통해 `build-image-and-push` job이 수행된 뒤에 실행되는 job이라고 선언했다.
  - `needs` 블록은 기본적으로 성공한 job에 대해서만 이어서 수행하게끔 구성되어있다.
  - [`always()`](https://docs.github.com/ko/actions/writing-workflows/choosing-what-your-workflow-does/using-jobs-in-a-workflow#%EC%98%88-%EC%84%B1%EA%B3%B5%EC%A0%81%EC%9D%B8-%EC%A2%85%EC%86%8D-%EC%9E%91%EC%97%85%EC%9D%B4-%ED%95%84%EC%9A%94%ED%95%98%EC%A7%80-%EC%95%8A%EC%9D%8C)를 선언해서 성공하나, 안하나 항상 실행하도록 구성할 수 있다.
  - 여기서는 deployOnly라는 옵션이 있기 때문에 생략되는 경우에도 실행해야한다는 요구사항이 있기 때문에 always()를 이용해 `success`, `skipped` 두가지 상황에 대해 성공이라고 판단한다.


- `set stage` Step에서는 환경 변수로 사용할 값들을 `~ >> $GITHUB_ENV` 와 같은 형태로 저장한다.
  - GITHUB_ENV 환경 파일에 작성하여 뒤에서 변수를 사용할 수 있도록 도와준다.
  - 여기서는 `springProfile`, `serverHost`, `awsAccessKeyId`, `awsSecretAccessKey` 변수를 설정하고 있다.
  - [Github Actions - 환경변수 설정](https://docs.github.com/ko/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#setting-an-environment-variable)


- `connect ssh and deploy` Step에서는 서버로 ssh 접속을 하여 배포를 수행하는 부분이다.
  - [appleboy/ssh-action@master](https://github.com/appleboy/ssh-action)를 사용하여 ssh 접속을 수행한다.
  - docker login부터 docker run, docker logout 까지 이미지를 갱신하고 컨테이너를 실행하는 명령어를 작성했다.
  
## 정리

이렇게 크게 총 3단계

1. 수동 트리거 조작
2. 이미지 build & push
3. 이미지 pull & run

과정을 살펴봤다.

Github Action을 잘 활용하면 이런 파이프라인 환경을 무료로 구성할 수 있다는 점이 매력적인것 같다.

# 전체 파이프라인 코드

```yaml
name: Build and Deploy Pipeline

on:
  workflow_dispatch:
    inputs:
      imageTag:
        description: 'Image tag'
        required: true
        default: 'latest'
      env:
        description: 'Environment. [dev | prod]'
        required: true
        default: 'dev'
        type: choice
        options:
          - dev
          # - prod 배포할 때 해제.
      deployOnly:
        description: 'Deploy only'
        required: true
        default: false
        type: boolean

jobs:
  echo-inputs:
    runs-on: ubuntu-latest
    steps:
      - name: Get branch name
        id: get_branch
        run: echo "::set-output name=branch::${GITHUB_REF#refs/heads/}"
      - name: echo inputs
        run: |
          echo "imageTag: ${{ inputs.imageTag }}"
          echo "env: ${{ inputs.env }}"
          echo "deployOnly: ${{ inputs.deployOnly }}"
      - name: send custom message with args
        uses: tsickert/discord-webhook@v6.0.0
        with:
          webhook-url: ${{ secrets.DEPLOY_WEBHOOK_URL }}
          embed-title: "${{ inputs.env }}에 배포 시작한다냥"
          embed-url: "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          embed-description: |
            env: ${{ inputs.env }}
            targetBranch: ${{ steps.get_branch.outputs.branch }}
            imageTag: ${{ inputs.imageTag }}
            deployOnly: ${{ inputs.deployOnly }}

  build-image-and-push:
    if: ${{ inputs.deployOnly == false }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: bootBuildImage with gradle
        run: ./gradlew :clean :bootBuildImage --imageName=${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }} -x test

      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ vars.CR_ENDPOINT }}
          username: ${{ secrets.CR_USERNAME }}
          password: ${{ secrets.CR_PASSWORD }}

      - name: Docker Push
        run: docker push ${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }}

  pull_and_run_container:
    name: pull oci image and run
    needs: build-image-and-push
    if: |
      always() &&
      (needs.build-image-and-push.result == 'success' || needs.build-image-and-push.result == 'skipped')
    runs-on: ubuntu-latest
    steps:
      - name: set stage
        run: |
          if [ ${{ inputs.env }} == 'dev' ]; then
              echo "stage is dev"
              echo "springProfile=dev" >> $GITHUB_ENV
              echo "serverHost=${{ vars.DEV_SERVER_HOST }}" >> $GITHUB_ENV
              echo "awsAccessKeyId=${{ secrets.DEV_SERVER_AWS_ACCESS_KEY_ID }}" >> $GITHUB_ENV
              echo "awsSecretAccessKey=${{ secrets.DEV_SERVER_AWS_SECRET_ACCESS_KEY }}" >> $GITHUB_ENV
          else
              echo "stage is prod"
              echo "springProfile=prod" >> $GITHUB_ENV
              echo "serverHost=${{ vars.PROD_SERVER_HOST }}" >> $GITHUB_ENV
              echo "awsAccessKeyId=${{ secrets.PROD_SERVER_AWS_ACCESS_KEY_ID }}" >> $GITHUB_ENV
              echo "awsSecretAccessKey=${{ secrets.PROD_SERVER_AWS_SECRET_ACCESS_KEY }}" >> $GITHUB_ENV
          fi
      - name: connect ssh and deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ env.serverHost }}
          username: ${{ secrets.GH_ACTIONS_USERNAME }}
          key: ${{ secrets.GH_ACTIONS_KEY }}
          passphrase: ${{ secrets.GH_ACTIONS_PASSPHRASE }}
          port: ${{ vars.SSH_PORT }}
          script: |
            docker login -u ${{ secrets.CR_USERNAME }} -p ${{ secrets.CR_PASSWORD }} ${{ vars.CR_ENDPOINT }}
            docker pull ${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }}
            docker stop $(docker ps --filter "name=api-server" -a -q)
            docker rm $(docker ps --filter "name=api-server" -a -q)
            docker run -m 1024m --memory-swap 3g -d --name api-server --network host -v /var/logs/api-server:/workspace/logs -v /etc/localtime:/etc/localtime:ro -e DD_PROFILING_ENABLED="true" -e DD_LOGS_INJECTION="true" -e DD_ENV=${{ env.springProfile }} -e TZ="Asia/Seoul" -e SPRING_PROFILES_ACTIVE=${{ env.springProfile }} -e AWS_ACCESS_KEY_ID=${{ env.awsAccessKeyId }} -e AWS_SECRET_ACCESS_KEY=${{ env.awsSecretAccessKey }} -p 8080:8080 ${{ vars.CR_ENDPOINT }}/pomonyang-api:${{ inputs.imageTag }}
            docker image prune -f
            docker logout ${{ vars.CR_ENDPOINT }}
```


