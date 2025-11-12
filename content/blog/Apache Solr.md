---
title: Apache Solr
description: >-
  서론  최근 프로젝트에서 Apache Solr 검색엔진을 적용할 일이 생겼다. 이참에 Solr에 대해 알아보는 시간을 가져보도록 하자. 
  설치 및 실행  환경은 M1 Mac으로 진행한다.  brew install solr  solr start  localhost:898
date: 2022-09-25T11:02:10.896Z
tags:
  - Solr
  - 검색
---
# 서론

![](/images/0aea9e72-153b-40f1-840e-1163dc70c113-image.png)

최근 프로젝트에서 Apache Solr 검색엔진을 적용할 일이 생겼다.
이참에 Solr에 대해 알아보는 시간을 가져보도록 하자.

# 설치 및 실행

환경은 M1 Mac으로 진행한다.

`brew install solr`

![](/images/ff33d7e1-1163-4e81-97e6-359697eb74e6-image.png)

`solr start`

![](/images/cef516e2-2e22-457f-874e-4a6988fb7d95-image.png)

localhost:8983으로 접속하면 솔라가 잘 실행된 것을 확인할 수 있다.
![](/images/9673490f-6ee4-44a0-9bde-1738c750f735-image.png)

---

# Solr 살펴보기

아파치 솔라(Apache Solr)는 자바로 개발된 오픈 소스 엔터프라이즈 검색 플랫폼이다.
주요 기능으로는 전문 검색, 강조, 실시간 인덱싱, 동적 클러스터링, 데이터베이스 연동, NoSQL 기능, 리치 도큐먼트(예: 워드, PDF) 관리가 포함된다.
`-위키백과-`

검색 애플리케이션을 만들기 위해 사용되는 오픈소스 라이브러리다.

## 특징 
- Restful API를 사용
  - HTTP 호출을 이용한 검색을 지원한다.
  - 결과값으로 JSON, XML, CSV 포맷을 지원한다.

- Full Text Search
  - 단어, 문장 등의 텍스트 검색
  - 오타교정, 검색어 자동완성, 와일드카드 질의 기능을 제공

- Flexible and Extensible
  - Java 메소드 오버라이딩을 통해 커스터마이징 가능

- NoSQL 데이터베이스
  - 큰 용량의 데이터 저장 가능
  - 여러 클러스터로 분산된 파일에 대한 분산 검색 처리

- Admin interface
  - 쉬운 사용을 위한 사용자 친화적 인터페이스 제공

- Highly scalable
  - 전체 클러스터에 replica 추가를 통한 쉬운 확장

## Architecture
![](/images/b4b5b85c-5c0e-4d9a-9208-6fc545cb6157-image.png)

**클러스터(Cluster)** : 하나 이상의 노드로 이루어진 가장 큰 시스템 단위
(독립적인 형태로 유지, 한 서버를 여러대의 클러스터가 구성할 수 있으며, 여러 대의 서버가 한 클러스터를 구성할 수도 있다)

**스키마(Schema)** : 색인할 문서의 필드, 필드 타입 정의

**인덱스 복제(Index Replication)** : 대규모 볼륨에 대한 분산 처리를 위해 마스터 인덱스의 전체 복사본을 하나 이상의 슬레이브 서버로 배포 및 업데이트하는 것

**샤드(Shard)** : 데이터를 분산하여 저장하는 단위

기타 주요 용어들은 [다른 블로그](https://blog.naver.com/PostView.nhn?isHttpsRedirect=true&blogId=hbdikei&logNo=220793625906&redirect=Dlog&widgetTypeCall=true)를 참고하자. ~~너무많아 ㅠ~~

## Core 생성
`solr create -c test`
![](/images/c29b962c-083c-4e5b-a226-072a51122de6-image.png)

brew로 설치했기 때문에 경로는
`/opt/homebrew/var/lib/solr/test`에 있다.

![](/images/8d84aec0-af64-49ed-b45c-49713e2d6c05-image.png)

다음 포스트에서 SpringBoot로 Solr를 사용하는 방법으로 이어가보자.

# Reference
https://dogrushdev.tistory.com/139
https://woongsin94.tistory.com/344
https://jetalog.net/51?category=650060
