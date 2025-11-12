---
title: JUnit5 - 6주차
description: >-
  서론 이번주차는 ArchUnit에 대해 알아보자.  ArchUnit ArchUnit 애플리케이션의 아키텍처를 테스트할 수 있는 라이브러리다.
  프로젝트의 패키지, 클래스, 레이어간의 의존성을 확인할 수 있다.  ArchUnit을 통해 다음과 같은 테스트를 시도할 수 있다
date: 2022-08-21T04:58:25.533Z
tags:
  - JUnit5
  - 아키텍처
---
# 서론
이번주차는 ArchUnit에 대해 알아보자.

# ArchUnit
ArchUnit 애플리케이션의 아키텍처를 테스트할 수 있는 라이브러리다.
프로젝트의 패키지, 클래스, 레이어간의 의존성을 확인할 수 있다.

ArchUnit을 통해 다음과 같은 테스트를 시도할 수 있다.

- A라는 패키지가 다른 패키지에서 사용되고 있는지 확인이 가능하다.
- 특정 클래스가 특정 패키지에 들어있는지 확인할 수 있다.
- 특정한 스타일의 아키텍처를 따르는지 확인할 수 있다.

## 설치

```xml
<dependency>
    <groupId>com.tngtech.archunit</groupId>
    <artifactId>archunit-junit5-engine</artifactId>
    <version>0.12.0</version>
    <scope>test</scope>
</dependency>
```

## 사용
영어작문을하는 느낌으로 문법이 구성되어있다.
```java
@Test
public void Services_should_only_be_accessed_by_Controllers() {
	// 특정 패키지의 클래스를 읽어온다.
	JavaClasses importedClasses = new ClassFileImporter().importPackages("com.mycompany.myapp");
	// 규칙을 정의한다.
    ArchRule myRule = classes()
        .that().resideInAPackage("..service..")
        .should().onlyBeAccessed().byAnyPackage("..controller..", "..service..");
	// 규칙과 맞는지 확인한다.
    myRule.check(importedClasses);
}
```

JUnit5에서 확장팩을 제공한다.

- `@AnalyzeClasses`: 클래스를 읽어들일 패키지를 정의한다.
- `@ArchTest`: 확인할 규칙 정의한다.

``` java
@AnalyzeClasses(packagesOf = App.class)
public class ArchTests {

    @ArchTest
    ArchRule controllerClassRule = classes().that().haveSimpleNameEndingWith("Controller")
            .should().accessClassesThat().haveSimpleNameEndingWith("Service")
            .orShould().accessClassesThat().haveSimpleNameEndingWith("Repository");

...
}
```

## 규칙

규칙에대해 간단히 살펴보자
builder 패턴으로 구성된 문장을 읽어보면

Controller로 끝나는 클래스는 | Service로 끝나는 클래스에 대해 접근(사용)할 수 있다. | 또는 Repository로 끝나는 클래스로 접근(사용)할 수 있다.

즉, "Controller는 Service와 Repository 클래스에 접근할 수 있다." 라는 규칙을 정의했다.
```java
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;

@AnalyzeClasses(packagesOf = App.class)
public class ArchClassTests {

@ArchTest
ArchRule controllerClassRule = classes().that().haveSimpleNameEndingWith("Controller")
        .should().accessClassesThat().haveSimpleNameEndingWith("Service")
        .orShould().accessClassesThat().haveSimpleNameEndingWith("Repository");

}
```

아래와같이 순환참조에 대해서도 확인할 수 있다.

![](/images/543cc402-28bd-431e-9461-d7d0f19780c7-image.png)

`slices().matching("com.myapp.(*)..").should().beFreeOfCycles()`

[공식문서](https://www.archunit.org/userguide/html/000_Index.html#_using_junit_4_or_junit_5)에 다양한 구조에 대해 테스트를 진행하는 방법이 설명되어있다.


# Reference
[더 자바, 애플리케이션을 테스트하는 다양한 방법_백기선](https://www.inflearn.com/course/the-java-application-test)

https://www.archunit.org/userguide/html/000_Index.html#_junit_5
