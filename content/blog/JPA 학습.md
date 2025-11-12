---
title: "JPA 학습"
description: "서론 군에 있는동안 국방 해커톤을 진행했었다. 그 과정에서 엔티티를 직접 API에 가져다 사용함으로서 발생한 여러 애로사항이 있었다. Mybatis를 쓰면서 SQL문을 몇번이나 고치고 작성했었는지... 국방 해커톤 아쉬운점  JPA를 이용하면 보다 편리한 개발이 가능해"
date: 2022-06-26T04:06:10.463Z
tags: ["JPA","Java","Spring"]
---
# 서론
군에 있는동안 국방 해커톤을 진행했었다.
그 과정에서 엔티티를 직접 API에 가져다 사용함으로서 발생한 여러 애로사항이 있었다.
Mybatis를 쓰면서 SQL문을 몇번이나 고치고 작성했었는지...
![국방 해커톤 아쉬운점](/images/df6ebc42-fb80-4487-9e40-61d93a70846b-image.png)

JPA를 이용하면 보다 편리한 개발이 가능해진다고 한다.


# 왜 JPA를 사용해야할까?

## SQL에 의존적인 개발

데이터베이스는 객체 구조와는 다른 데이터 중심의 구조를 가진다.
객체를 DB에 직접 저장하거나 조회할 수 없기 때문에 개발자가 객체지향 애플리케이션과 DB의 중간에서 SQL과 JDBC API를 사용해서 변환작업을 해줘야한다.

이 과정에서 객체를 DB에 CRUD하기위해 무수히 많은 SQL과 JDBC API를 사용해서 변환작업을 해야한다.

* 진정한 의미의 계층 분할이 어렵다.
* 엔티티를 신뢰할 수 없다.
* SQL에 의존적인 개발을 피하기 어렵다.

## 패러다임의 불일치

객체지향 언어를 이용하면 추상화, 캡슐화, 상속, 다형성 등을 이용하여 시스템의 복잡성을 제어할 수 있는 다양한 장치들을 제공한다.

하지만 객체와 데이터베이스는 지향하는 목적이 달라 둘의 기능과 표현 방법이 다르다.
이를 객체와 관계형 데이터베이스의 패러다임 불일치 문제라고 한다.

```java
abstract class Item {
	Long id;
    String name;
    int price;
}

class Album extends Item {
	String artist;
}

class Movie extens Item {
	String director;
    String actor;
}
...

```
```sql
INSERT INTO ITEM ...
INSERT INTO ALBUM ...


INSERT INTO ITEM ...
INSERT INTO MOVIE ...
```
위와 같이 `Item`을 상속받는 `Album`객체를 저장하기 위해 부모객체에서 부모 데이터만 꺼내 `Item`을 위한 SQL을 작성하고 마찬가지로 자식객체 `Album`에 대한 SQL문도 작성해야한다. 자식 타입에 따라서 `DTYPE`도 작성해야하는건 덤이다.

또한 **객체는 참조를 사용**해서 다른 객체와 연관관계를 가지고 **참조에 접근하여 연관된 객체를 조회**한다.
**테이블은 외래 키**를 사용해서 다른 테이블과 연관관계를 가지고 **조인을 사용하여 연관된 테이블을 조회**한다.

이러한 패러다임의 불일치 문제를 해결하는데 너무 많은 시간과 코드를 소비하고 있다.

# JPA란?
JPA(Java Persistence Application)
: 자바 진영의 ORM 표준 기술이다.

## ORM(Object-Relational Mapping)
객체와 관계형 데이터베이스를 매핑한다는 뜻으로 ORM 프레임워크는 객체와 테이블을 매핑하여 패러다임 불일치 문제를 해결해준다.

자바 진영에도 다양한 OMR 프레임워크가 존재하는데 그중 하이버네이트 프레임워크가 가장 많이 사용된다.

**JPA는 자바 ORM 기술에 대한 API 표준 명세다.** JPA는 인터페이스를 모아둔 것이고, Hibernate가 JPA를 구현한 ORM 프레임워크다.

## JPA를 사용해야하는 이유

1. 생산성
JDBC API를 사용하는 반복적인 일을 JPA가 처리해주기 때문에 데이터 설계 중심의 패러다임을 객체 설계 중심으로 역전시킬 수 있다.
2. 유지보수
필드를 추가하거나 삭제해도 무수히 많은 JDBC API코드를 수정하지 않아도 되는것은 물론이고 도메인 모델을 편리하게 설계할 수 있다.
3. 데이터 접근 추상화와 벤더 독립성
MySQL, Oracle, H2 등 데이터베이스마다 방언(Dialect)이 존재하여 자칫하면 애플리케이션이 데이터베이스 애플리케이션이 종속된다.
JPA를 이용하면 이러한 데이터베이스 방언에 대해 유연하게 동작하여 데이터베이스에 종속되지 않도록 한다. 
4. 성능
JDBC의 경우에는 동일한 트랜잭션 안에서 동일한 회원을 두번 조회하는 대신 JPA는 1번만 조회하고 두번째는 이미 조회한 객체를 재사용한다. 
```java
String memberId = "helloId";
Member member1 = jpa.find(memberId);
Member member2 = jpa.find(memberId);
```

---

> 이번에는 `왜` JPA를 사용해야하는지에 대해 살펴보았다.
다음은 `어떻게` JPA를 사용하는지 알아보자.

# Reference
* 자바 ORM 표준 JPA 프로그래밍
![jpabook](/images/02a034da-bff3-4cd9-a15d-3daf072e0a21-image.png)
