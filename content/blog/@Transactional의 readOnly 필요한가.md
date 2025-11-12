---
title: '@Transactional의 readOnly 필요한가?'
description: '@Transactional의 readOnly 옵션이 왜 필요할까요?'
date: 2023-06-06T13:40:51.132Z
tags:
  - 트랜잭션
---
# 서론

지난번에 [@Transactional의 선언 위치](https://velog.io/@junho5336/Transactional%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B3%A0%EC%B0%B0)에 대해 고민해봤다.

@Transactional을 사용할 때 습관적으로 조회 로직에 대해서는 readOnly 옵션을 붙여줘야한다고 인지하고 사용하고 있었다.

JPA를 사용할 때는 readOnly 옵션을 사용하지 않으면 엔티티를 영속화하지 않는다고 알고 있었다.
근데 JPA를 사용하지 않을때는 왜 readOnly 옵션을 사용해야할까?

@Transactional readOnly 옵션에 대한 고찰을 진행해보자

# readOnly = true

우선 @Transactional 어노테이션의 readOnly 옵션을 true로 지정했을 때 어떤 일이 발생하는지 알아보자.

> JPA를 사용하지 않고 JdbcTemplate를 사용하는 환경이다.

## 프록시 생성

Spring은 클래스 또는 메서드 중 하나에서 @Transactional로 주석이 달린 모든 클래스에 대한 프록시를 생성한다.

프록시 생성을 기준으로 봤을 때 단순히 조회만 필요한 클래스에 대해서 @Transactional을 붙여가면서 프록시 Bean을 생성할 이유는 없어보인다.

## 가독성

`@Transactional(readOnly=true)`옵션을 설정함으로서 개발자가 명시적으로 읽기전용 메서드임을 알 수 있다는 장점이 존재한다.


## DB Replication

하나의 DB에서 계속해서 읽고, 쓰는 행위가 반복되면 DB에 부하가 발생할 수 있다.


![](/images/214b0136-a0ff-4a4e-a0e3-a76b874733ba-image.png)

우리는 위와같이 DB에 가해지는 부하를 분산시키기 위해 DB를 복제하여 조회를 위한 DB, 읽기 쓰기를 위한 DB를 나눠서 관리하는 방법을 생각해볼 수 있다.

이 때 @Transactional의 옵션에 따라 DataSource를 다르게 관리할 수 있다.

자세한 내용은 [해당 글](https://vladmihalcea.com/spring-transactional-annotation/)을 참고하면 좋을 것 같다.

# 요약

@Transactional의 장점

- 개발자가 명시적으로 읽기전용 메서드임을 알 수 있다.
- JPA를 사용하면 영속성 컨텍스트의 변경감지를 수행하지 않는다. 이는 성능상 이점을 가져온다.
- DB 복제를 통해 DB에 가해지는 부하를 분산시킬 수 있다.

@Transactional의 단점

- 프록시 객체를 항상 생성하기 때문에 단순 조회만 필요한 경우 불필요한 리소스가 사용될 수 있다.
- DB 복제를 통해 조회할 때 데이터의 정합성이 중요한 정보에 대해서 신경써줘야한다.
  - 정말정말 중요한 정보에 대해서는 원본 DB를 조회하도록 설정해볼 수 있곘다.

# Reference

https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html

https://velog.io/@jurlring/TransactionalreadOnly-true%EC%97%90%EC%84%9C-readOnly-true%EB%8A%94-%EB%AC%B4%EC%8A%A8-%EC%97%AD%ED%95%A0%EC%9D%B4%EA%B3%A0-%EA%BC%AD-%EC%8D%A8%EC%95%BC%ED%95%A0%EA%B9%8C

https://velog.io/@paxwillman/Transactional-readOnly-true

https://www.phind.com/search?cache=6a3910bf-970b-4d51-a033-44e6ac3d6873
