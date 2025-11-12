---
title: SpringBoot에 JWT 적용
description: 회원 인증을 위한 JWT Token을 생성 및 검증하는 코드를 작성해보자.
date: 2022-06-29T09:29:29.095Z
tags:
  - JWT
  - Java
  - Spring Boot
---
# 서론

회원 인증을 위한 JWT Token을 생성 및 검증하는 코드를 작성해보자.
https://github.com/jwtk/jjwt#quickstart 를 참고하였고
사용할 라이브러리는 `'io.jsonwebtoken:jjwt-jackson:0.11.5'`이다.

Maven
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```
Gradle
```
dependencies {
    compile 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtime 'io.jsonwebtoken:jjwt-impl:0.11.5',
    // Uncomment the next line if you want to use RSASSA-PSS (PS256, PS384, PS512) algorithms:
    //'org.bouncycastle:bcprov-jdk15on:1.70',
    'io.jsonwebtoken:jjwt-jackson:0.11.5' // or 'io.jsonwebtoken:jjwt-gson:0.11.5' for gson
}
```
---
# 본론

## 기본키 생성
기본키를 생성한다.
key값을 코드에 노출시키는 방식이 좋은 방식은 아니지만 일단 적용방법을 간편히 하기 위해 String으로 작성한다.
``` java
private final String baseKey = "thisisdummykeythisisdummykeythisisdummykeythisisdummykeythisisdummykey";
private final SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
private Key createKey() {
    byte[] apiKeySecretBytes = DatatypeConverter.parseBase64Binary(baseKey);
    Key signingKey = new SecretKeySpec(apiKeySecretBytes, signatureAlgorithm.getJcaName());
    return signingKey;
}
```

> SHA256과 같은 방식으로 암호화된 데이터를 키값으로 다루려면 아래 방식을 참고하면 된다.
--- 
HMAC-SHA(hash-based message authentication code) 알고리즘을 사용하여 JWS에 서명하는 경우 이를 SignWith 메서드 인수로 사용하려면 SecretKey 인스턴스로 변환해야 합니다.
![](/images/93dadab8-d4c7-4645-8f1c-af7a2519327c-image.png)

> **key값이 256bit가 넘어가지 않으면 WeakKeyException이 뜬다**
io.jsonwebtoken.security.WeakKeyException: The signing key's size is 72 bits which is not secure enough for the HS256 algorithm.  The JWT JWA Specification (RFC 7518, Section 3.2) states that keys used with HS256 MUST have a size >= 256 bits (the key size must be greater than or equal to the hash output size) ...

## Jwt 생성

본 예시에서는 가벼운 예시를 들기 위해 private claim만 생성해본다.
Jwts...setExpiration() 이 받는 인자가 Date 형태이므로 expireTime은 Date 형태로 지정한다.
- getTime() + 60 * 1000으로 (1시간)

``` java
public String createJwt(HttpServletRequest request) throws Exception {
    Map<String, Object> headerMap = new HashMap<String, Object>();
    headerMap.put("typ", "JWT");
    headerMap.put("alg", "HS256");

    Map<String, Object> claims = new HashMap<String, Object>();
    claims.put("name", request.getParameter("name"));
    claims.put("id", request.getParameter("id"));

    Date expireTime = new Date();
    expireTime.setTime(expireTime.getTime() + 1000 * 60 * 1);

    JwtBuilder builder = Jwts.builder()
            .setHeader(headerMap)
            .setClaims(claims)
            .setExpiration(expireTime)
            .signWith(createKey(), signatureAlgorithm);

    String result = builder.compact();
    System.out.println("serviceTester " + result);
    return result;
}
```

> SpringBoot에 JWT를 적용시키려고 했는데 signWith 함수가 Deprecated 되어있는것을 볼 수 있었다.
![Deprecated Method](/images/9ab179c5-3de2-44b1-8892-504f9835441d-image.png)
내부를 보니 0.10.0 버전부터 파라미터의 Key, SignatureAlgorithm 순서가 바뀐 함수로 대신한다고 한다.
![DeprecatedMethod](/images/bf848a0e-ad43-401a-ac73-879c873fafde-image.png)

## JWT 검증

아래와 같은 방식으로 검증을 진행한다.
```java
public Boolean checkJwt(String jwt) throws Exception {
    try {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(DatatypeConverter.parseBase64Binary(baseKey))
                .build()
                .parseClaimsJws(jwt)
                .getBody();
        System.out.println("Id : " + claims.get("id"));
        System.out.println("Name : " + claims.get("name"));
    } catch (ExpiredJwtException e) {
        e.printStackTrace();
        return false;
    } catch (JwtException e) {
        e.printStackTrace();
        return false;
    }
    return true;
}
```
한가지 유의할 점이 있는데 여기서 사용하고 있는것은 서버의 private key로 서명한것을 토큰화 한 JWS인것을 인지하고있어야한다.
아래 사진을 보면 `parseClaimsJws`와 `parseClaimsJwt` 메서드가 존재한다.

![](/images/788b8bee-650c-4b02-86e4-0e15b1e754f5-image.png)

만약 여기서 parseClaimsJwt를 사용한다면 `UnsupportedJwtException`이 발생할 수 있으니 유의하길 바란다.

---
# 결론
라이브러리를 이용해 아주 간단한 방식으로 jwt의 기본적인 생성, 검증부분을 작성했다.
현 시점을 기준으로 Deprecated 되지 않은 메서드를 사용한 예제를 찾기 힘들어서 직접 라이브러리 제작자의 github까지 찾아갔는데 생각보다 메뉴얼이 잘되어있어서 참고가 많이 되었다.
위 라이브러리 외에도 jwt와 관련된 다양한 라이브러리들이 제공되고있다.
https://jwt.io/libraries 를 참고하여 사용중인 언어, 프레임워크에 적합한 라이브러리를 찾아 사용해보는것도 괜찮아보인다.

---
# 코드 전문

``` java
private final String baseKey = "thisisdummykeythisisdummykeythisisdummykeythisisdummykeythisisdummykey";
private final SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

private Key createKey() {
    // signiture에 대한 정보는 Byte array로 구성되어있습니다.
    byte[] apiKeySecretBytes = DatatypeConverter.parseBase64Binary(baseKey);
    Key signingKey = new SecretKeySpec(apiKeySecretBytes, signatureAlgorithm.getJcaName());
    return signingKey;
}

public String createJwt(HttpServletRequest request) throws Exception {
    Map<String, Object> headerMap = new HashMap<String, Object>();
    headerMap.put("typ", "JWT");
    headerMap.put("alg", "HS256");

    Map<String, Object> claims = new HashMap<String, Object>();
    claims.put("name", request.getParameter("name"));
    claims.put("id", request.getParameter("id"));

    Date expireTime = new Date();
    expireTime.setTime(expireTime.getTime() + 1000 * 60 * 1);

    JwtBuilder builder = Jwts.builder().setHeader(headerMap).setClaims(claims).setExpiration(expireTime).signWith(createKey(), signatureAlgorithm);

    String result = builder.compact();
    System.out.println("serviceTester " + result);
    return result;
}

public Boolean checkJwt(String jwt) throws Exception {
    try {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(DatatypeConverter.parseBase64Binary(baseKey))
                .build()
                .parseClaimsJws(jwt)
                .getBody();
        System.out.println("Id : " + claims.get("id"));
        System.out.println("Name : " + claims.get("name"));
    } catch (ExpiredJwtException e) {
        e.printStackTrace();
        return false;
    } catch (JwtException e) {
        e.printStackTrace();
        return false;
    }
    return true;
}
```

---

# Reference
https://github.com/jwtk/jjwt#quickstart
https://mine7717.tistory.com/23
https://velog.io/@dae-hwa/JWTJSON-Web-Token-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0
