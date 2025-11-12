---
title: "그래서 그거 어떻게 하는데요? (feat. 성능 테스트 도구)"
description: "성능테스트 도구들에 대해 알아봅시다"
date: 2024-10-20T11:38:59.460Z
tags: ["Jmeter","K6","gatling","nGrinder","postman","성능테스트"]
---
# 서론

[지난 시간](https://velog.io/@junho5336/%EC%84%B1%EB%8A%A5-%ED%85%8C%EC%8A%A4%ED%8A%B8)에 성능테스트에 대해 알아보는 시간을 가져봤다.

이론은 알겠으나 마음 한켠에 `그래서 실제로 어떻게 하는건데?` 라는 답답함이 생길 것이다. 성능테스트를 수행하기 위한 도구로는 어떤 도구들이 있고 무엇을 사용해볼 지 알아보는 시간을 가져보자.

> 실습이 위주가 되는 글입니다!
실습을 따라하지 않는다면 이야기를 듣는다는 느낌으로 가볍게 읽어주셔도 좋습니다 :)

# 성능 테스트 도구

성능 테스트를 위해 사용할 수 있는 도구들에 대해 알아보자.
시간이 조금 걸리겠지만 그냥 장단점을 나열하는 글이 아닌 직접 사용해보고 내 경험을 담은 정리를 해보려고한다.

>  [이 분의 글](https://velog.io/@dongvelop/%EC%84%B1%EB%8A%A5%ED%85%8C%EC%8A%A4%ED%8A%B8-%ED%88%B4-%EC%86%8C%EA%B0%9C)을 보고 감명받았다.

시나리오를 하나 공통적으로 잡고 스모크 테스트를 한다는 느낌으로 돌려보려고 한다.
사용할 API는 github에서 제공하는 사용자 정보를 GET 하는 API다. 

> 사용할 Target URL: https://api.github.com/users/Choi-JJunho
> 실습 환경은 silicon mac 환경이다 (맥북 에어 M1, Ram 16GB)

## Apache Jmeter

아파치 재단에서 만든 오픈소스 성능 테스트 도구로 다양한 프로토콜을 지원한다는 특징을 지닌 성능 테스트 도구다.
오픈소스인데 꾸준히 릴리즈가 이뤄지고 있다는 것이 나름의 메리트로 다가오는 것 같다

![](/images/6e100edb-2ef8-448f-9ff5-4282cb77f16f-image.png)

> https://github.com/apache/jmeter

### How to use? (설치)

jmeter 공식 홈페이지에서 다운로드 받을 수 있다.

> https://jmeter.apache.org/download_jmeter.cgi

![](/images/db60721e-b60f-47ca-ae8e-913bce7a9c16-image.png)

> 조금 투박하게 생겼지만 해치지 않아요~

![](/images/d505e800-866d-4af0-8b11-48b853674d26-image.png)

다운로드 받아서 압축을 풀면 이렇게 파일이 존재한다.
bin 경로로 들어가서 jmeter.sh 파일을 실행해주면 된다.

```shell
cd apache-jemter-5.6.3/bin

./jmeter.sh
```

![](/images/4b798b45-7988-4ce1-8f7f-fc6a90cd2608-image.png)

실행하면 이런 문구와 함께 GUI 창이 뜨는것을 볼 수 있다.

> 잘 읽어보면 GUI를 이용해서 성능테스트를 Load 하지 말라는 경고문구가 있다는 것을 볼 수 있다.
>
![](/images/46d63552-c093-4847-8236-5aaf1406623b-image.png)
>
왜지? 하고 활성상태를 보니 창만 켰는데 메모리를 476MB나 먹고있는 것을 확인할 수 있었다.. GUI가 최적화가 많이 안되어있나보다.

![](/images/739136d6-9f60-4b6d-9a26-6d6398f57c96-image.png)

GUI 에서 친절하게 한글이 지원되모습을 볼 수 있다.
메인 창에서는 테스트 시나리오 이름을 작성할 수 있다. `유저 10명이 Github에서 최준호를 1번씩 조회한다`라는 시나리오로 한번 테스트를 해보자.

### How to use? (테스트)

![](/images/fa6613f9-9852-4589-a3e9-458677a261d9-image.png)

우선 요청을 보낼 가상의 사용자를 정의해야한다. jemter에서는 스레드 1개를 1명의 가상 사용자로 만든다.

![](/images/945472c4-66b7-474e-a093-c3a914100c67-image.png)

테스트 계획을 우클릭하면 가상 사용자를 추가할 수 있는데  여러가지 옵션들이 있는것을 볼 수 있다.

![](/images/fac10b03-4c43-4fbe-92fd-48089c34be24-image.png)

가상 사용자들을 설정했다면 이 사용자들이 어떤 액션을 취해야할지. 동작을 정의해주면된다.

![](/images/2c34ad34-bbab-4d9f-afa7-8bec827dbb25-image.png)

간단하게 Get 요청을 보내는 행동을 정의했다.
만약 파라미터나 Body 등이 필요하다면 아래에 추가적으로 설정해줄 수도 있다.

![](/images/99762da0-0b3b-4a9f-851d-65c036b27e4f-image.png)

요청에 대한 리스너를 추가하여 결과를 보는 View도 추가해줄 수 있다.
이제 실행을 한번 해보자. 상단의 실행버튼을 누르면 파일을 저장하고 테스트가 실행된다.

![](/images/e9f694b6-0178-46fc-986e-0e47c9c79093-image.png)

이렇게 실행 결과가 나오는 것을 확인할 수 있다.
별도로 그래프 뷰같은걸 보고싶으면 플러그인을 확장해서 볼 수 있다고 한다.

### 평가

Jmeter의 경우 프로토콜을 정말 다양하게 지원하고, 플러그인도 있고, 분산 테스트도 수행할 수 있다고 한다.
GUI로 어느정도 테스트 계획을 수립할 수 있는 부분도 괜찮았다.
다만 위에서도 언급되었듯이 GUI은 언제까지나 `테스트 수립`에만 활용되어야하고 실제로 vUser가 많은 상황에서 테스트를 수행할때는 CLI에서 실행하는것을 권장한다는 부분에서 살짝 번거로움을 느꼈다.

![](/images/65c84a42-7e32-42e3-b3c6-7a7b33e4bfdf-image.png)

CLI 환경에서는 xml 기반의 문법을 가지고 다뤄야하기에 CLI 레벨에서 편집해야하는 환경이라면 가시성이 떨어질 수 있다고 생각한다.

![](/images/2869a168-aee5-41ec-998b-307d188d2924-image.png)

또한 [Jmeter에서 제공하는 Graph Result](https://jmeter.apache.org/usermanual/component_reference.html#Graph_Results)의 가시성이 개인적으로는 좀 불친절하게 다가왔다.

전체적으로 오픈소스인데다가 자료도 꽤 있고, 간편한 설치 방식은 마음에 들었으나 리스너 설정, 복잡한 시나리오 설정을 하는 데에는 러닝커브가 높아보였다.

## Gatling

Gatling은 성능테스트를 위한 오픈소스 도구다.

![](/images/1b2888af-b589-4d75-81c5-2db5bac78c20-image.png)

옛날에 봤을 때 유료였나? 싶었는데 지금 보니까 유로 플랜이 꽤나 인상적이였다.
Start for Free로 무료체험을 한번 해보자.

> https://gatling.io/

### How to use? (설치)

홈페이지에서 Start for Free를 눌러 회원가입을 할 수 있다.
일단 OAuth로 가입이 가능하여 구글로 가입을 했다.

![](/images/71b32759-bc5b-41a8-9870-ee3f4a0cd11a-image.png)

회원가입을 하면 30개의 Credit을 준다.
Cloud 환경이라서 별도의 설치가 필요없는것이 인상깊다.

![](/images/ea34498f-ae6d-47bf-8113-0f4d29cdf12b-image.png)

### How to use? (실행 - GUI)

우선 GUI를 이용해 간단한 테스트를 실행해볼 수 있다.
첫 가입이라고 `Build your simulation in-app`을 안내해준다.

![](/images/bf398328-7181-430d-8892-ed0d1de6fe1c-image.png)

Capacity, Soak, Stress 테스트에 대한 시나리오를 제공해준다. 아마 유료버전이면 더 다양한 시나리오를 제공해줄 것 같다.

![](/images/0865c18d-2b9e-4245-9442-10ad84ec559d-image.png)

무료버전이라 vUser가 10명으로 제한되는것 같다.

![](/images/b06de312-7cc4-4665-a1ec-e74d93385419-image.png)

Optional하게 지역이나 테스트 통과율 등을 설정할 수도 있다.

![](/images/ae0f7632-47bb-4178-a806-3d97d27089fd-image.png)

실행하면 이렇게 결과가 나온다. 

![](/images/21552a42-9b0e-40f8-8276-2835d17374fd-image.png)

Report 탭에서 보다 구체적인 수치값도 제공해준다. Github에다가 요청을 빠르게 여러번 보내면 403 에러가 나는 것 같다.

### How to use? (실행 - CLI)

![](/images/d8ad2f1e-c7b7-4770-8447-b360890c1e55-image.png)

홈페이지에서 로컬 dev 환경을 다운로드할 수 있다.
나는 java로 설치해봤다.

> https://gatling.io/products/download

IntelliJ를 이용하여 다운받은 프로젝트를 열면 Demo 테스트를 확인해볼 수 있다.

![](/images/81c31ca2-6c6e-4460-825d-31a0ad4def3f-image.png)

Java base로 코드를 제공하는데 사용법은 문서를 보고 익혀야할 것 같다.
생각보다 직관적이여서 익숙해지기만 한다면 잘 사용할 수 있을 것 같다.

> https://docs.gatling.io/tutorials/scripting-intro/

![](/images/31febf9d-326a-4bed-881c-0b120bb75c72-image.png)

주어진 예시코드를 기반으로 10개의 vUser가 Github에 Get요청을 10번 보내는 테스트를 작성해봤다.

![](/images/ae2ce44a-c17f-47ff-b9e2-955734017f0d-image.png)

IntelliJ에서 우측에 있는 Maven의 gatling:test 작업을 눌러서 실행했다.

> 터미널에서는 `./mvnw gatling:test` 를 실행하면 테스트를 구동할 수 있다.

![](/images/376d75de-9009-4b04-b4f5-56b6638cd7a4-image.png)

이렇게 결과화면이 나오고 결과 파일을 html로 출력해주기도한다.

![](/images/4829d70e-f5a8-4af1-9c92-eafdc3a01bac-image.png)

꽤나 예쁘게 시각화된 데이터를 제공해준다.

### 평가

![](/images/d6aea451-2712-429e-a129-4479be122c8b-image.png)

GUI만 사용해봤지만 설정도 간단하고, 결과도 상세하게 보여주고, 그래프도 예쁘고 좋았다.
하지만 GUI 기반으로 작성한 내용을 사용하고자 하는 환경에서는 무료플랜의 한계가 아쉬운 점으로 다가왔다. (테스트 30번, vUser 제한, 시나리오 제한)

CLI에서 Export 해주는 테스트 결과는 만족스러웠다.
테스트를 하면서 실시간으로 결과를 GUI를 통해 확인하지 못하는 부분은 조금 아쉽지만 결과물로만 봤을때는 나름 많은 지표를 보기 좋게 정리해주려는것이 좋았다.

간단한 문법 활용에도 큰 문제는 없었다. [공식문서](https://docs.gatling.io/reference/script/core/simulation/)에도 Java, Javascript, Kotlin, Scala로 문법과 예제가 제공되어있어 학습 곡선도 그렇게 커보이진 않았다.

## K6

K6는 Grafana에서 만든 성능테스트 도구로 Go 언어로 작성되어있으며, Javascript로 스크립트를 작성할 수 있는것이 특징이다.

### How to use (설치)

공식문서를 참고하여 K6를 설치해보자.

> https://grafana.com/docs/k6/latest/set-up/install-k6/

![](/images/aeca9e35-ce82-44b3-abe0-3f0d656521ef-image.png)

MacOS는 Homebrew를 사용해서 설치하기를 권장한다.

![](/images/9194f1fa-cc43-42fe-b6d4-c38d79cdf334-image.png)

Docker를 사용해서 설치하는 방식이 있어서 Docker를 이용해보자.

```shell
docker pull grafana/k6

# 테스트 결과를 확인하기 위한 도구
docker pull grafana/k6:master-with-browser
```

![](/images/61f3704f-0357-48d0-98b7-1ed3fb43cdc6-image.png)

```shell
docker run --rm -i -v $PWD:/app -w /app grafana/k6 new
```
이 명령어를 수행하면 기본 예제느낌으로 스크립트를 하나 만들어준다. 명령어를 수행하면 `script.js` 파일이 생성된다.

![](/images/fbbe8ed8-a0bb-4809-88d2-8416e6435f89-image.png)

문법은 javascript를 기반으로 가져가서 읽거나 작성하는데 큰 어려움은 없어보인다.
[공식문서](https://grafana.com/docs/k6/latest/using-k6/)도 잘 되어있어 문법을 익히는데 큰 문제는 없어보인다.

![](/images/7f094d9e-bb4d-445b-b1a3-4cc6d2f1cbb3-image.png)

간단하게 vUser 10명이 각자 정보를 1회 요청하는 테스트를 작성해봤다.

### How to use (실행)

스크립트를 작성했다면 아래 명령어로 스크립트를 실행하면 된다.

```shell
docker run --rm -i grafana/k6 run - <script.js
```

> 만약 로컬에 설치했다면 `k6 run script.js` 처럼 작성하여 동작할 수 있다.

![](/images/bd9138f6-f273-4b0e-9696-4b365908a477-image.png)

테스트가 끝나면 이렇게 결과가 나온다.
k6는 기본적으로 콘솔(stdout)로 결과를 출력한다.

> 스크립트에도 작성 가능하지만 실행 옵션으로 vus 옵션을 넣어서 vUser 수를 조정하고, duration 옵션을 넣어서 실행시간을 조정할 수도 있다.
> 
> 
```shell
$ docker run --rm -i grafana/k6 run --vus 10 --duration 30s - <script.js
```

기본적인 GUI를 제공하지 않아 콘솔 결과를 잘 보면 된다.

Grafana에서 만든 툴이다보니 테스트 결과를 Grafana를 이용하여 가시화 할 수도 있다.
만약 GUI로 결과를 확인하고 싶다면 Grafana를 이용할 수 있다.
결과를 확인해보기위해 Docker-compose로 환경을 빠르게 구성해보겠다.

```yaml
# docker-compose.yml 파일 내용
services:
  influxdb:
    image: influxdb:1.8
    container_name: influxdb
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_HTTP_AUTH_ENABLED=false
      - INFLUXDB_DB=k6
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_BASIC_ENABLED=false
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

위처럼 yml 파일을 작성했으면 아래 명령어로 실행한다.

```shell
# 실행하기
docker compose up -d
```

![](/images/cd119250-7d34-4a86-9362-4fd36b191ff8-image.png)

![](/images/e3a349d0-0b17-4257-b463-272eaee571b6-image.png)

실행 후 http://localhost:3000 으로 접근하면 Grafana 환경이 떠있는것을 볼 수 있다.

![](/images/ed7edb85-4dca-43a3-8858-795ac25fbc66-image.png)

Grafana에서 InfluxDB Connection을 추가해주자.

> 상단 검색 - Connections 검색 - influxdb 검색 후 접속 - Add new data source 선택
혹은 아래 링크 클릭
http://localhost:3000/connections/datasources/influxdb

![](/images/88f8f93f-5d7c-438e-8e49-ef727cec8213-image.png)

이렇게 설정해주고 Save & test를 하면 된다.
k6의 결과물을 저 InfluxDB에 넣고 Grafana Dashboard로 확인한다는 흐름으로 이해하면 된다.

![](/images/292dd252-a482-44fc-ae47-865122595b98-image.png)

이제 새로운 Dashboard를 만든다. 그라파나에서 제공하는 k6 결과를 보여주는 대시보드를 가져와보자.

![](/images/4ce98f49-b331-41f3-96d2-2c0de6d7bd54-image.png)

import에서 아래 주소를 입력하여 대시보드를 가져올 수 있다.

> https://grafana.com/grafana/dashboards/2587-k6-load-testing-results/

![](/images/d05a0f82-c59d-4553-8d29-275399f7abb9-image.png)

대시보드 생성을 완료했다면 k6를 실행해보자.

> docker를 사용하여 실행하기 때문에 동일한 docker network 환경으로 구성해줘야한다.
> `docker network ls` 명령어를 통해 monitoring이라는 이름을 가진 네트워크를 찾아서 복사해두자.
> 필자의 경우 `k6-test_monitoring` 이 된다.
> 
![](/images/7f36cdf0-0e65-43f2-a65f-4f642e8c50ec-image.png)

```shell
# k6-test_monitoring 부분 적절히 수정
docker run --rm -i --network=k6-test_monitoring grafana/k6 run --out influxdb=http://influxdb:8086/k6 - <script.js
```

![](/images/65231334-5a1e-4630-847e-9286adb53c58-image.png)

이렇게 실행하면 결과가 influxDB에 저장되어 Grafana에서 GUI로 테스트 결과 조회가 가능하다.

### 평가

테스트 스크립트를 js(혹은 ts)로 작성할 수 있어서 스크립트의 학습 곡선이 가장 낮다고 생각한다.
속도도 그렇게 느리지 않고 테스트 하면서 UX도 매끄럽게 진행됐다고 생각했다.
Grafana를 이용한 UI도 시각화가 나름 잘 되어있었다.

다만 Grafana를 사용하지 않는 환경이라면 GUI 결과를 보기 위해 Grafana와 InfluxDB를 도입해야한다는 점은 고려해볼만한 부분인 것 같다.
docker를 이용하여 간편하게 설정할 수 있지만 k6 결과 하나 보겠다고 불필요한 설정이 들어가는 것 같다.

## Postman

![](/images/0d53f75d-9390-4355-b2da-393bd635e429-image.png)

> https://learning.postman.com/docs/collections/performance-testing/performance-test-metrics/

로컬에서 API호출 테스트를해볼 때 사용하던 포스트맨에서도 성능테스트를 제공한다고 한다.
매우 친숙한 툴이라서 접근에 부담이 없지 않을까 싶어 정리해본다.

### How to use (설치)

![](/images/b3749e57-c597-49ce-b05b-d0360988084c-image.png)

Postman은 공식 홈페이지에서 설치해서 사용하면된다.

> https://www.postman.com/downloads/

### How to use (실행)

![](/images/16d6f560-5191-49be-ac38-1280c0d051f1-image.png)

Postman에서 New Runner Tab으로 Runner를 생성한다.

![](/images/dce2539c-069c-41d8-a3fe-401052c960c7-image.png)

기존에 만들어둔 요청을 Run order쪽에 Drag & Drop 하면 실행계획을 올릴 수 있다.
이후 우측에 `Performance > Set up your performance test`를 살펴보면 다음과 같이 몇가지 성능테스트를 손쉽게 구성할 수 있도록 도와준다.

![](/images/5bb21e74-cb16-4ccf-85fa-a803c94ce900-image.png)

간단하게 Fixed로 vUser 1명으로 10초 요청을 보내보겠다. (mins 단위로만 설정 가능하여 중간에 정지해줘야한다)

![](/images/f371068a-695c-414a-ac9c-2735852941e8-image.png)

테스트가 진행되는동안 실시간으로 그래프를 그려주면서 응답 결과를 보여준다.

![](/images/a3c904a7-9ddb-45f5-a3ae-e5a3677795b4-image.png)

요청이 끝나면 이렇게 결과를 보여준다.

### 평가

다른 성능테스트 도구에 비해서 제공하는 정보가 적어보이긴하지만 평균 응답시간과 같은 간단한 값만 사용할거라면 꽤나 유용하게 사용할 수 있어보인다.

무엇보다 Postman을 사용해본 경험이 있고, API 문서화를 Postman으로 수행했다면 좋은 통합 도구 기능으로써 사용할 수 있어보인다.

![](/images/84486b72-bbc8-4bbd-95f4-89999d9ced0e-image.png)

[공식문서](https://learning.postman.com/docs/collections/performance-testing/performance-test-configuration/)에 가이드가 친절하게 나와있어서 사용 경험도 좋았다. 내 컴퓨터 사양으로는 최대 250 vUser를 만들 수 있다고 가이드해주고있다.

![](/images/1101190c-9e47-46a2-a0ea-004f5db1efba-image.png)

![](/images/e1e435b2-1399-4ede-850e-0e288525c9eb-image.png)

다만 무료 버전으로는 테스트할 수 있는 횟수가 정해져있다고 하니 이점은 유의해야할 것 같다.

## nGrinder

네이버에서 만든 부하테스트 툴로 실제 요청을 보내는 Agent, Agent를 제어하는 Controller 두개를 띄워서 사용한다.

### How to use (설치)

로컬에 구성하려면  Controller를 깔고, Agent를 깔고 일일히 실행해야하지만 docker를 이용하면 아주 간단하게 설치해볼 수 있다.

```yaml
# docker-compose.yml 파일 내용
services:
  controller:
    image: ngrinder/controller
    restart: always
    ports:
      - "9000:80"
      - "16001:16001"
      - "12000-12009:12000-12009"
    volumes:
      - ./ngrinder-controller:/opt/ngrinder-controller
  agent:
    image: ngrinder/agent
    restart: always
    links:
      - controller
```
위처럼 docker-compose.yml 파일을 작성하고 명령어를 실행해주면 된다.

```shell
docker compose up -d
```

![](/images/b3a127d4-87a6-4e64-8fbb-bf942e1d17f4-image.png)

> 이미지가 amd64용 밖에 없어서 arm 호환에 문제가 있다고하지만 일단 돌아가긴한다.. 확인용으로~!
>
> 만약 http://localhost:9000 으로 접근했을 때 오류가 있다면 해당 컨테이너를 삭제하고 다시 실행해보면 된다!


### How to use (실행)

![](/images/87c8b39f-9038-4a77-8948-399c095b8de0-image.png)

위처럼 docker 구동이 잘 되었다면 아래 주소로 접근했을 때 창이 뜬다.
http://localhost:9000

기본적으로 id, password는 admin으로 구성되어있다.

![](/images/665743f0-1efb-475d-97dd-94ea0e19d463-image.png)

우측 상단에서 Agent Management 탭을 들어가보면 구동중인 Agent 목록을 보여준다.
Agent를 여러개 설정해서 분산 테스트를 수행할 수도 있다.

![](/images/3bb29a95-9b87-4f87-9e5d-d2c1f2a0fdcb-image.png)

테스트 시나리오를 작성하기 위해 스크립트를 생성할 수 있다.

![](/images/5898e8d4-31da-49b5-9806-b3925ae28525-image.png)

기본적으로 Groovy를 사용하고 Jython이라는 것도 지원한다.

![](/images/de79b3df-8ab2-451f-afaa-edc12304ed2b-image.png)

스크립트를 생성하면 그냥 실행해도 될정도의 뼈대코드를 제공해준다.

```java
	@Test
	public void test() {
		HTTPResponse response = request.GET("https://api.github.com/users/Choi-JJunho")
		assertThat(response.statusCode, is(200))
	}
```
test부분만 이렇게 변경하고 스크립트 작성을 마쳐본다.
Save/Close로 저장한 뒤 실행계획을 작성하러가보자.

![](/images/5b552160-c214-4ea2-a9e2-d486839c33b7-image.png)

performance Test 탭에서 실행계획을 작성할 수 있다

![](/images/b7fb7d40-a5d1-49bd-9405-4590b0e1c03b-image.png)

이렇게 실행 계획을 작성할 수 있다.
Script에서 방금 작성한 스크립트를 가져올 수 있다.

한가지 특이한 점은 vUser를 설정할 때 Process, Thread 비율을 직접 설정할 수 있다는 점이 눈에 띄는 것 같다.

Save and Start를 하면 테스트를 시작한다.

![](/images/1a3e89e4-3e02-41d2-8098-7bf3dcd1906a-image.png)

테스트가 완료되면 이렇게 결과 요약정보와 그래프를 보여준다.

![](/images/c0160338-5fde-494d-b782-8bba7f0e420e-image.png)

performance Test목록에서 그래프로 요약정보를 바로 볼 수도 있다.

> 너무 간단한 테스트라서 그래프가 안나오는데 조금 오래 부하를 가하면 이렇게도 나온다.
>
>![](/images/90bde625-c54b-49a9-9c06-585f5ffbea46-image.png)

### 평가

groovy 문법이 java와 유사해서 좋았지만 자체 제공하는 에디터가 없다는 점이 살짝 아쉽게 다가왔다.
찾아보니 [IntelliJ에서 사용할 수 있도록 설정하는 방법](https://goto-pangyo.tistory.com/275)이 있었다. 이 설정을 한다면 IDE에서 편집은 가능해보인다.
(그래도 Java 공식문서까지 제공하는 Gatling이 더 나은거 아닌가..)

네이버에서 만들었기 때문에 한글 가이드가 존재하지 않을까!? 라고 기대했으나 한글 가이드는 아쉽게도 [2022년에 사라졌다고 한다.](https://github.com/naver/ngrinder/issues/880)

![](/images/dfb0031d-9171-4ea8-bcd4-6a113ea7c857-image.png)

![](/images/96aace30-55a5-4b6d-820d-a866c3f4fd4e-image.png)

그래도 툴 자체에서 한글 지원이 된다 ~~한국인의 정~~

UI도 직관적이고, 설치도 간단했고, groovy라는 문법도 Java와 유사해서 나쁘지않은 경험이였다.

> Quick Start 문서도 꽤나 친절한 편이다.
https://github.com/naver/ngrinder/wiki/Quick-Start

# 결론

사실 얼마전 동아리 세미나에서 nGrinder를 사용하는거로 발표를 했었다
https://youtu.be/TZOMkEKTk9M

뭔가 발표내용에  모든 도구에 대한 핸즈온을 다루지 못해서 아쉬운 마음에 후속편 느낌으로 모조리 사용하고 후기를 남겨봤다.

각각의 장단이 있어서 무엇을 주로 사용할지는 생각을 좀 더 해봐야겠다.
아마 취향을 많이 타지 않을까 싶다

![](/images/65fe3887-b25a-495d-8c6f-ac35508c2c47-image.png)

막 깔고 안지웠더니 저장공간이 살짝 너덜너덜해지긴 했지만 값진 경험이였다.

다음에는 이번 시간에 알아본 도구들 중 하나를 선택해서 시나리오를 만들고 분석해보는 시간을 가져보려고한다.

> 어쩌다보니 `그래서 그거 00?` 느낌의 시리즈가 되어버렸다 ㅋㅋㅋㅋ

# Reference

- https://velog.io/@dongvelop/%EC%84%B1%EB%8A%A5%ED%85%8C%EC%8A%A4%ED%8A%B8-%ED%88%B4-%EC%86%8C%EA%B0%9C
- https://velog.io/@hooni_/K6-%EC%84%B1%EB%8A%A5-%ED%85%8C%EC%8A%A4%ED%8A%B8#k6-vs-jmeter