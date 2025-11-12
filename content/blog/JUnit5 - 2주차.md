---
title: JUnit5 - 2주차
description: >-
  서론 이번주차는 Mockito를 사용해보는 시간이다.  이번주에 Mockito를 학습하기 전에 문득 스스로에게 질문하게되었다. 테스트를 왜
  사용해야하는지? 단위테스트가 뭔가요? 테스트의 종류는 뭐가있는지 알고있나요? 등등..  JUnit5의 사용법 및 여타 프레임워크들
date: 2022-07-23T15:54:22.035Z
tags:
  - JUnit5
  - Spring Boot
---
# 서론
이번주차는 Mockito를 사용해보는 시간이다.

# Mockito

Mock객체를 쉽게 만들고 관리, 검증할 수 있는 방법을 지원하는 Framework다.
> Mock? : 진짜 객체와 비슷하게 동작하지만 프로그래머가 직접 그 객체의 행동을 관리하는 객체


## Mock이란?
객체를 만들어 사용할 때 네트워크 혹은 DB와 같이 통제하기 어려운 환경과 연결되어 실행된다면 이를 테스트할 때 비용이 많이 들 것이다.
이러한 상황을 해결하기 위해 Mock(가짜객체)을 사용한다.
![](/images/46887498-d6ea-41fd-9e30-b418ed5c01b6-image.png)

## Mockito 시작하기

spring-boot-starter-test를 의존성에 추가하면 기본적으로 mockito가 추가된다.

![](/images/d7317aaa-321b-4508-b46b-06088871ed20-image.png)

다음 세가지를 알고 Mock을 활용한 테스트를 작성해보자

- Mock을 만드는 방법
- Mock이 어떻게 동작해야하는지 관리하는 방법
- Mock의 행동을 검증하는 방법

## Mock 객체 만들기

구현체는 없고 인터페이스만 존재하는 상황을 가정해보자.
인터페이스 기반으로 코드를 작성중이지만 아직 인터페이스가 구현이 되어있지 않은 상황이다.


Mockito.mock() 메소드로 만드는 방법
```java
MemberService memberService = mock(MemberService.class);
StudyRepository studyRepository = mock(StudyRepository.class);
```

Annotation으로 Mock 만드는 방법
```java
@ExtendWith(MockitoExtension.class)
class StudyServiceTest{ 
  @Test
  void createStudyService(@Mock MemberService memberService, @Mock StudyRepository studyRepository) {
    StudyService studyService = new StudyService(memberService, studyRepository);
    assertNotNull(studyService);
}
```
Mockito를 사용한다고 선언해주기 위해 `@ExtendWith(MockitoExtension.class)`을 같이 사용해야한다.


## Mock객체의 행동 정의하기

Mock 객체의 행동
- Null을 리턴한다. (Optional의 경우 Optional.empty 리턴)
- Primitive 타입은 기본 Primitive 값
- 컬렉션은 비어있는 컬렉션
- Void 메소드는 예외를 던지지않고 아무런 일도 발생하지않음

argument matcher : 특정 argument만 오도록 지정할 수 있다. 예를들어 any()로 지정한다면 모든 argument가 올 수 있다.
특정 매개변수를 받은 경우 특정한 값을 리턴하거나 예외를 던지도록 만들 수 있다.
- stubbing
- argument matchers

Void 메소드의 경우 특정 메개변수를 받거나 호출된 경우 예외를 발생 시킬 수 있다.

메소드가 동일한 매개변수로 여러번 호출될 때 각기 다르게 행동하도록 조작할 수 있다.

when - then, then, then...

## Mock 객체 확인

verify를 통해 Mock에서 함수가 어떻게 사용되었는지 확인할 수 있다.
예제코드와 함께 확인해보자.

- 특정 메소드가 특정 매개변수로 몇번(or 최소한번 or 호출x) 호출되었는지
```java
verify(memberService, times(1)).notify(study);
```

- 어떤 순서로 호출했는지
```java
// 만약 호출 순서가 잘못되었다면 fail
InOrder inOrder = inOrder(memberService);
inOrder.verify(memberService).notify(study);
inOrder.verify(memberService).notify(Optional.of(member));
```

- 특정 시간 이내에 호출되었는지
```java
verify(mock, timeout(100)).someMethod();
```

- 특정 시점 이후에 아무일도 일어나지 않는지
```java
verifyNoMoreInteractions(memberService);
```

## BDD 스타일 API

BDD (Behaviour-Driven Development)
: 애플리케이션이 어떻게 행동해야하는지에 대한 공통된 이해를 구성하는 방법으로 TDD에서 창안헀다.

Mockito에서는 BDD스타일로 작성할 수 있도록 API를 제공하고있다.

when 구절을 given으로 작성할 수 있다.
```java
when(memberService.findById(1L)).thenReturn(Optional.of(member));
when(studyRepository.save(study)).thenReturn(study); 

// To BDD
given(memberService.findById(1L)).willReturn(Optional.of(member));
given(studyRepository.save(study)).willReturn(study);

```

verify 구절을 then구절로 사용할 수 있다.
```java
verify(memberService, times(1)).notify(study);
verifyNoMoreInteractions(memberService);

//To BDD
then(memberService).should(times(1)).notify(study);
then(memberService).shouldHaveNoMoreInteractions();
```

# Reference
https://ko.wikipedia.org/wiki/%EC%9C%A0%EB%8B%9B_%ED%85%8C%EC%8A%A4%ED%8A%B8
http://blog.hwahae.co.kr/all/tech/tech-tech/6274/
https://www.crocus.co.kr/1555
https://mangkyu.tistory.com/143
