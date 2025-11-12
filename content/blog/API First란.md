---
title: API First란?
description: API First Design과 Open Api Specificaion에 대해 알아보자
date: 2023-08-23T07:26:43.373Z
tags:
  - API 설계
  - yaml
  - 기획
  - 협업
---
# 서론

레벨3 피움 프로젝트를 진행하면서 팀원들과 Notion으로 API 명세를 작성했다.

![](/images/6f464ba3-ff9c-41ed-b13a-f45ada3b117f-image.png)

작업 과정에서 API 명세와 실제 구현된 API가 불일치하는 일이 있었고 이에 RestDocs를 이용한 문서화를 도입했다.

> 자세한 도입 과정은 [RestDocs로 API 문서화하기](https://velog.io/@junho5336/RestDocs%EB%A1%9C-API-%EB%AC%B8%EC%84%9C%ED%99%94%ED%95%98%EA%B8%B0) 글 참고

이렇게 되면서 다음과 같은 문제점들이 보이기 시작했다.

- 관리해야할 요소가 RestDocs, Notion 2가지로 늘어났다.
- RestDocs 내용을 바꾸려면 백엔드의 코드를 다시 배포해야한다.

# API First Design

> 본 글은 `2023 인프콘 : API First Design과 Codegen 활용하기`를 참고하여 작성한 글입니다.

API First Design에 대해 알아보자.

API First Design은 말 그대로 협업을 기반으로 API를 우선적으로 개발하는 방식을 의미한다.

> 그런데 레벨3 프로젝트를 진행하면서 Notion으로 API를 먼저 설계했었던 우리팀는 API First Design을 하고 있던 거 같은데..?

조금 더 세부적으로 이야기하자면 Open API Spec을 기반으로한 API 문서를 1순위로 설계하는방식이다.

## Open API Specification

Open API Specification (OAS)

> The OpenAPI Specification (OAS) defines a standard, language-agnostic interface to HTTP APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection. When properly defined, a consumer can understand and interact with the remote service with a minimal amount of implementation logic.

> 사람과 컴퓨터가 소스코드, 문서에 엑세스하거나 네트워크 트래픽 검사를 통하지 않고도 서비스의 기능을 발견하고 이해할 수 있는 언어에 구애받지 않는 HTTP API에 대한 표준 인터페이스를 정의한다.
[출처 - Swagger](https://swagger.io/specification/)

다시말해 OAS는 언어에 구애받지 않는 HTTP API 표준 인터페이스라고 할 수 있다.

## 협업

API First Design를 설명하는 글을 다시 읽어보자

API First Design은 말 그대로 **협업을 기반**으로 API를 우선적으로 개발하는 방식을 의미한다.

협업을 기반으로 API 명세를 작성해야한다. 그렇다면 누가 API를 디자인을 담당해야할까?
정답은 프론트엔드, 백엔드, 이해관계자 모두 다같이다.

# 시작하기

이제 프론트엔드, 백엔드, 이해관계자 다같이 토론을 하고, 공통된 양식의 문서를 작성하면서 API를 1순위로 설계하면 된다!

누가 무엇을 할지는 정했으니 어떻게 API 명세를 통일할 지 정해보자.

우선 API를 Yaml 형태로 Open API 명세서를 작성할 수 있다.
이후 Yaml 형태로 작성된 명세서를 CodeGen을 이용하여 원하는 형태의 언어/프레임워크 에 맞게 기반 코드를 생성할 수 있다.

[Swagger](https://swagger.io/), [Postman](https://www.postman.com/), [OpenAPI Generator](https://openapi-generator.tech/) 등 다양한 도구를 살펴볼 수 있다.

이 중 Swagger에서 제공하는 Editor의 도움을 받아 API 명세서를 작성해보도록 하자.

https://editor.swagger.io/

## 문서 시작하기

```yaml
openapi: 3.0.3 # open API 버전
info:
  title: Pium API Document # 문서 제목
  description: |-
    Pium Application API Document # 문서 본문
  version: 1.0.0 # 문서 버전
servers:
  - url: https://api.piuml.life # 서버 URL
tags: # 태그 목록
  - name: pet-plants
    description: 반려 식물 관련 API
```
위와 같이 문서 기본 정보를 생성할 수  있다.
문서에서 사용할 open api 버전을 명시하고 제목, 본문, 서버 주소 등을 명시할 수 있다.

## DTO 만들기

다음과 같이 DTO(Data Transfer Object) 를 정의할 수 있다.

```yaml
components:
  schemas:
    PetPlants: # 객체명
      title: 'PetPlants' # 객체 이름
      description: '반려 식물 목록 정보' # 설명
      properties: # 필드값
        data: # 필드 명
          type: array # 필드 타입
          items: # (배열인 경우) 내부 아이템
            type: object
            properties: # 필드값
              id: # 필드 명
                type: integer # 필드 타입
                example: 2 # 예시값
              nickname:
                type: string
                example: '기영이'
              imageUrl:
                type: string
                example: 'https://image.com'
              dictionaryPlantName:
                type: string
                example: '스투키'
              birthDate:
                type: string
                example: '2023-07-08'
              daySince:
                type: integer
                example: 95
```
> https://swagger.io/docs/specification/data-models/ 참고

![](/images/e312a742-40aa-4179-acec-e6b73efa9017-image.png)

## 인증정보 만들기

인증이 필요한 정보같은 경우 인증값을 넣어야한다.
이에 대한 Model을 component 영역에 만들 수 있다.

```yaml
component:
  # schemas:
  # ...
  securitySchemes:
    cookieAuth: # 별칭
      type: apiKey # 타입을 정한다. http, apiKey, openIdConnect 등이 있다.
      in: cookie # 인증정보가 담기는 장소. header, cookie 등이 있다.
      name: JSESSIONID  # 쿠키 혹은 인증정보의 이름
```

![](/images/6f97ee0e-f2c0-4b79-b81f-4eea3ed8a59d-image.png)

> https://swagger.io/docs/specification/authentication/ 참고

## get 요청 만들기

이제 간단한 get 요청을 명세해보자.

```yaml
paths: # 아래로 API Path를 명시한다
  '/pet-plants': # /pet-plants API에 대한 명세
    get: # HTTP get Method를 사용한다.
      tags: # 문서 초기부분에 작성해둔 태그로 구분지을 수 있다.
        - pet-plants
      summary: 반려 식물 목록 조회 # 설명
      security: # 인증정보를 표현한다.
        - cookieAuth: [ ] # 쿠키를 이용한 인증정보 (위에서 정의한 인증정보)
      responses:
        '200': # HTTP Status Code
          description: 요청 성공
          content: # 응답값
            applicaion/json:
              schema: 
                $ref: '#/components/schemas/PetPlants' # 참조할 객체의 경로
```
![](/images/c4711115-e775-4653-8365-29dbaa0f42ce-image.png)

responses 에서 components에 정의해둔 값을 가져다 쓸수도 있고 아래처럼 properties로 정의해서 사용할 수도 있다.

```yaml
...
  schema:
    properties:
      hello:
        type: string
        example: world
...
```

![](/images/041b7542-604c-4fbc-9bc5-07c628d988b3-image.png)

## post 요청 만들기

```yaml
paths: # 아래로 API Path를 명시한다
  '/pet-plants': # /pet-plants API에 대한 명세
      # get 요청
      # ...
      post:
        tags:
          - pet-plants
        summary: 반려 식물 목록 조회
        requestBody: # RequestBody를 명시한다.
          description: '반려 식물 생성 요청'
          content:
            applicaiton/json:
              schema:
                $ref: '#/components/schemas/PetPlantCreate'
        responses:
          '201':
            description: '요청 성공'
```

requestBody 항목을 제외하고는 get요청과 크게 다를게 없다.

# Code Generator

OpenAPI Genertor를 이용하면 이렇게 작성한 문서를 코드로 변환할 수도 있다.

[OpenAPI Generator](https://openapi-generator.tech/)

## Spring 프로젝트로 변환하기

> 작성한 예시코드 전체는 아래 discussion에서 확인해볼 수 있다.
[Pium Open API Document 도입에 대한 discussion](https://github.com/woowacourse-teams/2023-pium/discussions/312)

![](/images/32867b8a-fdb0-49e2-ab87-586d77cf3609-image.png)

홈페이지에 가이드가 잘 되어있어 설치과정은 생략하겠다.

> `brew install openapi-generator`로 설치하여 진행했다.
각자의 상황에 맞게 설치해서 사용하면 된다.

![](/images/34177133-cac6-4918-b699-cff666aa4aee-image.png)

yaml 코드를 로컬에 작성해준다.

![](/images/0870a6ab-c384-4de7-a63b-4eddaf460313-image.png)

```shell
openapi-generator generate -i pium.yaml -g spring -o .
```

![](/images/6b74f9b1-131d-4474-9f67-62628a633076-image.png)

![](/images/4fe5fa10-b367-4b02-ac92-3dfeb92685df-image.png)

위 구문을 통해 명세를 기반으로한 spring 프로젝트를 생성할 수 있다.

![](/images/8f719832-76fd-4d85-bd0d-3c9d63855699-image.png)

해당 프로젝트에 정의된 API 인터페이스와 Model을 활용하여 빠르게 개발을 진행할 수도 있을 것 같다.

## 다른 프로젝트로 변환하기

spring 뿐만 아니라 typescript와 같은 클라이언트단 프로젝트, MySQL같은 DB 스키마도 생성할 수 있다.

### mysql-schema

```shell
openapi-generator generate -i pium.yaml -g mysql-schema -o .
```

![](/images/d1b4451b-3519-4658-8a59-b5faa755faac-image.png)

정의한 Model에 맞춰 CREATE TABLE 구문을 생성해준다.

![](/images/2e18edc6-0c3e-4ac4-8ccd-b56e110b7faf-image.png)

API에서 정의한 내용에 맞춰서 CRUD 구문도 생성해서 제공해주고 있다.

### typescript-axios

```shell
openapi-generator generate -i pium.yaml -g typescript-axios -o .
```
![](/images/f17ec681-0241-4b18-86a7-0d46a2362327-image.png)

![](/images/9b40241c-fbe8-4252-8583-cb8be0ad1e33-image.png)

typescript-axios를 이용해서 코드를 생성하면 api, common, base, configuration 등의 기반 코드를 제공한다.

> [openapi-generator 공식문서](https://openapi-generator.tech/docs/generators) 참고

# 정리

Open API 명세에 맞춰 yaml로 명세서를 작성해봤다.

아주 간단한 요청에 대해서만 작성해봤다.

![](/images/fd479474-e277-401f-b136-44e65950e8ae-image.png)

구문이 직관적이고 문서도 잘 되어있어서 작성하는 데 큰 어려움은 없었다.

OpenAPI Genertor까지 잘 활용해본다면 프로젝트를 시작할 때 명세서에 작성된 내용에서는 누락되는 내용 없이 개발을 진행할 수 있을 것 같다.

Maven, Gradle에서 plugin도 제공하고 있으니 참고하여 개발 간 적용해보면 좋을 것 같다.

> https://openapi-generator.tech/docs/plugins 참고

# Reference

https://happy-coding-day.tistory.com/entry/1-API-First-Design-%EC%84%A4%EA%B3%84%EC%9D%98-%EC%84%A0%EC%88%9C%ED%99%98

https://www.redhat.com/ko/topics/automation/what-is-yaml
