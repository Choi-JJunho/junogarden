---
title: '@Transactional에 대한 고찰'
description: '@Transactional은 뭘까? 어디에 선언해야할까?'
date: 2023-05-21T13:44:20.736Z
tags:
  - Spring
  - 트랜잭션
---
# 서론

ATM기에서 출금을 할 때 다음과 같은 시나리오를 가지고 있다고 생각해보자.

1. 은행 Table에서 돈이 감소한다.
2. ATM에서 돈이 출력된다.

위와 같이 출금이라는 하나의 비즈니스 로직의 흐름이 존재할 때 은행에서 돈이 감소하고 어떤 오류가 발생한다면 ATM기에서는 출금이 되지도 않았는데 은행계좌의 돈은 줄어들어버리는 문제가 발생할 수 있다.

이처럼 우리는 어떤 작업을 수행 할 때 중간에 로직상 문제가 발생하는 경우 처음으로 되돌리고 싶은 상황이 존재하기도 한다.

하나의 사이클에서 성공하는 단위를 보장하기 위해 트랜잭션이라는 개념을 도입할 수 있다.

# @Transactional

Spring에서는 `@Transactional` 어노테이션을 이용해 트랜잭션을 수행할 수 있도록 지원하고있다.

해당 어노테이션은 클래스, 메서드 레벨에 선언할 수 있다.

`@Transactional`이 선언된 메서드는 작업 중간에 실패(오류)가 발생하면 전체 작업을 취소한다.

# 어디에 선언해야할까?

문득 DB에 대한 직접적인 CRUD가 일어나는 Persistence Layer에서만 `@Transactional`을 수행해주면 아무 문제가 없지 않을까? 라는 생각이 들었다.

데이터가 저장되는 DB에 대한 작업단위에서만 Transaction을 지켜주면 된다는 생각이었다.

예를들면 직접적으로 DB의 CRUD를 수행하는 DAO, DAO를 사용하여 Domain을 생성하는 Repository의 구현체 정도 까지만 `@Transactional`을 걸어준다는 것이다.

[해당 아티클](https://vladmihalcea.com/spring-transactional-annotation/)을 참조하여 어떤 레이어에 @Transactional을 선언해야할 지 한번 알아보자.

> The DAO (Data Access Object) or Repository layer requires an application-level transaction, but this transaction should propagate from the Service layer.

> DAO(데이터 액세스 객체) 또는 리포지토리 계층에는 애플리케이션 레벨 트랜잭션이 필요하지만 이 트랜잭션은 서비스 계층에서 전파되어야 합니다.

위 글에 따르면 서비스 계층에서 `@Transactional`을 선언하는 것이 유리하다고 설명하고 있다.

왜 서비스 계층에서 전파되어야할까?

서비스 계층에서는 DB와 연관된 비즈니스 로직과, DB와 연관되어있지 않은 비즈니스 로직이 공존한다.

이번 지하철 미션을 수행하면서 생긴 한 로직을 예로 들어보자.

```java
public LineResponse createSection(final long lineId, final CreateSectionRequest request) {
    Line line = lineRepository.findById(lineId);

    Station upStation = stationRepository.findById(request.getUpStation());
    Station downStation = stationRepository.findById(request.getDownStation());

    line.addSection(new Section(upStation, downStation, request.getDistance()));

    lineRepository.updateSections(line);

    return LineMapper.toResponse(line);
}
```

lineRepository, stationRepository의 구현체는 DB와 연관되어있다.
하지만 `line.addSection()`이라는 Line 도메인의 메서드는 DB와 연관되어있지 않다.

만약 `line.addSection()`에서 오류가 발생했는데 롤백되지 않는다면 해당 메서드 이전의 로직들에 대해서는 수행이 되어버린다는 문제가 발생한다.

이처럼 영속성 엔티티와 도메인 엔티티를 모두 다루는 Service 레이어를 생각해본다면 DB에 대한 작업단위에서만 `@Transactional`이 적용되어야한다는 생각이 올바르지 않다는 것을 알 수 있다.

# Reference

https://tecoble.techcourse.co.kr/post/2021-05-25-transactional/

https://vladmihalcea.com/spring-transactional-annotation/

https://stackoverflow.com/questions/1079114/where-does-the-transactional-annotation-belong
