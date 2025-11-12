---
title: '@JDBCTest'
description: '@JdbcTest는 왜 사용할까?'
date: 2023-04-16T04:35:12.316Z
tags:
  - Spring Boot
  - 테스트
---
# 서론

우테코에서 Spring 학습 테스트를 진행하다가 `@SpringBootTest`를 볼 수 있었다.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class UpdatingDaoTest {
    @Autowired
    private UpdatingDAO updatingDAO;
    @Autowired
    private QueryingDAO queryingDAO;
    @Autowired
    private JdbcTemplate jdbcTemplate;
    ...
}
```

다른 테스트에는 `@JDBCTest`라는 어노테이션도 존재했다.

```java
@JdbcTest
public class NamedParamTest {
    private NamedParamDAO namedParamDAO;

    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	...
}
```

문득 호기심이 생겼다.
`@SpringBootTest`를 `@JdbcTest`로 바꾸면 동작하지 않을까?

# 문제상황

예측하건데 두 테스트 모두 `@Autowired`를 통해 Bean을 주입하고 있다.
차이점은 DBConnection과 관련된 부분만 존재하는것이 아닐까? 라는 생각이 들었다.

위에서 `@SpringBootTest`로 작성된 코드를 `@JdbcTest`로 바꿔보았다.

```java
@JdbcTest
public class UpdatingDaoTest {
    @Autowired
    private UpdatingDAO updatingDAO;
    @Autowired
    private QueryingDAO queryingDAO;
    @Autowired
    private JdbcTemplate jdbcTemplate;
	...
}
```

테스트를 실행해보니 다음과 같은 에러가 발생했다.

```java
Error creating bean with name 'nextstep.helloworld.jdbc.jdbctemplate.UpdatingDaoTest': Unsatisfied dependency expressed through field 'updatingDAO'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'nextstep.helloworld.jdbc.jdbctemplate.UpdatingDAO' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'nextstep.helloworld.jdbc.jdbctemplate.UpdatingDaoTest': Unsatisfied dependency expressed through field 'updatingDAO'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'nextstep.helloworld.jdbc.jdbctemplate.UpdatingDAO' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}

...

Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'nextstep.helloworld.jdbc.jdbctemplate.UpdatingDAO' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```
주의깊게 볼 만한 내용으로는 `UnsatisfiedDependencyException`, `NoSuchBeanDefinitionException`이 발생했다는 부분이다.

에러메시지로 볼 수 있는 내용으로는 UpdatingDaoTest를 수행하는 과정에서 UpdatingDAO가 Bean으로 등록되지 않아 에러가 발생했다고 유추해볼 수 있겠다.

# JdbcTest의 Bean 등록?

다음과 같은 과정을 통해 JdbcTest의 Bean 등록과정을 알아보고 싶어졌다.

1. 테스트 코드는 손도 안대고 상단의 `@SpringBootTest`를 `@JdbcTest`로 바꾸기만 했다. 
2. Bean 등록과 관련한 오류가 발생했다.
3. `@SpringBootTest`를 `@JdbcTest`이 Bean을 등록하는 과정이서 차이가 있을것이다.

## 공식문서 살펴보기

[공식문서](https://docs.spring.io/spring-boot/docs/2.6.6/api/org/springframework/boot/test/autoconfigure/jdbc/JdbcTest.html)를 참고해서 살펴보자.

>Annotation for a JDBC test that focuses only on JDBC-based components.
Using this annotation will disable full auto-configuration and instead apply only configuration relevant to JDBC tests.
By default, tests annotated with @JdbcTest are transactional and roll back at the end of each test. They also use an embedded in-memory database (replacing any explicit or usually auto-configured DataSource). The @AutoConfigureTestDatabase annotation can be used to override these settings.
If you are looking to load your full application configuration, but use an embedded database, you should consider @SpringBootTest combined with @AutoConfigureTestDatabase rather than this annotation.
When using JUnit 4, this annotation should be used in combination with @RunWith(SpringRunner.class).

요약하자면 `@JdbcTest`를 사용하면 Jdbc 테스트와 관련된 설정만 적용된다고 한다.

큰 특징은 다음과 같다.

- 모든 스프링 Bean을 등록하지 않고 Jdbc와 관련된 Bean만 등록한다.
  - 예를들면 DataSource가 있다.
- In-memory DB를 사용한다.
- 모든 테스트는 각각의 트랜잭션으로 적용되며, 각 테스트가 종료될 때 마다 RollBack한다.

만약 내장형 DB를 사용하여 테스트하고자 한다면 @SpringBootTest를 고려하는 것이 좋다고 한다.

## DataSource

그렇다면 Spring DataSource는 무엇이길래 자동으로 등록될까?

스프링 부트는 기본적으로 DB URL이 명시되어 있으면 해당 URL로 Connection을 연결하고, URL이 명시되어 있지 않다면 내장 데이터베이스를 생성한다.

> 더 자세한 내용은 [참고자료](https://velog.io/@ohzzi/Spring-Boot%EA%B0%80-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EB%A5%BC-%EC%9D%BD%EC%96%B4%EC%98%A4%EB%8A%94-%EB%B0%A9%EB%B2%95%EC%9D%84-%EA%B3%B5%EC%8B%9D-%EB%AC%B8%EC%84%9C%EB%A5%BC-%ED%86%B5%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)를 보는것을 추천합니다 :)

JdbcTest 어노테이션이 붙으면 URL이 명시되어있어도 in-memory DB를 사용한다.

# 결론

DB 테스트를 진행할 때는 다른 Component들을 Bean으로 등록하는 과정이 필요없기 때문에 Bean으로 등록해야할 정보가 Jdbc와 관련된 정보 뿐이라면 @JdbcTest를 사용하도록 하자.

ex) JdbcTemplate, DataSource 등

# Reference

https://docs.spring.io/spring-boot/docs/2.6.6/api/org/springframework/boot/test/autoconfigure/jdbc/JdbcTest.html
