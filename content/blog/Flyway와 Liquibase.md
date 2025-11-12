---
title: Flyway와 Liquibase
description: >-
  Flyway, Liquibase를 사용하면서 두 가지 툴을 비교해보자.Flyway, Liquibase는 데이터베이스 마이그레이션
  툴이다.Liquibase 공식홈페이지에서도 이 서로를 비교한 문서가있다.순수 SQL 또는 Java 코드로 작성된 스크립트를 기반으로 하며 G
date: 2022-08-04T06:35:55.813Z
tags:
  - 데이터베이스
---
# 서론
Flyway, Liquibase를 사용하면서 두 가지 툴을 비교해보자.
Flyway, Liquibase는 데이터베이스 마이그레이션 툴이다.

Liquibase 공식홈페이지에서도 이 [서로를 비교한 문서](https://www.liquibase.com/liquibase-vs-flyway)가있다.
![](/images/fae783bb-64da-41d0-83f7-8de82cbf7d1c-image.png)

# Flyway

순수 SQL 또는 Java 코드로 작성된 스크립트를 기반으로 하며 Gradle, Maven, CLI, JavaAPI로 실행할 수 있다.

그 밖에도 아래와 같은 특징들이 있다

- SQL을 이용하여 데이터베이스의 변경사항을 정의한다.
- Java 코드를 이용해서 데이터베이스를 변경하는 것이 가능하다.
- BLOB, CLOB 변경 또는 고급 대량 데이터 변경과 같은 복잡한 마이그레이션을 지원한다.
- 유료버전에서만 롤백을 지원한다.
- 선형적으로 버전을 관리하여 변경사항의 순서가 스크립트 이름에 따라 다르기 때문에 스크립트 파일의 명명규칙을 따라야한다.


# Liquibase
SQL, XML, YAML, JSON으로 작성할 수 있는 변경 로그 및 변경 집합 파일을 기반으로 한다.
Maven, Gradle 플러그인 및 CLI 를 지원한다.

그 밖에도 아래와 같은 특징들이 있다

- 추상화를 제공하여 서로 다른 기본 데이터베이스 기술이 서로 다른 환경에서 구동되는 경우에 적합하다.
- 무료버전에서 **diff**를 생성할 수 있다. / flyway는 diff를 생성할 수 없다.
  - intellij의 `jpa buddy` 플러그인에서 flyway의 diff를 지원한다고한다.
- 무료버전에서도 롤백을 지원한다.
- 고유한 식별체게를 사용하여 변경로그를 이용해 데이터베이스 변경순서를 쉽게 관리할 수 있다.
> diff : 두 개의 파일 간 차이에 대한 정보를 출력하는 파일 비교 유틸리티이다. 일반적으로 하나의 파일 버전과 동일한 파일의 다른 버전 간의 변경 사항을 보여주는 데 쓰인다.

# Reference
https://sabarada.tistory.com/193
https://ecsimsw.tistory.com/entry/Flyway%EB%A1%9C-DB-Migration
https://velog.io/@banjjoknim/DB-Migration-Tool
