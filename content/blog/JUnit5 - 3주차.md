---
title: JUnit5 - 3주차
description: Docker를 이용한 테스트 적용방법을 알아보자.
date: 2022-07-30T12:53:13.674Z
tags:
  - JUnit5
  - Spring Boot
---
# 서론
이번주차는 Docker를 이용한 테스트 적용방법을 알아보자.

# TestContainers
Testcontainer를 사용하면스크립트, JDBC Config등의 설정없이도 테스트코드를 손쉽게 도커에 올릴 수 있다.
Production에 가까운 테스트를 만들 수 있지만 테스트가 느려진다는 단점도 존재한다.

## 설치

### dependency 추가

[이곳](https://mvnrepository.com/artifact/org.testcontainers/junit-jupiter)에서 최신버전의 testcontainer를 확인할 수 있다.
artifactId가 Junit-jupiter인 모듈을 잘 선택하자. 그래야 Junit5를 지원하는 `@Testcontainers`를 사용할 수 있다.
```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>1.17.3</version>
    <scope>test</scope>
</dependency>

```

[홈페이지](https://www.testcontainers.org/)를 가보면 
testcontainer에서 제공하는 모듈이 존재한다.
Modules > Databases > postgres Module을 사용해볼 것이다.
![](/images/e873505a-6144-4e70-bdaa-37bae4b78032-image.png)

### Annotation 설정

**@Testcontainers** : JUnit5 확장팩으로 테스트클레스에 @Container를 사용한 필드를 찾아 컨테이너 라이브사이클 관련 메서드를 실행해준다.

**@Container** : 인스턴스 필드에 사용하면 모든 테스트마다 컨테이너를 재시작하고, 스태틱필드에 사용하면 클래스 내무 모든 테스트에서 동일한 컨테이너 사용.

```java
@Testcontainers
class StudyServiceTest {
...
@Container
static PostgreSQLContainer postgreSQLContainer = new PostgreSQLContainer()
...
}
```
위와 같은 방식으로 Postgres DB를 Container로 만들어서 사용할 수 있다.
이 상태로 테스트를 실행할 경우 알 수 없는 포트로 컨테이너가 뜨기 때문에 DB에 연결 할 수가 없다.

### JDBC URL, 기타 설정

해결방식은 [공식문서](https://www.testcontainers.org/modules/databases/)에 친절하게 나와있다.

해당 내용을 간략하게 요약하면 
```
spring.datasource.url=jdbc:tc:postgresql:///studytest
```
위 방식으로 properties에 JDBC url을 설정하면 테스트 컨테이너로 자동으로 매핑되어 DB에 연결할 수 있다. host와 버전 등은 생략가능하다.

container를 생성할 때 db이름도 지정할 수 있다.
```java
@Container
static PostgreSQLContainer postgreSQLContainer = new PostgreSQLContainer()
        .withDatabaseName("studytest");
```
이떄 testcontainer에서 제공하는 드라이버도 함께 사용해야한다.
```
spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver
```

static으로 container를 생성했다면 매 테스트마다 초기화를 진행해줘야 한다. 이를 해결하기 위해 다음과 같이 설정할 수 있다.
```java
@BeforeEach
void beforeEach() {
    studyRepository.deleteAll();
}
```

# Testcontainers 기능
## 컨테이너 생성
외부 컨테이너를 직접 생성할 수 있다.
```java
static GenericContainer example = new GenericContainer("도커 이미지명")
    .withExposedPorts(5432) // 5432포트로 expose. 내부 포트는 랜덤
    .withEnv("POSTGRES_DB", "studytest") // 환경변수를 통한 db명 설정
    ...
example.getMappedPort(5432); // 도커 내부에서 매핑되는 포트를 확인할 수 있다.
```

## 네트워크
도커가 외부와 접속하는 port를 설정할 수 있으며, 도커 내부에서 매핑되는 포트를 확인할 수 있다.
- withExposedPorts(int)
- getMappedPort(int)
 
## 환경변수
실제 컨테이너를 사용할 때 환경변수를 설정할 수 있다.
- withEnv(key, value)

## 명령어

명령어를 실행할 수도 있다.
- withCommand(String)
```java
public GenericContainer redisWithCustomPort = new GenericContainer(DockerImageName.parse("redis:5.0"))
    .withCommand("redis-server --port 7777")
```


## 준비 확인
아래 wait를 사용하면 특정 조건을 만족할 때 까지 테스트를 실행하지 않는다.
- waitingFor(Wait)
- Wait.forHttp(String url)
- Wait.forLogMessage(String message)

## 로그 확인
테스트를 실행할 때 컨테이너 내부에 출력되는 로그를 볼 수 있다.
- followOutput()

혹은 모든 로그를 가져올 수 있다.
- getLogs()

로그 확인은 다음과 같이 활용할 수 있다.
```java
@BeforeAll
static void beforeAll() {
    Slf4jLogConsumer logConsumer = new Slf4jLogConsumer(log);
    postgreSQLContainer.followOutput(logConsumer);
}
```

# 컨테이너 정보를 스프링 테스트에서 참조

컨테이너 내부에 있는 정보를 스프링 자체에서 접근하여 활용할 수 있다.

1. Testcontainer를 사용해서 컨테이너 생성
```java
@Container
static GenericContainer postgreSQLContainer = new GenericContainer("postgres")
        .withExposedPorts(5432)
        .withEnv("POSTGRES_DB", "studytest");
```

2. ApplicationContextInitializer를 구현하여 생성된 컨테이너에 정보를 추출하여 Environment에 저장
```java
static class ContainerPropertyInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext context) {
        TestPropertyValues.of("container.port=" + postgreSQLContainer.getMappedPort(5432))
                .applyTo(context.getEnvironment());
    }
}
```


3. @ContextConfiguration을 사용해 ApplicationContextInitailizer 구현체를 등록
```java
@ContextConfiguration(initializers = StudyServiceTest.ContainerPropertyInitializer.class)
class StudyServiceTest { .. .}
```

4. 테스트코드에서 Environment, @Value, @ConfigurationProperties등 다양한 방법으로 해당 프로퍼티 사용 가능!
```java
@Value("${container.port}") int port;
```

다음은 위에서 사용한 스프링 설정에 대한 내용들이다 

> `@ContextConfiguration`
: 스프링이 제공하는 어노테이션으로, 스프링 테스트 컨텍스트가 사용할 설정파일 또는 컨텍스트를 커스터마이징할 수 있는 방법을 제공한다.

> `ApplicationContextInitializer`
: 스프링 ApplicationContext를 프로그래밍으로 초기화 할 때 사용할 수 있는 콜백 인터페이스. 특정 프로파일 활성화 및 프로퍼티 소스추그 등을 수행.

> `TestPropertyValues`
: 테스트용 프로퍼티 소스 정의

> `Environment`
: 스프링 핵심 API로 프로퍼티와 프로파일 담당.


# Docker Compose를 이용하기

TestContainer에서 제공하는 [DockerCompose Module](https://www.testcontainers.org/modules/docker_compose/)을 이용해 DockerCompose를 사용할 수 있다.

```yml
# docker-compose.yml
version: "3"

services:
  study-db:
    image: postgres
    ports:
      - 5432
    environment:
      POSTGRES_PASSWORD: study
      POSTGRES_USER: study
      POSTGRES_DB: study

```

```java
...
@Container
static DockerComposeContainer composeContainer =
        new DockerComposeContainer(new File("src/test/resources/docker-compose.yml"))
        .withExposedService("study-db", 5432);
...
```

## 포트설정 관련
![](/images/7347fde6-5045-48ea-b547-e4cc613f5618-image.png)
위와 같이 프로젝트 최상단에 위치하는 docker-compose 파일`(어플리케이션 관련 설정)`과 test/resource 경로 내에 위치하는 파일`(테스트 관련 설정)`에는 한가지 차이가 있다.
```yml
# 
version: "3"

services:
  study-db:
    image: postgres
    ports:
      - 5432:5432
  # to Test
  # ports:
   #  - 5432 
    environment:
      POSTGRES_PASSWORD: study
      POSTGRES_USER: study
      POSTGRES_DB: study
```
port 부분을 확인하면 host의 5432포트가 컨테이너 내부의 5432포트와 연결된다는 것을 명시하고있다.

하지만 테스트에서는 포트를 지정하는것이 조금 다르다.
위에서 설명했듯이 테스트 환경에서는 도커가 컨테이너를 생성할 때 포트 충돌을 최소화하기위해 가용한 포트 번호중 랜덤하게 생성한다.

이 때문에 test에 설정파일을 지정할 때 host부분만 명시하고 container 부분의 포트는 생략하는 것이 옳다.

> 이번장은 기본적으로 도커와 함께 사용하는 방법에 대한 내용이 주가 되었다.
이참에 도커에 대해 다시한번 정리해보는 시간을 가져보는것이 좋을 것 같다.
~~Docker 정리글 작성중 😂~~

# Reference
https://www.testcontainers.org/
[더 자바, 애플리케이션을 테스트하는 다양한 방법_백기선](https://www.inflearn.com/course/the-java-application-test)
