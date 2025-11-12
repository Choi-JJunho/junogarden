---
title: JUnit5 - 1주차
description: >-
  테스트의 '테'자도 적용해보지 않았던 기존의 개발 방식에 큰 변화와 도움을 줄 수 있을것 같아 동아리원들과 함께 JUnit5 공부를
  시작하게되었다.
date: 2022-07-15T13:33:54.640Z
tags:
  - JUnit5
  - Spring Boot
---
# 서론 
테스트의 '테'자도 적용해보지 않았던 기존의 개발 방식에 큰 변화와 도움을 줄 수 있을것 같아 동아리원들과 함께 JUnit5 공부를 시작하게되었다.

전역하자마자 현장실습하면서 정신없지만 군대에서 너무 놀았기 때문에...

![](/images/0e3b47cb-1397-41d9-b4f8-c52dfdff96f7-image.png)

# JUnit5

JUnit : 자바 개발자가 가장많이 사용하는 테스팅 프레임워크
> [1등이라네요](https://www.testscenario.com/best-java-testing-framework/)
![1등](/images/3e6ee164-9094-47cf-b884-5bf3c153caa4-image.png)

Juint platform : 실행을 위한 Jupiter는 Junit5의 Test Engine api 구현체다. 

Vintage : JUnit 4, 3 를 지원하는 구현체

JUnit5 부터는 테스트 클래스나 메서드가 public으로 지정되어있지 않아도 실행이 가능하다.
이는 자바의 reflection 을 사용했기 때문이다. 

> _(reflection이 뭔데? 이런걸 가능하게해주는가??)_
간단하게 설명하자면 값을 알 수 없는 객체를 매핑하는 기술을 의미한다.
이 덕분에 Annotation의 사용도 가능하다.

아래는 JUnit5에서 테스트 간 이용되는 어노테이션들이다.

``` java
@Test : 테스트코드에 해당한다.
@BeforeAll : 테스트가 시작하기 전에 수행
@AfterAll : 테스트가 종료되고 난 후 수행
@BeforeEach : 각각의 테스트가 시작하기 전에 수행 
@AfterEach : 각각의 테스트가 종료될때 수행
@Disabled : 미사용 테스트
```

## 테스트 이름 표기
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class) : class 단위로 global하게 규칙 설정

@DisplayName(“displayname”) : 메서드에 걸어서 이름을 설정 할 수 있다.


>  `@DisplayName`이 우선순위가 높다
>> 이모지도 들어간다... 🧐![possible_imoji](/images/63ec06f5-d550-4911-8ca2-d16fb1896338-image.png)


## Assertion
보통 테스트할 때 assertSomting을 수행하면 하나의 assert가 실패했을 때 그 이후의 assert들은 실행되지않는다.

assertAll(()로 묶어주면서 모두 수행할 수 있다.

* assertTimeout을 통해 시간제한 조건을 둘 수 있다.
* assertTimeoutPreemptively를 사용할 경우 제한한 시간이 넘어가는 즉시 종료된다.
  * Thread Local을 사용하는 경우 다른 thread와 공유가 되지 않기 때문에 주의가 필요하다. 예를들면 Transaction을 사용하는 Thread와 공유가 되지 않아 Rollback이 되지 않고 코드가 진행될 수도 있다. 시간이 걸리더라도 1번방식을 사용하는것이 더 안전하다.
  
> ThreadLocal : 자바에서 스레드(thread)마다 독립적인 변수를 가질 수 있게 해주는 클래스다.

AssertJ, Hamcrest 등의 라이브러리를 사용해서 다른 방식으로 테스트를 표현할 수 도 있다. (Spring boot starter test에서는 기본적으로 AssertJ, Hamcrest를 제공한다.

## 특정 환경에서 실행하기
OS 및 환경변수를 통제할 수도 있다.
``` java
assumingThat(“LOCAL”.equalsIgnoreCase(testEnv), () -> { ...
```
위와같은 방식을 통해 특정 환경변수를 통제할 수 있지만 어노테이션을 이용한 방식도 존재한다.
* `@EnabledOnOs` / `@DisablesOnOs` : 특정 OS에서만 …
* `@EnabledOnJre` / `@DisabledOnJre` : 특정 Jre에서만…
* `@EnabledIfEnvironmentVariable` : 특정 환경변수에서만…

## 태깅과 필터링
@Tag를 통해 특정 테스트들을 태깅할 수 있다.

Intellij에서는 해당 탭에서 Test를 구분하는 방식을 지정할 수 있다.
![](/images/57777beb-f65e-448e-8229-70c5069e34d5-image.png)


Maven에서는 surefire plugin을 이용하여 pom.xml에 기준 그룹을 지정하고 해당 태그를 필터링하여 빌드할 수 있다.

### 커스텀 태그
annotation을 커스텀하여 기존 어노테이션들을 메타 어노테이션으로 사용할 수 있다.
(묶어쓰는 느낌)
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Test
@Tag("custom")
public @interface Custom {
}
```


## 테스트 반복하기
`@RepeatedTest`
* 반복 횟수외 테스트 이름 설정 가능
  * `{displayName}` : displayName 표기
  * `{currentRepetition}` : 현재 반복횟수 표기
  * `{totalRepetitions}` : 총 반복횟수 표기
* RepetitionInfo 타입의 인자를 받을 수 있다.
  * currentRepetition 혹은 totalRepetition값을 가져온다.
```java
@DisplayName("반복하기")
@RepeatedTest(value = 10, name = "{displayName}, {currentRepetition}/{totalRepetitions}")
void repeatTest(RepetitionInfo repetitionInfo) {
    System.out.println("repeat after me~" + repetitionInfo.getCurrentRepetition());
}
```

`@ParameteizedTest`
* 테스트에 여러 매개변수를 대입해가며 반복할 수 있다.
  * `{displayName}`
  * `{index}`
  * `{arguments}`
  * `{0}`, `{1}`, ...
  
* 인자값에는 다양한 소스가 들어갈 수 있다.
  * `@ValueSource`, `@NullSource`, `@EmptySource`, `MethodSource` 등등
  
```java
@DisplayName("반복을 소스로")
@ParameterizedTest(name = "{index} {displayName} message={0}")
@ValueSource(strings = {"날씨", "많이", "좋아", "요"})
void parameterizedTest(String message) {
    System.out.println(message);
}
```

> 여기서 궁금한 점이 생길것이다.
@ParameterizedTest의 인자가 객체라면? 어떻게 될까?🧐
[공식문서](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests-argument-conversion)를 보면 암묵적으로 특정 string 값들을 변환한다는 것을 알 수 있다.

근데 Entity를 다룰때 다루는 데이터가 그렇게 단순하지 않을것이다.
때문에 `SimpleArgumentConverter`를 상속받아 Converter를 만들어줘야한다.
그 후 `@ConvertWith`으로 새로만든 Converter를 등록해주면 된다.
```java
@DisplayName("반복을 소스로")
@ParameterizedTest(name = "{index} {displayName} message={0}")
@ValueSource(strings = {"민수", "철수", "영희", "철민"})
void parameterizedTest(@ConvertWith(MemberConverter.class) Member member) {
    System.out.println(member.getName());
}
static class MemberConverter extends SimpleArgumentConverter {
    @Override
    protected Object convert(Object source, Class<?> targetType) throws ArgumentConversionException {
        assertEquals(Member.class, targetType, "Can only convert to Member");
        return new Member("account", "password", "email", source.toString());
    }
}
```

> 여기서 또 궁금한게 생긴다.
객체에 인자가 여러개라면 `@ValueSource`를 여러개 반복적으로 써줘야하나? 🧐

그럴줄 알고 만들어놓은게 있다. 
위에서 사용한 `SimpleArgumentConverter`는 하나의 인자를 대상으로 수행하나 `@CsvSource`와 `@AggregateWith()`를 사용하면 여러개의 인자까지도 다룰 수 있다.

백문이 불여일견 쓰는 모습을 한번 보자

```java
@DisplayName("반복을 소스로")
@ParameterizedTest(name = "{index} {displayName} message={0}")
@CsvSource({"'계정1', 'pw1', 'email1', 'user1'","'계정2', 'pw2', 'email2', 'user2'",
        "'계정3', 'pw3', 'email3', 'user3'", "'계정4', 'pw4', 'email4', 'user4'",})
void parameterizedTest(@AggregateWith(MemberAggregator.class) Member member) {
    System.out.println(member);
}
static class MemberAggregator implements ArgumentsAggregator {
    @Override
    public Object aggregateArguments(ArgumentsAccessor accessor, ParameterContext context) throws ArgumentsAggregationException {
        return new Member(accessor.getString(0),accessor.getString(1),accessor.getString(2),accessor.getString(3));
    }
}
```
> ArgumentsAggregator는 inner static class 혹은 public이여야한다는 조건이 있다는 것을 잘 알아두자.

> 자세한 내용은 [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests) 참고

## 테스트 인스턴스

테스트간의 의존성을 없애기 때문에 매 테스트마다 새로은 클래스로 돌아간다.
때문에 테스트 내부에 존재하는 변수는 공유되지 않으며 테스트 순서가 보장되지 않는다.

JUnit5에서는 이러한 제약을 조금 느슨하게 만들어 주는 기능이 존재한다.
테스트 클래스 최상단에 `@TestInstance(TestInstance.Lifecycle.PER_CLASS)`를 명시하면 테스트 인스턴스를 단 한번만 만들기 때문에 테스트 내부 변수가 공유된다.

때문에 `@BeforeAll`, `@AfterAll`과 같은 조건들이 static일 필요도 없어진다.

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class StudyTest { ... }
```

## 테스트 순서

단위 테스트는 의존성이 없어야하기 때문에 순서를 신경 쓸 이유가 없다.

하지만 시나리오 테스트같이 테스트간의 순서가 필요한 경우도 있다.
`@TestMethodOrder`와 `@Order`가 이를 가능하게 해준다.

```java
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class StudyTest {...
    @Test
    @Order(1)
    void create() {
        StudyTest studyTest = new StudyTest();
        assertNotNull(studyTest);
    }

    @Test
    @Order(0)
    void create1() {
        StudyTest studyTest = new StudyTest();
        assertNotNull(studyTest);
    }
}
```

위에서 설명한 @TestInstance와 @TestMethodOrder를 같이쓰면 상태를 공유하면서 순서도 설정할 수 있다.

## JUnit 5 properties

어플리케이션의 config.properties처럼 JUnit에 대한 설정도 있다.
![junit-platform.properties](/images/b1d5e431-c776-47e9-925f-a871e2e009bc-image.png)

여기에서는 다음과 같은것들을 설정할 수 있다.

- 테스트 인스턴스 라이프사이클
```
junit.jupiter.testinstance.lifecycle.default = per_class
```
- 확장팩 자동감지
```
junit.jupiter.extensions.autodetection.enabled = ture
```
- @Disabled 무시하고 실행
```
junit.jupiter.conditions.deactivate = org.junit.*DisabledCondition
```
- 테스트 이름 표기 전략 설정
```
junit.jupiter.displayname.generator.default = org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
```

위에서 어노테이션으로 지정했던 설정들을 properties파일로 관리할 수 있다.

## 확장 모델

JUnit 4의 확장모델 : `@RunWith(Runner)`, `TestRule`, `MethodRule`
JUnit 5의 확장모델 : `Extention`

[공식문서](https://junit.org/junit5/docs/current/user-guide/#extensions)에 무수히 많은 방법들이 있다.

아래는 테스트 실행 전, 후로 시간을 측정해서 1초가 넘어가면 실패하는 확장 모델이다.
```java
public class FindSlowTestExtension implements BeforeTestExecutionCallback, AfterTestExecutionCallback {

    private static final long THRESHOLD = 1000L;

    @Override
    public void beforeTestExecution(ExtensionContext context) throws Exception {
        ExtensionContext.Store store = getStore(context);
        store.put("START_TIME", System.currentTimeMillis());
    }

    @Override
    public void afterTestExecution(ExtensionContext context) throws Exception {
        String testMethodName = context.getRequiredTestMethod().getName();
        ExtensionContext.Store store = getStore(context);
        long start_time = store.remove("START_TIME", long.class);
        long duration = System.currentTimeMillis() - start_time;
        if (duration > THRESHOLD) {
            System.out.printf("consider mark method [%s] with @SlowTest \n", testMethodName);
        }
    }

    private ExtensionContext.Store getStore(ExtensionContext context) {
        String testClassName = context.getRequiredTestClass().getName();
        String testMethodName = context.getRequiredTestMethod().getName();
        ExtensionContext.Store store = context.getStore(ExtensionContext.Namespace.create(testClassName, testMethodName));
        return store;
    }
}
```
이 모델을 어떻게 적용하느냐에 따라 선언적 등록(`@ExtendWith`)과 프로그래밍 등록(`@RegisterExtention`)으로 나뉜다.

선언적 등록의 경우 특정 제약조건에 대해 가변적으로 설정할 수 없는 단점이 있다.
여기 예시에서는 THRESHOLD 변수가 변하지 못한다.
```java
@ExtendWith(FindSlowTestExtension.class)
class StudyTest {...}
```

프로그래밍 등록은 확장한 인스턴스를 생성자에서 받아오도록 수행할 수 있다.

```java
class StudyTest {

    @RegisterExtension
    static FindSlowTestExtension findSlowTestExtension = 
            new FindSlowTestExtension(1000L);
           ...
}
```
## JUnit4 마이그레이션

JUnit4에서 JUnit5로 마이그레이션하는 기능도 존재한다.

junit-vintage-engine을 의존성으로 추가하면 JUnit5의 junit-platform으로 JUnit 3와 4로 작성된 테스트를 실행할 수 있다.

# Reference
[더 자바, 애플리케이션을 테스트하는 다양한 방법_백기선](https://www.inflearn.com/course/the-java-application-test)
