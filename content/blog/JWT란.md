---
title: JWT란?
description: >-
  서론 Spring Boot를 익힐 겸 Spring Security를 이용해 Jwt토큰을 생성하는 예제를 남겨두고자 한다. 해당 블로그를
  참고하여 작성하였다. > 본격 따라하기...! 사실 처음이라 따라하면서 이해하기도 벅찼다...  JWT란? 우선 JWT가 무엇인지 부
date: 2020-09-05T10:00:37.874Z
tags:
  - JWT
  - Spring Boot
---
# 서론
JWT 토큰에 대해 알아보도록 하자.

# JWT란?
우선 JWT가 무엇인지 부터 알고 넘어가보자

JWT (Java Web Token)는 클라이언트와 서버가 통신할 때 권한 인가를 위해서 사용하는 토큰이다.
구조는 아래와 같이 생겼다.
```
header.payload.signature
```
.을 기준으로 세 부분으로 나눠져있다.

## Header

JWT를 검증하는 데 필요한 알고리즘, 타입 등이 담겨있다. 이 부분은 `base64`로 인코딩된다.
typ : 토큰의 타입을 지정한다. (JWT)
alg : 해싱 알고리즘을 지정한다. 해당 부분은 토큰을 검증할 때 사용되는 signature 부분에서 사용된다.
```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```

---

## Payload

JWT의 내용으로 Payload에 있는 속성들을 Claim Set이라고 부른다. (각 속성은 claim 이라고 부른다)
Claim Set은 클라이언트의 정보, 생성일시, 만료기간 등 JWT에 대한 내용을 포함하고있다.<br />

claim은 name/value로 구성되어있으며 세 분류로 나누어져있다.
해당 분류는 필수적이 아닌 선택적인 내용들이다.

### Registered claim
이름이 이미 정해져있는 claim들을 의미한다.
`iss`: 토큰 발급자 (issuer)
`sub`: 토큰 제목 (subject)
`aud`: 토큰 대상자 (audience)
`exp`: 토큰의 만료시간 (expiraton), 시간은 NumericDate 형식으로 되어있어야 하며 (예: 1480849147370) 언제나 현재 시간보다 이후로 설정되어있어야합니다.
`nbf`: Not Before 를 의미하며, 토큰의 활성 날짜와 비슷한 개념입니다. 여기에도 NumericDate 형식으로 날짜를 지정하며, 이 날짜가 지나기 전까지는 토큰이 처리되지 않습니다.
`iat`: 토큰이 발급된 시간 (issued at), 이 값을 사용하여 토큰의 age 가 얼마나 되었는지 판단 할 수 있습니다.
`jti`: JWT의 고유 식별자로서, 주로 중복적인 처리를 방지하기 위하여 사용됩니다. 일회용 토큰에 사용하면 유용합니다.

### Public claim
Public claim은 공개적으로 사용하기 위해 정의된 public API와 같다고 보면된다.
서버에서 정의한 내용과 클라이언트에서 해석하는 내용이 다른 경우 즉, 충돌이 일어나는 것을 방지하기 위해서 claim 이름을 URI 형식으로 짓는다.

```json
{
   "https://junho.com/claims/is_admin": true
}
```

### Private claim
클라이언트와 서버 간 협의 하에 사용되는 claim 이름들을 말한다.
이름이 중복되어 충돌이 발생할 수 있으므로 사용할 때 유의해야한다.
```json
{
    "username": "junho"
}
```

### base64 padding
base64로 인코딩을 할 경우 `abc==eirlv`과 같이 `=`문자가 포함될 때가 있다. 이는 base64인코딩의 padding문자라고 한다.
이 문자의 경우 url-safe하지 못하므로 제거해줘야한다.
> `=` 문자를 제거하더라도 디코딩 시 문제가 되지 않는다.
base64에 대한 자세한 내용은 [여기](https://ko.wikipedia.org/wiki/%EB%B2%A0%EC%9D%B4%EC%8A%A464)에..ㅎㅎ😅

---

## Signature

Signature는 Header 인코딩 값, Payload의 인코딩값을 합친 후 비밀키로 해싱을 해서 생성한다.
Signature는 아래와 같은 방식으로 생성된다
```json
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  your-256-bit-secret
)
```

https://jwt.io/ 에서 jwt 토큰이 어떻게 형성되는지 직접 확인해볼 수 있다.

---
> **JWS 서명 (JWS Signature)**
**JWS 페이로드 (JWS payload / claim set)**
**JOSE 헤더 (JOSE Header)**
이것들이 무엇이고 왜 구분되는지 알아봅시다
JOSE, JWE, JWS, JWT??

---

## 동작 시나리오

![jwt 설명 사진](/images/b99a7635-13a1-4c52-aae6-fad5b9b0040f-image.png)

1. Client에서 유저 정보를 가지고 Server로 POST 요청을 한다.
2. Server단에서는 받은 정보와 secretkey를 통해 JWT Token을 생성한다.
3. Client는 JWT 토큰을 받는다.
4. Client는 해당 토큰을 헤더에 담아서 요청한다.
5. Server는 해당 토큰이 유효한지 확인하고 반환한다.

---

# Reference
https://velopert.com/2389
https://meetup.toast.com/posts/239
https://auth0.com/docs/tokens/json-web-tokens/json-web-token-claims#public-claims
https://stackoverflow.com/questions/49215866/what-is-difference-between-private-and-public-claims-on-jwt/49215907
https://ko.wikipedia.org/wiki/%EB%B2%A0%EC%9D%B4%EC%8A%A464
