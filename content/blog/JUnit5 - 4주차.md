---
title: JUnit5 - 4주차
description: JMeter를 사용하는 방법에 대해 알아보자.
date: 2022-08-07T03:07:41.809Z
tags:
  - JUnit5
  - 성능 테스트
---
# 서론
이번주차는 JMeter를 사용하는 방법에 대해 알아보자.

# JMeter
성능측정 및 부하 테스트 기능을 제공하는 오픈소스 애플리케이션이다.

다양한 형태의 테스트를 지원한다.
- 웹 - HTTP, HTTPS
- SOAP / REST 웹 서비스
- FTP
- 데이터베이스(JDBC 사용)
- Mail(SMTP, POP3, IMAP)
등등

CLI 지원
- CI/CD 툴과 연동 가능
- UI를 사용하는 것보다 메모리 등 시스템 리소스를 적게 사용한다.

주요 개념
- Thread Group : 한 쓰레드 당 유저 한명
- Sampler : 어떤 유저가 해야하는 액션
- Listener : 응답을 받았을 할 일 (리포팅, 검증, 그래프그리기 등)
- Configuration : Sampler Listenr가 사용할 설정 값 (Cookie, JDBC Connection 등)
- Assertion : 응답이 성공적인지 확인.

테스트 성능측정을 위한 오픈소스로 [Gatling](https://gatling.io/), [NGrinder](https://naver.github.io/ngrinder/)등의 애플리케이션이 존재한다.

## 설치

JMeter를 다운로드받는다.
[홈페이지](https://jmeter.apache.org/download_jmeter.cgi)에서 다운로드 받을 수 있다.

![](/images/d0682a82-4cee-4694-8014-a1a99f9cf9fb-image.png)

압축파일을 해제하면 bin 디렉토리 아래 실행할 수 있는 파일이 있다.
![](/images/e1dd25db-1152-45f5-b130-cfce3d31070b-image.png)

실행화면
![](/images/f1585cb6-e5c8-4bea-80bf-e7fe8b652944-image.png)

## 실행
실행 시 주의할 점이 있다.
운영용 애플리케이션이 구동되는 서버에서 JMeter를 돌리면 리소스를 애플리케이션과 JMeter가 같이 먹기 때문에 제대로된 성능테스트를 진행할 수 없다.
때문에 성능테스트를 진행할 때는 다른 환경에서 진행해야한다.

1. 새로운 테스트 플랜은 만들고 저장한다.
![](/images/768022f9-f94f-4cde-8ddc-83c5e609964a-image.png)

2. Thread Group을 추가한다.
![](/images/ff0a08eb-8921-45e6-a541-18b8e07665bb-image.png)

> Thread Group에서 다음과 같은 설정이 있다.
- Number of Therads : 쓰레드의 개수(유저의 개수)를 설정
- Ramp-up period : 쓰레드(유저)를 몇초안에 만들것인지.
- Loop Count : 요청 반복횟수
![](/images/27f5caca-3923-428b-af55-1763580e57ba-image.png)

3. 이제 유저가 수행할 동작인 Sampler를 만든다.
![](/images/0119140a-51cb-4412-a119-bf86069ad4bd-image.png)

4. 수행 결과를 확인할 Listener를 만든다.
![](/images/81803746-382b-4786-aa0d-da1c01f1cf8e-image.png)

애플리케이션이 구동된 상태로 JMeter를 실행하면 다음과 같이 Listener에 결과가 나온다.
![](/images/dc472b83-ea20-4c21-b9ff-f36f8bdcf6ad-image.png)

> 한가지 특이한점을 확인하면 첫번째 요청이 오래걸린다.
이는 서블릿 인스턴스가 처음 만들어지면서 시간이 오래걸린다.

- Assertion 설정
![](/images/a0c0370e-e3a8-4d31-9a9a-7d4e336cc746-image.png)

> 성공하는 경우
![](/images/a52ae09b-cc47-4a98-80a1-6e96eb23da4c-image.png)
![](/images/e56fc06f-3a82-41fc-bea0-0f6832628f44-image.png)

> 실패하는 경우
![](/images/a6f7304e-1b8d-4eee-b28e-8ff6c14d1da9-image.png)
![](/images/bee2ac66-e457-4288-9aed-b581dc2e5cb2-image.png)

## CLI에서 실행하기
위에서 만든 파일을 대상으로 JMeter에 옵션을 주고 CLI로 실행할 수 있다.
![](/images/0785e823-210a-4929-b064-e65514b30599-image.png)

``` shell
// -n : UI를 사용하지 않음
// -t : JMeter에 대한 설정 (위에서 만든 파일)

./jmeter -n -t ./Study\ Perf\ Test.jmx 
```
![](/images/68f6bec2-8073-4c47-87fa-dcc90aedcd1e-image.png)

> BlazeMeter와 같은 Chrome App으로 클릭에 대한 이벤트를 녹화하여 JMeter 파일로 만드는 것도 가능하다.


# Reference
[더 자바, 애플리케이션을 테스트하는 다양한 방법_백기선](https://www.inflearn.com/course/the-java-application-test)
