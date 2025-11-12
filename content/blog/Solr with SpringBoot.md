---
title: Solr with SpringBoot
description: >-
  서론 이전시간에 Solr를 설치하고 core를 만들어보는것 까지 진행했다.  순서가 좀 이상하긴 하지만... 문득 사용법을 정리하다보니
  검색엔진을 왜 써야하는지 궁금해졌다.  현재 회사에서 진행하는 프로젝트에서는 많은양의 정보를 검색하기 위해 사용한다고 하는데 포괄적으
date: 2022-10-02T10:23:46.842Z
tags:
  - Solr
  - Spring Boot
---
# 서론
이전시간에 Solr를 설치하고 core를 만들어보는것 까지 진행했다.

순서가 좀 이상하긴 하지만...
문득 사용법을 정리하다보니 검색엔진을 왜 써야하는지 궁금해졌다.

현재 회사에서 진행하는 프로젝트에서는 많은양의 정보를 검색하기 위해 사용한다고 하는데 포괄적으로 생각해봤을 때 왜 쓸까? 라는 궁금증이 생겼다.

DB에서 Like절로 조회하는것으로는 부족한건가?

몇가지 사례를 찾아보니 검색엔진의 필요성을 알게되었다.

- 의미있는 검색어

예를들어 `닭가슴살 5키로`라고 검색했을 때 SQL 질의어로는 `바로드숑 바로먹는 실온 닭가슴살 6가지맛 5키로` 를 찾을 수 없다.

이를 위해 검색엔진은 데이터 색인을 하고 의미있는 검색을 할 수 있게 도와준다.

![검색엔진 동작](/images/ff521bf4-ae8e-4862-a94c-01ee639603e2-image.png)

> 색인 : 색인은 책 속의 낱말이나 구절, 또 이에 관련한 지시자를 찾아보기 쉽도록 일정한 순서로 나열한 목록을 가리킨다.

그치만 설치하고 Core를 생성했다고만해서 Solr를 어떻게 써먹는건지 감이 잘 안온다.

---

# 색인 준비

색인을 하기 위해서 Schema의 Field를 생성해준다.

![](/images/8ad20c5d-17dd-468f-b9ce-6be08e7f9d34-image.png)

간단하게 title이라는 field를 추가해보자.
![](/images/0122e63c-b1b2-42c5-bb6a-7c09c652ad34-image.png)

![](/images/9318df70-4971-4567-83dc-42388a5fdcaf-image.png)

Field는 DB의 Column과 비슷한 개념이라고 생각하면 된다.

---

# SpringBoot에 Solr 적용하기

이제 SpringBoot에 Solr를 적용해보자.
[해당 과정](https://www.baeldung.com/spring-data-solr)을 참고했다.

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-solr</artifactId>
    <version>4.3.15</version>
</dependency>
```
```
implementation group: 'org.springframework.data', name: 'spring-data-solr', version: '4.3.15'
```


> 위 라이브러리만 설치하면 아래와 같은 문제가 발생한다.
![](/images/c7aa3f88-87ff-40ad-acdb-32912de36d8e-image.png)
[도와줘요 stack overflow](https://stackoverflow.com/questions/49271724/noclassdeffounderror-org-codehaus-stax2-ri-stax2writeradapter-using-jackson)
자세히는 모르겠지만 대략적으로 stax2 라이브러리에 의존하고있어 해당 라이브러리도 같이 넣어줘야 한다.

``` xml
<dependency>
    <groupId>org.codehaus.woodstox</groupId>
    <artifactId>stax2-api</artifactId>
    <version>4.2.1</version>
</dependency>

```

```
implementation group: 'org.codehaus.woodstox', name: 'stax2-api', version: '4.2.1'
```

---
이제 실제 사용을 해보자


흐름은 다음과 같다.

아주아주 간단한 예제로 동작하는 것을 확인해볼 것이다.

![](/images/fb47a345-6dfb-4702-b3cf-5872c5b31759-image.png)

Solr Config
``` java
@Configuration
@EnableSolrRepositories(basePackages = "com.junho.junhomepage.index")
@AllArgsConstructor
public class SolrConfig {

    @Bean
    public SolrClient solrClient() {
        return new HttpSolrClient.Builder("http://localhost:8983/solr").build();
    }

    @Bean
    public SolrTemplate solrTemplate(SolrClient client) throws Exception {
        return new SolrTemplate(client);
    }
}
```

Board Entity
``` java
@Entity
@Getter @Builder
@AllArgsConstructor @NoArgsConstructor
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;
}
```

Index Entity
``` java
@SolrDocument(collection = "test")
@Getter @Setter
@Builder @AllArgsConstructor @NoArgsConstructor
public class Index {

    @Id
    @Indexed
    private String id;

    @Indexed
    private String title;
}
```

Board Controller
``` java
@RestController
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final IndexRepository indexRepository;

    @GetMapping("/list")
    public Iterable<Index> list() {
        return indexRepository.findAll();
    }

    @PostMapping("/create")
    public void create(){
        boardService.create();
    }

    @DeleteMapping("/delete")
    public void delete() {
        boardService.deleteAll();
    }

}
```

Board Service
``` java
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final IndexRepository indexRepository;

    public void create() {
        for (int i = 0; i < 10; i++) {
            Board board = Board.builder()
                    .title("title" + i)
                    .description("description")
                    .build();
            boardRepository.save(board);
            indexRepository.save(Index.builder()
                    .title(board.getTitle())
                    .build());
        }
    }

    public void deleteAll() {
        boardRepository.deleteAll();
        indexRepository.deleteAll();
    }
}
```

DB에 데이터가 추가될 때 Solr에서 동일하게 데이터를 추가
삭제할 때도 마찬가지로 Solr에서 동일하게 데이터를 관리해줘야한다.
데이터를 조회할 때는 Solr 색인을 이용하여 조회한다.

---

# 동작

처음에는 아무런 데이터가 없다.
![](/images/c25f0a21-3f78-48cd-9b34-c1a73d51d8b8-image.png)

POST : `localhost:8080/create`

아래처럼 데이터가 추가된 것을 확인할 수 있다.
![](/images/5acd8f35-0f0d-4f92-82f6-37f5921f0a8f-image.png)

![](/images/caa2143e-13ba-4a44-b7d1-e090d82c5730-image.png)

DELETE : `localhost:8080/delete`

![](/images/11a200bf-093e-4cbd-95c3-c0da3b6f652e-image.png)

삭제도 잘 진행된다.

---

# 결론
Solr에 대해 찾아보면서 Elasticsearch에 대해서도 얼핏 확인할 수 있었다.

![](/images/465f2679-38f2-48ac-9beb-70bc906bdbfb-image.png)

solr는 큰 데이터를 색인하는데 용이하다는 장점이 있고, elasticsearch는 인덱싱 속도가 비교적 빠르다는 장점이 있다.

상황에 맞게 검색엔진이 필요할 경우 무엇을 선택해야할지 까지 고민해 봐야겠다.

---

# Reference
https://shanepark.tistory.com/357
https://solr.apache.org/guide/8_11/solr-tutorial.html
[이커머스에서 검색엔진이 필요한 이유](https://medium.com/29cm/%EC%9D%B4%EC%BB%A4%EB%A8%B8%EC%8A%A4%EC%97%90%EC%84%9C-%EA%B2%80%EC%83%89%EC%97%94%EC%A7%84%EC%9D%B4-%ED%95%84%EC%9A%94%ED%95%9C-%EC%9D%B4%EC%9C%A0-1c4abebd7f24)
http://www.tcpschool.com/webbasic/searchengine
https://www.baeldung.com/spring-data-solr
https://dattell.com/data-architecture-blog/solr-vs-elasticsearch/
