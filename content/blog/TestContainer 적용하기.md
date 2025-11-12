---
title: TestContainer 적용하기
description: TestContainer를 적용해봅니다.
date: 2023-12-12T08:45:16.904Z
tags:
  - BCSDLab
  - KOIN
  - Spring Boot
  - TestContainer
  - 백엔드
---
# 서론

로그인을 구현하는 과정에서 문제를 맞이했다.

현재 koin 마이그레이션은 인수테스트를 작성하고 기능을 구현하는 방식으로 진행하고있다.
인수테스트를 작성하는 과정에서 몇가지 문제점을 맞이했다.

> 본 글은 해결 과정을 담고있으므로 완성된 코드를 참고하고싶다면 글의 최하단 부분을 참고해주세요!

# 문제점

현재 로그인은 다음과 같은 흐름으로 구현되어있다.

- JWT를 활용한다.
- 로그인 수행 시 accessToken, refreshToken을 발급한다.
- refreshToken을 Redis에 저장해둔다. (유효기간이 정해져있다. 약 1달)
- 추후 로그아웃을 수행 시 refreshToken을 만료시켜야한다.

위와같은 흐름으로 구현되어있기도하고 인프라환경을 동일하게 가져간다는 특징 때문에 로그인 수행 시 Redis를 이용하는 상황이 왔다.

테스트 수행 시 Redis에 값을 어떻게 저장해야할지가 고민이였다.
RDB의 경우 MySQL 대신 h2를 사용하고있지만 Redis는 어떻게 테스트해야할지 고민이 들었다.

이에 여러 정보를 찾아봤다.

## Local DB 사용하기

가장 간단하고 쉬운 방법이지만 협업하는 모든 개발자의 환경에 동일한 DB 환경을 구성해야한다는 문제가 있다.

게다가 실제 DB를 사용하는만큼 사용중인 DB의 다른 데이터를 건드릴 수 있다는 문제가 있다.

## Embedded Library

Redis를 컨텍스트에 띄워서 구동시키는 Embedded Library를 활용하는 방법이 있다.

- 여러 컨텍스트에서 테스트를 수행하면 Embedded Redis가 이미 구동중인 상황에서 포트 충돌이 발생한다.
  - 미사용중인 포트를 찾아 할당하는 해결방법이 있긴하지만 다소 번거로운 방법이라 생각되어 다른 방법을 더 찾아보기로 했다.
- M1에서 구동하기 위한 추가 조치가 필요하다.
  - 간혹 OS에 대한 지원 문제도 있다고한다. [참고 블로그](https://da-nyee.github.io/posts/how-to-use-embedded-redis-on-m1-arm/)
- 관련 라이브러리 마지막 업데이트가 2020년이라는 부분도 다양한 기능 지원측면에서 아쉬움을 느낄 것이라고 생각된다.
  - https://github.com/ozimov/embedded-redis
  - ![](/images/8a2942ec-3503-487e-bfa0-43691d6b3d38-image.png)

무작정 적용해볼 수도 있겠지만 협업과정에서 새로운 기술스택을 도입하는 만큼 신중을 가할 필요가 있다고 생각하여 조금 더 찾아보려고 한다.

## TestContainer

지금은 Spring Data JPA를 사용중이라 다양한 DB Dialect를 지원해주고 있다.
간단한 조회로직만 있는 지금의 상황에서는 아직 겪지 못했던 문제지만 추후 Native Query가 필요한 상황이 온다면 MySQL 문법으로 작성한 쿼리를 H2로 처리하지 못하는 상황도 분명히 올 것이다.

실제 환경과 유사한 환경으로 테스트를 구동하는 방법을 찾아보니 Docker를 이용하는 방법이 있었다.
이 방법은 docker-compose 파일을 관리해야한다는 귀찮음이 존재했다.

보다 간편한 방법으로 TestContainer를 찾아볼 수 있었다.

> TestContainer는 도커 컨테이너로 래핑된 실제 서비스를 제공해서, 로컬 테스트 시에도 mocking이나 in-memory 서비스들을 사용하지 않고 운영환경에서 사용하는 실제 서비스에 종속되는 테스트를 작성할 수 있게 해주는 오픈 소스 라이브러리이다.
[TestContainer - 홈페이지](https://testcontainers.com/)

외부 API를 Mocking해야하는 상황에서는 testContainer가 컨테이너를 제공한다고 한다.
Koin에서도 S3, Slack, 공공데이터 API 등을 활용중이라 차후 해당 API를 테스트하는 과정에서도 굉장히 유용할 것이라고 여겨진다.

> https://testcontainers.com/getting-started/
> 
> ![](/images/16675f2d-38c4-4e20-99dd-0e640864f5ae-image.png)

실제로 Redis에 대한 코드를 작성하기 전에 TestContainer로 테스트를 구동하는 환경을 갖춰놓도록 하자.

# TestContainer 적용하기

이제 TestContainer를 적용해보자.

> 공식문서에 꽤나 설명이 잘 되어있어 해당 문서를 보고 적용해도 문제 없을 정도다.
https://java.testcontainers.org/

간단한 예시로 BCSDLab 트랙정보를 조회하는 인수테스트를 testContainer를 사용하도록 변경해보자.

해당 테스트는 RestAssured를 사용하는 E2E 테스트 환경이다.

## 시작하기

> 🐳 testContainer를 사용하기에 앞서 로컬에서 docker를 실행중이여야합니다! 🐳
>
> ![](/images/d4adc721-8851-4f40-9a1f-972b2d899a42-image.png)


우선 testcontainer를 사용하기 위해 의존성을 추가해준다.

```gradle
testImplementation 'org.testcontainers:testcontainers:1.19.3'
testImplementation 'org.testcontainers:junit-jupiter:1.19.3' // junit5를 이용한 확장을 위해 추가
testImplementation 'org.testcontainers:mysql' // MySQL 사용을 위해 추가
```

테스트코드에 다음과 같이 MySQLContainer를 선언하고 BeforeEach, AfterEach로 컨테이너를 start, stop 해주는 코드를 추가했다.

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@DirtiesContext(classMode = BEFORE_EACH_TEST_METHOD)
class TrackApiTest {

    @LocalServerPort
    int port;

    // ...

    private MySQLContainer mySQLContainer = new MySQLContainer("mysql:8");

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        mySQLContainer.start();
    }

    @AfterEach
    void tearDown() {
        mySQLContainer.stop();
    }

    @Test
    @DisplayName("BCSDLab 트랙 정보를 조회한다")
    void findTracks() {
      // ...
    }
    
    @Test
    @DisplayName("BCSDLab 트랙 정보 단건 조회")
    void findTrack() {
      // ...
    }
}
```

이 상태로 테스트를 구동해보면 다음과 같이 docker container가 구동하는 모습을 볼 수 있다.

![](/images/bd8d0ca4-b35e-46d6-9b83-2f3b68d78dac-image.png)

![](/images/67344e7d-a0eb-4343-9bda-b885c8e51c87-image.png)

### @TestContainers, @Container

매번 @BeforeEach, @AfterEach에 선언해주기는 좀 귀찮다.
testContainer에서는 편의를 위해 @TestContainer, @Container 어노테이션을 제공한다.

@TestContainer의 내부 어노테이션중 `TestcontainersExtension`을 확인해보면 JUnit5의 LifeCycle을 오버라이딩하여 컨테이너를 관리하는 것을 확인할 수 있다.

```java

@Testcontainers
class TrackApiTest {
  // ...
   
    @Container
    private MySQLContainer mySQLContainer = new MySQLContainer("mysql:8");
    
    // ...
   
   	@Test
    @DisplayName("BCSDLab 트랙 정보를 조회한다")
    void findTracks() {
      // ...
    }
    
    @Test
    @DisplayName("BCSDLab 트랙 정보 단건 조회")
    void findTrack() {
      // ...
    }
```

### 테스트 속도 개선

다 좋은데 한가지 문제가있다.

매 테스트마다 컨테이너를 새로 띄우는바람에 테스트 속도가 매우 느려졌다.

겨우 3개 실행하는데 30초가 걸리는 것이 바람직한 상황은 아니라고 느껴진다.
예전에 정리했던 [테스트별로 DB 초기화하기](https://velog.io/@junho5336/%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%B3%84%EB%A1%9C-DB-%EC%B4%88%EA%B8%B0%ED%99%94%ED%95%98%EA%B8%B0) 글에서 마주했던 DirtiesContext의 문제점과 유사한 상황이라고 여겨진다.

![](/images/fbe0c2fc-db97-42a6-babe-f7734b8ef136-image.png)

컨테이너를 단 한번만 띄우고 재사용하도록 개선해보자.
개선 후 3초정도로 약 10배 가량의 속도 개선을 이룰 수 있었다. 👍

![](/images/33ea86a7-ad69-4db0-9d46-60a162fa5d04-image.png)

### 테스트 격리

테스트 격리를 위해 DirtiesContext를 사용하고 있어 컨텍스트를 다시 띄우는 비용이 들고있다.
DB를 turncate를 수행하는 방식으로 변경해보려고한다.

해당 방식을 적용하기 위해 아래 블로그를 참고해서 적용했다.
[참고 블로그 - 테스트 컨테이너를 사용하는 이유 + 테스트 격리](https://kong-dev.tistory.com/248)

```java

@TestComponent
public class DBInitializer {

    private static final int OFF = 0;
    private static final int ON = 1;
    private static final int COLUMN_INDEX = 1;

    private final List<String> tableNames = new ArrayList<>();

    @Autowired
    private DataSource dataSource;

    @PersistenceContext
    private EntityManager entityManager;

    private void findDatabaseTableNames() {
        try (final Statement statement = dataSource.getConnection().createStatement()) {
            ResultSet resultSet = statement.executeQuery("SHOW TABLES");
            while (resultSet.next()) {
                final String tableName = resultSet.getString(COLUMN_INDEX);
                tableNames.add(tableName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void truncate() {
        setForeignKeyCheck(OFF);
        for (String tableName : tableNames) {
            entityManager.createNativeQuery(String.format("TRUNCATE TABLE %s", tableName)).executeUpdate();
        }
        setForeignKeyCheck(ON);
    }

    private void setForeignKeyCheck(int mode) {
        entityManager.createNativeQuery(String.format("SET FOREIGN_KEY_CHECKS = %d", mode)).executeUpdate();
    }

    @Transactional
    public void clear() {
        if (tableNames.isEmpty()) {
            findDatabaseTableNames();
        }
        entityManager.clear();
        truncate();
    }
}
```

> 해당 방식의 다른 응용 방식은 다음 글을 확인하도록 하자.
[테스트별로 DB 초기화하기](https://velog.io/@junho5336/%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%B3%84%EB%A1%9C-DB-%EC%B4%88%EA%B8%B0%ED%99%94%ED%95%98%EA%B8%B0)

> Dirties Context 사용 시
![](/images/2150858e-c6a1-4bd4-b489-9fe93f94bce8-image.png)

> DB 초기화 방식 사용 시
![](/images/e4143dbc-047e-43e6-b9e3-6abd6f765021-image.png)

컨텍스트 생성비용을 줄임으로써 테스트 수행시간을 `5~600ms` 에서 `250ms` 정도로 개선할 수 있었다.

### JPA에 Datasource 주입

JPA에 컨테이너로 뜬 MySQL에 대한 DataSource를 주입해줘야한다.
yml 파일에 간단하게 testContaine의 properties를 설정하여 사용할 수 있지만 `@DynamicPropertySource`를 적용해볼 수  있다.

> `@DynamicPropertySource`는 Spring 5.2.5부터 지원하는 기능으로 동적으로 속성을 관리하는 기능이다.
구체적인 내용은 Baeldung 문서를 확인하도록 하자.
[Guide to @DynamicPropertySource in Spring](https://www.baeldung.com/spring-dynamicpropertysource)

다음과 같이 abstract class로 분리하고 DynamicPropertySource까지 적용할 수 있다.

```java
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Import(DBInitializer.class)
public abstract class AcceptanceTest {

    private static final String ROOT = "test";
    private static final String ROOT_PASSWORD = "1234";

    @LocalServerPort
    protected int port;

    @Autowired
    private DBInitializer dataInitializer;

    @Container
    protected static MySQLContainer container;

    @DynamicPropertySource
    private static void configureProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", container::getJdbcUrl);
        registry.add("spring.datasource.username", () -> ROOT);
        registry.add("spring.datasource.password", () -> ROOT_PASSWORD);
    }

    static {
        container = new MySQLContainer("mysql:8")
            .withDatabaseName("test")
            .withUsername(ROOT)
            .withPassword(ROOT_PASSWORD);
        container.start();
    }

    @BeforeEach
    void delete() {
        dataInitializer.clear();
        RestAssured.port = port;
    }
}

```

기존에는 h2 DB를 사용중인 모습을 확인할 수 있다.

![](/images/3d8ea718-8434-4ebe-998b-3783f269e93d-image.png)

DynamicPropertySource를 적용하고 난 뒤에는 h2가 아닌 mysql을 정상적으로 사용하는 모습을 확인할 수 있었다.

![](/images/34b1e06b-6378-47ee-a882-7fd02d229900-image.png)

# 정리

TestContainer를 이용하여 docker container 환경에서 테스트를 수행하도록 환경을 구성해봤다.
실제 운영환경과 유사한 환경으로 테스트를 수행할 수 있어 신뢰도가 높아졌다는 부분과 mysql과 h2의 dialect 차이에 대한 신경을 쓰면서 생기는 불필요한 소요가 사라졌다는 부분이 가장 인상적이였다.

## 결과물

실제로 작성한 코드에 대한 정리다.

### 패키지

패키지 구조는 다음과 같이 구성되었다.

![](/images/bdf75bd2-dce9-4ab5-afe2-327aef2a7c70-image.png)

### 코드

`TrackApiTest.class`

```java
class TrackApiTest extends AcceptanceTest {
  // ...
}
```

`AcceptanceTest.class`

```java
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Import(DBInitializer.class)
public abstract class AcceptanceTest {

    private static final String ROOT = "test";
    private static final String ROOT_PASSWORD = "1234";

    @LocalServerPort
    protected int port;

    @Autowired
    private DBInitializer dataInitializer;

    @Container
    protected static MySQLContainer container;

    @DynamicPropertySource
    private static void configureProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", container::getJdbcUrl);
        registry.add("spring.datasource.username", () -> ROOT);
        registry.add("spring.datasource.password", () -> ROOT_PASSWORD);
    }

    static {
        container = new MySQLContainer("mysql:8")
            .withDatabaseName("test")
            .withUsername(ROOT)
            .withPassword(ROOT_PASSWORD);
        container.start();
    }

    @BeforeEach
    void delete() {
        dataInitializer.clear();
        RestAssured.port = port;
    }
}
```

`DBInitializer.class`

```java
// SpringBootApplication 구동 시 ComponentScan의 대상으로 지정되지 않도록 TestComponent로 선언함.
@TestComponent
public class DBInitializer {

    private static final int OFF = 0;
    private static final int ON = 1;
    private static final int COLUMN_INDEX = 1;

    private final List<String> tableNames = new ArrayList<>();

    @Autowired
    private DataSource dataSource;

    @PersistenceContext
    private EntityManager entityManager;

    private void findDatabaseTableNames() {
        try (final Statement statement = dataSource.getConnection().createStatement()) {
            ResultSet resultSet = statement.executeQuery("SHOW TABLES");
            while (resultSet.next()) {
                final String tableName = resultSet.getString(COLUMN_INDEX);
                tableNames.add(tableName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void truncate() {
        setForeignKeyCheck(OFF);
        for (String tableName : tableNames) {
            entityManager.createNativeQuery(String.format("TRUNCATE TABLE %s", tableName)).executeUpdate();
        }
        setForeignKeyCheck(ON);
    }

    private void setForeignKeyCheck(int mode) {
        entityManager.createNativeQuery(String.format("SET FOREIGN_KEY_CHECKS = %d", mode)).executeUpdate();
    }

    @Transactional
    public void clear() {
        if (tableNames.isEmpty()) {
            findDatabaseTableNames();
        }
        entityManager.clear();
        truncate();
    }
}
```

# 후기

우테코하면서 TestContainer를 적용한 팀들이 많았었다. 하지만 우리팀은 크게 필요성을 느끼지 못해 적용을 안했었는데 이렇게 필요한 상황이 오고 적용을 하니 체화가 좀더 잘 되는 것 같다.

이제 겪었던 어려움과 해결 과정을 팀원들에게 잘 전파해봐야겠다.

> 작업 내용
https://github.com/BCSDLab/KOIN_API_V2/pull/27

# Reference

- https://www.baeldung.com/spring-embedded-redis
- https://jojoldu.tistory.com/297
- https://medium.com/riiid-teamblog-kr/testcontainer-%EB%A1%9C-%EB%A9%B1%EB%93%B1%EC%84%B1%EC%9E%88%EB%8A%94-integration-test-%ED%99%98%EA%B2%BD-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0-4a6287551a31
- https://tecoble.techcourse.co.kr/post/2023-11-06-testcontainers/
- https://www.baeldung.com/spring-dynamicpropertysource
