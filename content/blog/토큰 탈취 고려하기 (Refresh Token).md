---
title: 토큰 탈취 고려하기 (Refresh Token)
description: SpringBoot를 이용하여 Refresh Token을 구현해보자.
date: 2022-10-25T13:42:09.522Z
tags:
  - JWT
---
# 서론

지난 시간 Access 토큰 발급을 이용한 인증방식을 구현해보았다.
BackEnd의 입장만 생각하면 단순히 JWT Access 토큰을 발행하고 인증하여 유저를 구분하면 된다고 생각할 수 있다.

하지만 토큰이 탈취된다고 생각해보면 공격자가 사용자의 정보가 자유롭게 핸들링하는 정말 아찔한 상황이 연출된다.

그렇다면 어떻게 이러한 상황을 보완할 수 있을까?

# Refresh Token

JWT는 무상태성이라는 특성 덕분에 서버측에서 토큰에 대한 정보를 가지고있지 않기 때문에 클라이언트가 정말 본인인지 확인할 겨를이 없다.

때문에 우리는 Access 토큰의 만료시간을 짧게 하여 공격자가 유의미한 공격행위를 할 수 없도록 차단하는 방법을 생각할 수 있고 이때 만료된 토큰을 재발급하기 위해 Refresh Token을 도입할 수 있다.

1. Access Token의 유효기간을 짧게 설정한다.

2. 유효기간이 긴 Refresh Token을 이용한다.

위 과정대로라면 정상적인 사용자는 Access Token이 만료되었을 때 Refresh Token을 사용하여 Access Token을 재발급 받는 시나리오로 인증을 진행할 수 있다.

cafe 24의 OAuth 인증과정 중 토큰 재발급 항목을 참고하여 이해해보도록 하자.

![cafe24 토큰갱신](/images/200f92ee-cb69-4b26-a17d-ce6c05d0d5bd-image.png)

![](/images/fd68c619-bf9c-46a2-9c48-83866dadd844-image.png)

### Refresh Token 탈취?

그렇다면 문득 이런 고민을 가질 수 있다. 

그렇다면 Refresh Token이 탈취당하면 어떻게 대응하죠?

> Access 토큰의 탈취를 고려하여 Refresh Token을 만들었으니 Refresh Token의 탈취를 고려해서 Refresh-Refresh Token을 만들고 Refresh-Refresh Token의 탈취를 고려해서 Refresh-Refresh-Refresh Token을...😵‍💫

아래를 보면 리프레시 토큰만 탈취되는 경우를 대비해 인증 과정에서 추가적인 정보를 조합하여 부수적인 처리를 하고 있는 것을 확인할 수 있다.

![](/images/839c5188-8d5f-4a02-a871-3d1e831ad7f3-image.png)

이 방식에 대해서는 [네이버의 토큰갱신](https://developers.naver.com/docs/login/devguide/devguide.md#5-1-2-%EA%B0%B1%EC%8B%A0-%ED%86%A0%ED%81%B0%EC%97%90-%EB%8C%80%ED%95%98%EC%97%AC), [카카오의 토큰갱신](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#refresh-token), [cafe24의 토큰갱신 ](https://developers.cafe24.com/app/front/develop/oauth/retoken)등 기업에서 다양한 방법들을 참고해 볼 수 있다. 
구현 방식은 보안정책에 따라 구현방식이 달라질 수 있음을 염두에 두고 확장가능성을 함께 고려해볼 수도 있겠다.

_**지금은 OAuth가 아닌 단순히 Refresh Token을 어떻게 관리하냐에 대한것에 중점을 두고있음을 다시 한번 인지하고 가볍게 훑고 넘어가자.
OAuth에 대한 자세한 내용은 나중에 이해할 일이니 너무 급하게 생각하지 말자**_

> 아니 그러면 클라이언트 아이디, 클라이언트 시크릿까지 탈취되면 소용없는거 아닌가요? 😡 라고 할수도 있다. ~~그렇게 따지면 누군가 서버실에 걸어들어가서 정보를 털어가면 모든 보안이 무용지물이죠...😭~~
[세상에 완벽한 보안은 없다. 보안은 최종 목표가 아니라 여정이다.](https://blog.ahnlab.com/1587)
처음부터 완벽한 보안이란 것은 없다. 우리는 꾸준한 여정을 통한 보완을 해나가는 것을 목표로 해야한다.

# 구현 과정 생각하기

Refresh 토큰을 사용하고 재발급하는것도, 추가적인 인증정보를 사용하는것도 알겠다.
그렇다면 이제는 백엔드의 인증 구현에 집중해볼 차례다.

인증 프로세스를 다시한번 확인해보자.

![](/images/33f24203-aaac-41df-9e21-a65ec800c3d7-image.png)

Refresh 토큰의 인증을 간단하게 보면 다음과 같이 진행할 것이다.

1. Access 토큰을 검증하여 유저 확인
2. DB에서 해당유저 Refresh 토큰 가져오기
3. Refresh 토큰 비교하여 검증

이때 DB에 Refresh Token을 저장하고 사용해야될텐데 만료시간을 관리할 때 RDBMS(관계형 데이터베이스 관리 시스템)를 사용한다면 TTL(Time To Live)을 지정하는데 어려움이 있다.
따라서 우리는 토큰의 만료시간 관리를 위해 NoSQL사용을 고려할 수 있다.

이때 NoSQL은 사용 경험이 조금 있는 Redis를 사용하고자한다.

> 이 과정에서 한가지 고민이 생겼다.
- Refresh 토큰의 만료시간을 하나의 흐름으로 관리하기위해 Refresh 토큰을 JWT로 발급한다.
- NoSQL의 TTL을 이용하여 Refresh 토큰을 일정 시간만큼만 저장한다.

> 1번째 방법은 토큰 자체에서 만료시간을 관리하니 별도로 NoSQL을 사용하지 않아도 된다고 판단되어 생각한 방식이다.
하지만 Access, Refresh 모두 탈취당하면? 이 때는 2번째 방법을 이용한다면 NoSQL을 이용해 보다 싼 비용으로 Refresh 토큰을 강제로 만료시킬 수 있다.

> 이러한 이유 때문에 UUID를 이용한 랜덤 키값을 생성해 Refresh 토큰을 생성하고 NoSQL에서 이를 관리하는 방식을 사용하기로 결정했다.
 
> 그동안 계속 어? 하던 고민이였는데 정리하고보니 한결낫다 ㅎㅎ😅

실습 과정은 [이전 글](https://velog.io/@junho5336/SpringBoot-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0-with.-SpringSecurity-JWT)에서 진행한 코드에서 이어진다.


# 구현 진행

## 1. 프로젝트 구조 확인

실습을 따라 진행중이라면 구조가 변경되는 모습에 헷갈리지말고 천천히 잘 따라와주길 바란다.

패키지 구조는 다음과 같다.

![](/images/384bd934-aea9-4700-9ce5-76d541f04377-image.png)


## 2. Redis 사용하기

### pom.xml

Redis를 사용하기 위해 pom.xml에 다음 라이브러리를 추가한다.
``` xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <version>2.7.5</version>
</dependency>
```

### application.yml

Redis의 기본 포트는 6379이다.

``` yaml
spring:
  redis:
    host: localhost
    port: 6379
```

> [해당 글](https://jeong-pro.tistory.com/175)에 따르면 springboot 2.0 이상부터 redisConnectionFactory, RedisTemplate 등이 auto-configuration으로 생성되기 때문에 굳이 RedisConfiguation을 따로 만들지 않아도 사용 가능하다고 한다.
![](/images/1a4aff60-ee14-4910-a89e-eee29cc3b12d-image.png)
>> 자동완성이 뜨는것을 보면서 미루어 짐작하고있었는데 혹시? 하던 부분을 어느정도 확신하게 되었다.


### RedisConfig
만약 SpringBoot 2.x 이하의 버전을 사용하거나 auto-configuration을 믿지 못하겠다면 아래 설정을 추가해주면 된다.
~~안해줘도 돌아간다~~
``` java
@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    // Transaction 사용을 위해 redisTemplate를 이용한 방식을 적용한다.
    @Bean
    public RedisTemplate<?, ?> redisTemplate() {
        RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        return redisTemplate;
    }
}
```

## 3. Token 구성

구성하기 전 잠시 진행간 애로사항을 공유하고 넘어가려고한다.

예상한 방식은 아래와 같이 Redis의 Hash를 이용해 각 멤버별 TTL을 지정하는 방식을 생각하고 있었다.
``` text
RefreshToken [
{ account : tokenValue,
account : tokenValue,
account : tokenValue ... }
]
```

하지만 Redis에서 해당 기능은 유료라고한다...
[참고 글](http://redisgate.kr/redis/command/expire.php)

![](/images/802805e5-c6a5-4290-9dd5-be5e9603488c-image.png)

그렇다고 방법이 없는건 아니다.
refresh:account - key - Value 와 같은 방식으로 구분하는 방법을 생각해볼 수 있다. 실제로 나같은 고민을 누군가 했는지 아래 나올 `@RedisHash`를 이용해 이러한 문제를 보다 쉽게 해결할 수 있다.

JPARepository를 사용해봤다면 거의 동일한 방식으로 사용할 수 있다.

### Token

`@RedisHash`의 인자가 위에서 언급한 refresh: 부분이 된다.
아래처럼 지정하면 refreshToken:id - key - value로 값이 저장된다.
id는 유저별로 가지고있는 고유 key값을 사용해야할 것이다.

> account를 unique로 지정해놔서 사용해도 되겠지만 그래도 PK값을 사용하는게 더 확실해보여 PK값을 사용하려고한다.

``` java
@Getter
@RedisHash("refreshToken")
@Builder @AllArgsConstructor @NoArgsConstructor
public class Token {

    @Id
    @JsonIgnore
    private Long id;

    private String refresh_token;

    @TimeToLive(unit = TimeUnit.SECONDS)
    private Integer expiration;

    public void setExpiration(Integer expiration) {
        this.expiration = expiration;
    }
}
```
> `expireation`에 대해 한번 짚고 넘어가자.
`@TimeToLive`어노테이션을 지정해 토큰의 TTL을 결정할 수 있다.
`TimeUnit.DAYS`, `TimeUnit.SECONDS` 등 여러 단위에 맞춰 조정할 수 있으니 설정간 참고하면 좋을 것 같다.

> Refresh Token하나만 있는데 요란하게 Token 클래스까지 만드냐고 생각했다.🤔
조금 더 생각해보니 나중에 Refresh Token에 관리되는 추가적인 인증요소가 생기는 상황에 대비한 확장 가능성도 생각해볼 수 있겠다는 생각에 스스로 설득당했다.😅

### TokenRepository

CRUDRepository를 확장하면 save, findBy 등등의 동작을 수행할 수 있다.

```java
public interface TokenRepository extends CrudRepository<Token, Long> {
}
```

### TokenDto

요청/응답을 위한 DTO도 만들어준다.

```java
@Getter
@Builder @AllArgsConstructor @NoArgsConstructor
public class TokenDto {
    private String access_token;
    private String refresh_token;
}
```

## 4. 인증 구현

### Member

멤버 엔티티에 Refresh Token 항목이 추가되었다.
``` java
@Entity
@Getter
@Builder @AllArgsConstructor @NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String account;

    private String password;

    private String nickname;

    private String name;

    @Column(unique = true)
    private String email;

    private String refreshToken; // 추가!

    @OneToMany(mappedBy = "member", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Authority> roles = new ArrayList<>();

    public void setRoles(List<Authority> role) {
        this.roles = role;
        role.forEach(o -> o.setMember(this));
    }

    public void setRefreshToken(String refreshToken) { // 추가!
        this.refreshToken = refreshToken;
    }
}
```

### SignResponse

String 형태로 달랑 하나 있던 토큰을 TokenDto로 반환한다.

``` java
@Getter
@Builder @AllArgsConstructor @NoArgsConstructor
public class SignResponse {

    ...
    
    private TokenDto token;

    public SignResponse(Member member) {
        this.id = member.getId();
        this.account = member.getAccount();
        this.nickname = member.getNickname();
        this.name = member.getName();
        this.email = member.getEmail();
        this.roles = member.getRoles();
    }
}
```

### SignService

Refresh Token은 어찌됐건 DB를 한번 거쳐야하므로 Transaction 관리를 위해 Service단에서 구현한다.

``` java
@Service
@Transactional
@RequiredArgsConstructor
public class SignService {
	
    ...
	
    private final TokenRepository tokenRepository;
    
    ...
    
    public SignResponse login(SignRequest request) throws Exception {
        ...
        
        return SignResponse.builder()
                .id(member.getId())
                .account(member.getAccount())
                .name(member.getName())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .roles(member.getRoles())
                .token(TokenDto.builder()
                        .access_token(jwtProvider.createToken(member.getAccount(), member.getRoles()))
                        .refresh_token(member.getRefreshToken())
                        .build())
                .build();
    }
	
    ...

    // Refresh Token ================

    /**
     * Refresh 토큰을 생성한다.
     * Redis 내부에는
     * refreshToken:memberId : tokenValue
     * 형태로 저장한다.
     */
    public String createRefreshToken(Member member) {
        Token token = tokenRepository.save(
                Token.builder()
                        .id(member.getId())
                        .refresh_token(UUID.randomUUID().toString())
                        .expiration(300)
                        .build()
        );
        return token.getRefresh_token();
    }

    public Token validRefreshToken(Member member, String refreshToken) throws Exception {
        Token token = tokenRepository.findById(member.getId()).orElseThrow(() -> new Exception("만료된 계정입니다. 로그인을 다시 시도하세요"));
        // 해당유저의 Refresh 토큰 만료 : Redis에 해당 유저의 토큰이 존재하지 않음
        if (token.getRefresh_token() == null) {
            return null;
        } else {
            // 리프레시 토큰 만료일자가 얼마 남지 않았을 때 만료시간 연장..?
            if(token.getExpiration() < 10) {
                token.setExpiration(1000);
                tokenRepository.save(token);
            }

            // 토큰이 같은지 비교
            if(!token.getRefresh_token().equals(refreshToken)) {
                return null;
            } else {
                return token;
            }
        }
    }

    public TokenDto refreshAccessToken(TokenDto token) throws Exception {
        String account = jwtProvider.getAccount(token.getAccess_token());
        Member member = memberRepository.findByAccount(account).orElseThrow(() ->
                new BadCredentialsException("잘못된 계정정보입니다."));
        Token refreshToken = validRefreshToken(member, token.getRefresh_token());

        if (refreshToken != null) {
            return TokenDto.builder()
                    .access_token(jwtProvider.createToken(account, member.getRoles()))
                    .refresh_token(refreshToken.getRefresh_token())
                    .build();
        } else {
            throw new Exception("로그인을 해주세요");
        }
    }
}
```
간단한 예시를 위해 Refresh 토큰의 만료시간을 300초로 했다.
> 리프레시 토큰 탈취를 생각하면 토큰을 아예 재발급하는게 맞을거같은데...
Refresh 토큰의 10초 아래로 남았을 때 재발급을 요청한다면 토큰의 만료시간을 늘려준다는 부분이 뭔가 수상하다.
재발급으로 구성하는게 더 나은 방법인 것 같다.
일단은 간단한 예제로 구성한 뒤 향후 재발급을 하는 과정으로 개선하도록 하자.

### JwtProvider

JwtProvider에서 유저의 account를 획득할 때 paring 과정에서 만료된 토큰에 대해서 ExpiredJwtException이 발생한다.

해당 Exception에 대해서만 Claim의 Subject(account)를 반환하도록 지정해주자.

``` java
@RequiredArgsConstructor
@Component
public class JwtProvider {
	
    ...
    
    // 토큰에 담겨있는 유저 account 획득
    public String getAccount(String token) {
        // 만료된 토큰에 대해 parseClaimsJws를 수행하면 io.jsonwebtoken.ExpiredJwtException이 발생한다.
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody().getSubject();
        } catch (ExpiredJwtException e) {
            e.printStackTrace();
            return e.getClaims().getSubject();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody().getSubject();
    }

	...
    
}
```


### SignController

사용자가 `/refresh`로 토큰 재발급 요청을 하도록 Contoller를 구성한다.
``` java
@RestController
@RequiredArgsConstructor
public class SignController {
	
    ...
    
    @GetMapping("/refresh")
    public ResponseEntity<TokenDto> refresh(@RequestBody TokenDto token) throws Exception {
        return new ResponseEntity<>( memberService.refreshAccessToken(token), HttpStatus.OK);
    }
}
```

## 5. Security 설정

이제 마지막 설정이다.

### SecurityConfig

httpSecurity 설정에서 `/refresh` 경로를 허용해준다.

``` java

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {
	...
     @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.
        	...
            .antMatchers("/register", "/login", "/refresh").permitAll()
            ...
    }
...
}
```

---

# 동작 시나리오

우리는 위 코드로부터 다음 동작과정을 기대할 수 있다.

1. 로그인 시 MySQL, Redis에 사용자의 Refresh 토큰이 저장된다.
2. Access 토큰과 Refresh 토큰을 보내 새로운 access 토큰을 (혹은 Refresh 토큰도 같이) 발급받을 수 있다.

> 설명은 장황하나 시나리오는 간단하다.. ㅋㅋ
이래서 가볍게 생각하고 덤벼들었다가 피를보는거같다. ~~내얘기다~~


## 실행

만료 시나리오를 위해 Access 토큰의 만료시간을 1분으로, Refresh 토큰의 만료시간은 2분으로 설정했다.
![](/images/4135cb04-cec8-4188-8c2e-b03f823848d2-image.png)

![](/images/c544fe08-0bf8-4e1a-9957-203029dff537-image.png)

### 1. 회원가입
![](/images/db484d1d-5098-4b1b-9909-8e3a7f18a763-image.png)

### 2. 로그인
![](/images/3d39fe3a-4e7f-4c24-b1a4-3c06c1a5a40b-image.png)

![](/images/293b507a-1786-4d68-a505-61143af8c464-image.png)

![](/images/282b5809-d3f9-45ed-9d21-567f2044582e-image.png)

### 3-1. access, refresh 토큰 정보로 재발급 요청
![](/images/7770506b-09fb-4490-a784-f2b609187bfc-image.png)


### 3-2. 만료된 access 토큰 정보로 재발급 요청
![](/images/0a2d37ff-cefb-492c-bec2-515a7fbc0f1e-image.png)

### 3-3. 만료된 refresh 토큰 정보로 재발급 요청

![](/images/394da1d4-7d3f-44e2-9d6f-83a1d97364e4-image.png)

![](/images/2eaceb5e-aa89-41a6-a58f-26f8a077dd15-image.png)

---

# 후기

그동안 Refresh 토큰을 검증하기 위한 방법을 찾아보기 위해 다른 블로그들의 예시를 참고하려고했으나 제각기 다른 방식으로 Refresh 토큰을 구현하고 있었다.
Refresh 토큰으로 JWT를 사용하는 방법, UUID를 사용하는 방법, 특정값을 조합하는 방법 등등 구현 방향성이 각자 달랐다.

때문에 나의 방법을 한가지 정하고 진행하기 위해 고민하는 시간이 많아졌다.
~~중간에 고민하는 인용구가 많아진 이유이기도 하다..ㅎㅎ~~

위에서 말했다시피 완벽한 보안이라는것은 없다.
누군가는 JWT의 이점을 최대한으로 보고싶어 DB 조회를 하지 않는 방법을 최대한 생각하여 고민을 할 것이고, 누군가는 성능이슈보다는 보안 취약점으로 인한 손실을 더 크게 생각하여 보안에 중점을 두고 해결책을 내 놓을 것이다.

보통의 경우 후자가 옳다고 판단되지만.. 결국에는 무엇이든 자신의 선택의 연속이라고 생각한다. 다만 그 생각을 뒷받침할만한 근거를 통해 나 자신을 설득하는 과정이 중요한 것이라고 생각한다.

더 나은 방식이 있으면 적용하며 개선해나가면 된다.

고민만 하다가 이곳저곳의 의견에 휘둘려 시작하지 못했던 과거의 자신에게 해주고싶은 말이다.

---

# Reference

https://velog.io/@park2348190/JWT%EC%97%90%EC%84%9C-Refresh-Token%EC%9D%80-%EC%99%9C-%ED%95%84%EC%9A%94%ED%95%9C%EA%B0%80

https://velog.io/@0307kwon/JWT%EB%8A%94-%EC%96%B4%EB%94%94%EC%97%90-%EC%A0%80%EC%9E%A5%ED%95%B4%EC%95%BC%ED%95%A0%EA%B9%8C-localStorage-vs-cookie

https://blog.ahnlab.com/1587

https://velog.io/@ehdrms2034/Access-Token-%EC%A0%80%EC%9E%A5-%EC%9C%84%EC%B9%98%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B3%A0%EC%B0%B0

https://www.samsungsds.com/kr/insights/1232564_4627.html

https://bcp0109.tistory.com/328

https://velog.io/@wisdom-one/Spring-Boot%EC%99%80-Redis-%EA%B0%84%EB%8B%A8%ED%95%98%EA%B2%8C-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0

https://jeong-pro.tistory.com/175

https://www.baeldung.com/spring-data-redis-properties
