---
title: "Spring이란?"
description: "Spring이랑 친해지기"
date: 2023-04-15T12:26:25.908Z
tags: ["Java","Spring"]
---
# 서론

개인적으로 Java보다 Spring을 먼저 시작하면서 전체적으로 사용법만 두리뭉실하게 익히고 사용했었다.
때문에 "Spring이 뭔데? 왜 쓰는데?" 라는 질문을 들었을 때 제대로 답변 할 수 없었다.

Spring을 모르고 사용하고 있었다는 상황이라는 것을 최근에 알게 되었다.

우테코를 시작하기 전의 나의 상황은 다음과 같았다.

- Spring은 써봤는데 자바는 잘 못해요 ㅎㅎ
- 구글링과 복붙을 통해 Spring으로 게시판은 만들 수 있어요
- 다들 Spring 사용하길래 Spring 사용합니다

최근 아래와 같은 질문들을 받았을 때 어떻게 설명할 수 있을까? 를 고민중이다.

??? : Spring을 왜 쓰죠?
??? : 왜 Annotation만 붙였는데 돌아가죠?
??? : Bean이 뭔데 스프링은 빈을 등록하죠?
??? : Spring은 왜 싱글턴으로 동작하죠?
??? : 서블릿이 뭐죠?
...

이전에도 Spring을 처음 사용해보면서 궁금한것 투성이였는데 아직도 궁금한 것 투성이다.

Spring과 친해지는 시간을 가져보려고 한다.

[Spring 공식 문서](https://docs.spring.io/spring-framework/docs/current/reference/html/overview.html#spring-introduction)를 읽어보면서 개념을 차근차근 이어가보자.

# Spring이란?

~~??? 🦆 : Spring은 봄이죠...~~

Spring 공식 문서에서는 Spring을 다음과 같이 설명하고있다.
 
> Spring makes it easy to create Java enterprise applications. It provides everything you need to embrace the Java language in an enterprise environment, with support for Groovy and Kotlin as alternative languages on the JVM, and with the flexibility to create many kinds of architectures depending on an application’s needs. As of Spring Framework 6.0, Spring requires Java 17+.

Spring은 자바 엔터프라이즈 애플리케이션을 쉽게 만들 수 있도록 도와주는 도구이며 Groovy와 Kotlin도 지원한다.

2023.04.15 기준으로 Spring의 최신 버전은 6.0.8이며 Spring 6버전부터 자바 17이상을 사용해야한다고 설명하고있다.


> The term "Spring" means different things in different contexts. It can be used to refer to the Spring Framework project itself, which is where it all started. Over time, other Spring projects have been built on top of the Spring Framework. Most often, when people say "Spring", they mean the entire family of projects. This reference documentation focuses on the foundation: the Spring Framework itself.

![](/images/cc6c7a8a-bf6b-42d2-b547-b328bddd9a28-image.png)

Spring은 크게 보면 Spring Projects를 지칭하는 의미로 해석된다.

Spring Boot, Spring Framework, Spring Data, Spring Cloud 등등.. 다양한 Spring Project들이 존재한다.

Spring Framework를 흔히 Spring이라고 지칭할 수 있다.

# Spring Framework의 역사

> Spring came into being in 2003 as a response to the complexity of the early J2EE specifications. While some consider Java EE and its modern-day successor Jakarta EE to be in competition with Spring, they are in fact complementary. The Spring programming model does not embrace the Jakarta EE platform specification; rather, it integrates with carefully selected individual specifications from the traditional EE umbrella:

Java EE, Jakarta EE에 대한 이야기를 언급하고있다.

## Java EE?

Java는 알겠는데 Java EE는 뭘까?

간단하게 내용을 정리하자면 Java EE(Java Platform, Enterprise Edition)는 기업용 애플리케이션을 개발/실행하기 위한 기술과 환경을 제공하며 서블릿(Servlet), JSP, EJB, JDBC, JNDI, JMX, JTA 등의 알려진 기술을 포함한다.

여담이지만 오라클은 2017년 자바EE 8 릴리즈를 마지막으로 오픈소스 SW를 지원하는 비영리 단체인 이클립스 재단에 자바EE 프로젝트를 이관다고 한다. 

이 때 부터 Java EE의 공식 명칭이 Jakarta EE로 변경되었다. 하지만 자바 상표권은 오라클이 보유하고 있기 때문에 자바 네임스페이스 사용에 제약이 있었고, 이러한 이유로 자카르타EE에서는 자바 네임스페이스가 Jakarta로, API 패키지명은 `javax.*` 에서 `Jakarta.*` 로 변경되었다고 한다.

때문에 Jakarta EE가 Java EE를 대체하는것이 아니라 둘다 공존하고 있는 상태다.

# 디자인 철학

> When you learn about a framework, it’s important to know not only what it does but what principles it follows. Here are the guiding principles of the Spring Framework:

우리가 어떤 프레임워크를 이해하려면 해당 프레임워크의 디자인 철학을 아는것이 중요하다.

Spring은 어떤 철학을 가지고있을까?

## 모든 수준에서 선택지를 제공한다

> Provide choice at every level.

Spring을 이용하면 설계 결정을 늦게 할 수 있다.

예를 들어 코드를 변경하지 않고 설정을 지속적으로 제공할 수 있다고 한다.

## 다양한 관점을 수용한다

> Accommodate diverse perspectives.

다양한 관점에서 애플리케이션 요구사항을 수용한다.

## 강력한 하위호환성

> Maintain strong backward compatibility. 

버전이 올라감에도 하위 버전에 대한 호환성을 지킨다.

## API 설계를 신중하게

> Care about API design.

직관적이고 오랜 세월동안 사용할 수 있는 API를 만들기 위해 신중하게 설계한다.

## 높은 코드 품질

> Set high standards for code quality.

코드가 깨끗한 구조를 가진다.

예를 들면 패키지 간에 순환 종속성이 없는 것을 이야기하고 있다.

# 결론

Spring이 무엇이고 왜 만들어졌는지 알아봤다.

동시에 공식문서를 읽는 연습도 같이 할 수 있었다. 👍

# Reference

https://spring.io/why-spring

https://www.samsungsds.com/kr/insights/java_jakarta.html

https://konghana01.tistory.com/591

https://docs.spring.io/spring-framework/docs/current/reference/html/overview.html#spring-introduction