---
title: RestAssured kotlin extension 트러블슈팅
description: 오랜만에 삽질기~ 삽질은 이렇게!!
date: 2024-07-30T08:34:12.850Z
tags:
  - '@RestAssured'
  - JPA
  - Spring Boot
---
# 서론

테스트코드를 작성할 생각에 싱글벙글하고있었는데 계속해서 에러가 터지는 바람에 머리를 쥐어싸고 장장 2시간동안 서칭하며 화를... 꾹 삭히다가 문제점을 발견하고 기록을 남겨본다.

(정리하다보니 행복해짐)

# 어쩌다가..

Kotlin + SpringBoot 프로젝트로 테스트를 작성하는 과정에서 실제 API를 호출하는 테스트를 쓰고싶었다.

기존에 Java에서 써왔던 RestAssured를 사용해볼까나? 하다가 [코틀린 Extension 모듈](https://github.com/rest-assured/rest-assured/wiki/Kotlin#kotlin-extension-module-for-spring-webtest)이 있길래 한번 사용해봤다.

![](/images/ad409c11-da38-42e2-9d01-18f6752a4e3b-image.png)

해당 Extention을 넣고 싱글벙글 테스트코드를 대충 써보고 한번 실행해봤다.

```kotlin
@ActiveProfiles("test", "no-fcm")
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class UserAcceptanceTest(
    @LocalServerPort
    private val port: Int,
) : StringSpec({
    extension(SpringExtension)
    val client = WebTestClient.bindToServer()
        .baseUrl("http://localhost:${port}")
        .build()

    val deviceId = "a1234567890"
    val accessToken = getAccessToken(client, deviceId)

    "/api/v1/users/me 요청을 수행한다" {
        "정상적으로 내 정보를 조회한다" {
            Given {
                webTestClient(client)
                header("Authorization", "Bearer $accessToken")
            } When {
                put("/api/v1/users/me")
            } Then {
                statusCode(200)
            }
        }
    }
})

```
그런데 이런 에러가 펑펑..!!

![](/images/9f99db6f-610e-4d4d-826a-b686cbb7e962-image.png)

뭔가 이상해서 그냥 아무것도없는 ContextLoad 테스트도 돌려봤는데 동일한 오류가 발생했다.

```kotlin
@SpringBootTest
@ActiveProfiles("test")
class PomoNyangApplicationTests {
    @Test
    fun contextLoads() {
    }
}
```

이건 필히 라이브러리에 뭔가 문제가 있다는것을 의미했다.

근데 라이브러리 호환안되니까 사용안해! 하고 넘어갈수도 있을법한 일이였는데.. 오늘따라 삽질이 땡겼나? 라이브러리 안쓸 생각은 안하고 왜 안되는지 찾아보기 시작했었다.

## jakarta 안녕?

에러 메시지를 눌러보다가 클래스명을 누르니 참조하는 클래스로 향하는것을 볼 수 있었다.

![](/images/1b402733-b097-4d46-bba3-78be6c5bca54-image.png)

음..? 이 클래스 값을 왜 못찾지? 하고 choose Target File을 눌러보니 두개의 의존성을 가진다는것을 알았다.

![](/images/237793aa-550e-4a1f-b204-bbb693104b94-image.png)

하나는 RestAssured extension의 `jakarta.jakartaee-web-api`였고 

![](/images/1a10bdf1-d556-4861-9f9e-f7d5e5287a9b-image.png)

다른 하나는 spring-boot-starter-data-jpa의 `jakarta.persistence`였다.

![](/images/8e04465a-774c-4515-9436-ec5c80fac6fa-image.png)

두 enum의 내용을 살펴보니 내용이 달랐다..!!

> Hibernate 6.2 버전부터 UUID GenerationType이 추가 되었다고 한다.
출처: https://www.baeldung.com/java-hibernate-uuid-primary-key

근데 하나는 `jakarta.jakartaee-web-api`에서 불러온거고 다른 하나는 `jakarta.persistence`에서 불러온거다. 타고들어간 클래스, 패키지가 같은게 좀 이상했다.

두개의 차이가 뭘까? 궁금해져서 jakarta 스펙을 살펴봤다.

> https://jakarta.ee/specifications/

`jakarta.jakartaee-web-api`는 Web에 도구들이 정의되어있다고한다.

> ![](/images/c46bb833-75da-4e8a-9b7d-fd9f28f4c2af-image.png)
> 
> [Jakarta EE Web Profile API v9.1.0 Java Docs](https://jakarta.ee/specifications/webprofile/9.1/apidocs/)

`jakarta.persistence`는 좀더 세부적인 분류로 영속성에만 필요한 도구들을 둔 모듈이라고 볼 수 있다.

> [Jakarta Persistence Module v3.1 Java Docs](https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/module-summary.html)
> 
> ![](/images/02ca1773-1445-41e1-8c6f-7e0d9f386c66-image.png)

두 명세를 보면 Jakarta EE의 몇 버전으로부터 Release 되었는지 볼 수 있다.
Jakarta EE 10 버전부터 내가 원하는 `Generation.UUID` 값이 들어가있으니 `jakarta.jakartaee-web-api` 버전도 거기에 맞게 10 버전으로 올려주면 되겠다는 생각이 든다.

[](https://jakarta.ee/specifications/persistence/3.1/apidocs/)

## 근본적인 문제 해결

위에서 찾아본 내용을 토대로 RestAssured에서 이 문제를 해결하면 좋겠다고 생각해서 PR을 올려봤다.

> 단 두줄..!! ㅋㅋㅋㅋ
https://github.com/rest-assured/rest-assured/pull/1800

나름 근거를 채워서 PR을 올려봤는데.. 뭔가 이해관계가 많이 얽혀있을거같은 이 느낌은 뭘까...

예상되는 답변으로 RestAssured 5.5에서는 Spring Framework 6에 대한 지원을 하지 않는다는 등의 답변이 나올거같은데 살짝 두렵달까 😅

그래도 재미있는 경험 많이 해서 좋았다.

## 여담

이것저것 찾아보는 김에 자잘하게 궁금한거 다 찾아봤다.

### Maven Repository의 Version, Updates

Maven Repository에서 라이브러리를 보다보면 Version, Updates라고 명시되어있는 버전이 있다.

[![](/images/9af8304b-a42a-4e9d-bf95-cccfc2eadd59-image.png)](https://mvnrepository.com/artifact/io.rest-assured/spring-web-test-client-kotlin-extensions/5.5.0)

Maven에 있는 Updates는 의존되어있는 버전의 최신 업데이트가 존재하는것을 의미한다. 강제로 업데이트 시킬수 있지만 기본적으로는 Version에 있는 버전을 사용한다고 한다.

> 참고: https://stackoverflow.com/questions/35354334/maven-dependencies-version-vs-updates

### 라이브러리 버저닝

![](/images/474ce425-55f8-47e2-a0ac-cb5dbeba9fdc-image.png)

Maven Repository를 보다보면 M1, M2, M3 ... 하면서 버저닝을 매겨둔것이 있었는데 이것의 의미는 Milestone의 약어라고한다. alpha버전? 정도의 의미라고 생각하면 될거같다.

`M` : Milestone (마일스톤, 베타/알파 같은 릴리즈 이름이다)
`RC` : Release Candidate (릴리즈 후보라고한다)


[위키피디아: Software versioning](https://en.wikipedia.org/wiki/Software_versioning)에 다양한 버저닝에 대한 이야기도 있었다.

![](/images/81ec660e-0522-4cf6-84ce-985802b5df05-image.png)

> 참고: https://stackoverflow.com/questions/3687208/what-does-m1-mean-in-a-maven-repository

# 결론

내가 트러블슈팅하던 저거는 WebTestClient를 사용하기 편하게 만드는 모듈인거같다.
MockMvc 편하게 쓰는 모듈도 있고~

그냥 RestAssured 쓸수 있게하는 모듈 있길래 이거쓸거같다.

문서: https://github.com/rest-assured/rest-assured/wiki/Kotlin#kotlin-extension-module

Maven Repo: https://mvnrepository.com/artifact/io.rest-assured/kotlin-extensions/5.5.0

# 후기

- Hibernate 6.2 릴리즈 변경사항에 대한 정보를 얻었다.
- 라이브러리 까보는 방법을 터득했다. 😁
- PR을 하나 올려봤다 (merge 여부는 음.. 뭐 상관없다 내가 알아보고 올린거에 만족)
- 오랜만에 삽질해서 신났다 🕺
