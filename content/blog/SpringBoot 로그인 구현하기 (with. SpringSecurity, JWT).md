---
title: 'SpringBoot 로그인 구현하기 (with. SpringSecurity, JWT)'
description: 다들 한번쯤은 프로젝트를 시작하려고할 때 로그인이 있는 프로젝트의 경우 로그인을 어떻게 구성하지? 라는 고민에 빠질 것이다...
date: 2022-10-16T14:03:17.974Z
tags:
  - JWT
  - Spring Boot
  - Spring Security
---
# 서론

다들 한번쯤은 프로젝트를 시작하려고할 때 로그인이 있는 프로젝트의 경우 로그인을 어떻게 구성하지? 라는 고민에 빠질 것이다.

아주 간단하게 아이디, 비밀번호로 로그인하면 되는거 아니야? 라고 생각했다가 생각해보지 못한 상황들에서 난항을 겪게 될 수 있다. ~~내가 그럴뻔했다~~

- 사용자의 로그인 상태는 어떻게 확인할것인지?
- 서비스에서 권한에 따른 분리가 일어나게되면 권한에 대한 설정은 어떻게 할것인지?
- 서비스가 확장됨에 따라 여러 서비스에서 공통된 인증과정을 거친다면 프로젝트별로 중복된 코드가 계속해서 작성되어야할지?
등등등... 생각에 생각이 곂치다보면 결국 아.. 로그인이 제일 어렵구나.. 라는 생각에 상상만하던 광활한 프로젝트에 대한 열망이 식어버리기 마련이다.

MBTI가 트리플 J인 나로서는 프로젝트를 만드는 동안 각 서비스들이 인증에 대한 구애를 받지 않고 개발할 수 있다면 생산성이 비약적으로 상승할것이라는 기대감과 확신을 가지고 로그인 구현을 진행해보겠다.

# 구현방향

개발 환경은 SpringBoot 2.7.2 이며 해당 버전에서는 Spring Security. 5.7.3 버전을 사용한다.

왜 버전을 먼저 언급하냐면 대다수의 블로그들의 설정방식이 Spring Security 5.7.0 이전의 방식을 사용하고 있기 때문에 혼란함을 방지하기 위함이다.

> 사실 내 경험담이다...
[공식문서](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)를 살펴보면 Spring Security 5.7.0 부터는 더이상 WebSecurityConfigurerAdapter를 확장해서 사용하지 않고 Bean을 주입하는 방식으로 사용하도록 설정방식이 아주 약간 변경된 것을 확인할 수 있다.

Spring Security의 모든 기능을 사용하여 구현하기엔 내용도 방대할 뿐만 아니라 방향성이 조금 맞지 않아 몇가지 사용할 기능만 소개하려고 한다.

## 구현방향

1. FrontEnd와 BackEnd를 분리
Spring Security는 보안 설정을 위한 많은 기능을 제공하고 있다.
이 글에서는 FrontEnd와 BackEnd를 분리한 구조를 고려하여 로그인을 구현할 것이다.

2. JWT
JWT를 이용할 것이다.

아마 많은 사람들이 JWT를 쓴다 하면 토큰탈취를 우려해 refresh 토큰에 대해 고민할것이다. 하지만 refresh 토큰에 대한 내용은 다음 과제로 남겨두고 일단은 간단한 인증과정만 구현해보자.

# 구현

실습 코드
https://github.com/Choi-JJunho/Spring-Security-Example

해당 프로젝트는 Java 11, Maven 환경에서 진행된다.
구현에 앞서 해당 프로젝트는 JPA를 구현되기 때문에 JPA에 대한 아주 약간의 선행이 필요하다.

pom.xml
```xml
	<dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
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
    </dependencies>
```

application.yml
``` yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: username
    password: password
    url: jdbc:mysql://localhost:3306/local?characterEncoding=utf8&useUnicode=true&mysqlEncoding=utf8&zeroDateTimeBehavior=convertToNull&serverTimezone=Asia/Seoul

  jpa:
    show-sql: true
    properties:
      hibernate:
        default_batch_fetch_size: 1000
    hibernate:
      ddl-auto: create

# jwt.secret.key의 값은 256bit 이상이어야 합니다.
jwt:
  secret:
    key: x!A%D*G-KaPdSgVkYp3s5v8y/B?E(H+M
```

> 작성하면서 생각났는데 jwt secret key값에 사용될 문자열을 만들기 어렵다면 
[해당 사이트](https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx)에서 256bit의 랜덤한 key값을 만들어주니 참고해보면 좋을것같다.


패키지구조는 아래와 같다.

![](/images/53e76ba7-e0a0-401e-a9a0-e8eb2bdd2aea-image.png)

## 사용자 구현

우선 인증을 구현하기 전에 사용자를 먼저 정의한다.

### Member

사용자를 정의한다.

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

    @OneToMany(mappedBy = "member", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Authority> roles = new ArrayList<>();

    public void setRoles(List<Authority> role) {
        this.roles = role;
        role.forEach(o -> o.setMember(this));
    }
}
```

사용자는 아이디, 비밀번호, 닉네임, 이름, 권한(목록)등 을 가진다.


### Authority

사용자의 권한 목록을 나타내는 엔티티다.

``` java
@Entity
@Getter
@AllArgsConstructor @NoArgsConstructor @Builder
public class Authority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;

    private String name;

    @JoinColumn(name = "member")
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Member member;

    public void setMember(Member member) {
        this.member = member;
    }
}
```


### MemberRepository

사용자를 조회하기 위한 Repository다.
account를 이용해 조회할 것이다.
> 위에 선언했다시피 여기서 account는 unique값이다.
만약 이메일로 로그인할 것이라면 **findByEmail**이 적합하겠다.

``` java
@Transactional
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByAccount(String account);
}
```


### CustomUserDetails

Spring Security는 유저 인증과정에서 UserDetails를 참조하여 인증을 진행한다.
UserDetails를 아래와 같이 상속하여 DB에 위에서 선언한 사용자의 정보를 토대로 인증을 진행하도록 설정한다.

Member에 바로 UserDetails를 상속해도 동작은 하겠지만 그렇게하면 엔티티가 오염되어 향후 Member 엔티티를 사용하기 어려워지기 때문에 CustomUsetDetails를 따로 만들어줬다.

JWT를 이용할 것이기 때문에 아래 `isAccountNonExpired()` 아래로 4개속성은 `true`로 설정한다.

``` java
public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    public final Member getMember() {
        return member;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return member.getRoles().stream().map(o -> new SimpleGrantedAuthority(
                o.getName()
        )).collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        return member.getAccount();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```


### JpaUserDetailsService

Spring Security의 UserDetailsService는 UserDetails 정보를 토대로 유저 정보를 불러올 때 사용된다.

Jpa를 이용하여 DB에서 유저 정보를 조회할 것이므로 이에 맞춰서 구현해주면 된다.

``` java
@Service
@RequiredArgsConstructor
public class JpaUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Member member = memberRepository.findByAccount(username).orElseThrow(
                () -> new UsernameNotFoundException("Invalid authentication!")
        );

        return new CustomUserDetails(member);
    }
}
```

---

## JWT 설정

JWT를 생성하고 검증하기 위한 클래스를 생성한다.

> 여담이지만 간혹가다 jwt토큰 이라고 명명하는 사람들이 있는데 이렇게 말하면 JSON Web Token Token이 되어버린다😅
~~여러 블로그를 참고하면서 JwtTokenProvider라고 명명한곳이 많길래...~~
굳이 토큰이라는 말을 강조하고싶으면 Jws 토큰이라고 명명하는게 더 좋아보인다.

### JwtProvider

``` java
@RequiredArgsConstructor
@Component
public class JwtProvider {

    @Value("${jwt.secret.key}")
    private String salt;

    private Key secretKey;

    // 만료시간 : 1Hour
    private final long exp = 1000L * 60 * 60;

    private final JpaUserDetailsService userDetailsService;

    @PostConstruct
    protected void init() {
        secretKey = Keys.hmacShaKeyFor(salt.getBytes(StandardCharsets.UTF_8));
    }

    // 토큰 생성
    public String createToken(String account, List<Authority> roles) {
        Claims claims = Jwts.claims().setSubject(account);
        claims.put("roles", roles);
        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + exp))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 권한정보 획득
    // Spring Security 인증과정에서 권한확인을 위한 기능
    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getAccount(token));
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // 토큰에 담겨있는 유저 account 획득
    public String getAccount(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody().getSubject();
    }

    // Authorization Header를 통해 인증을 한다.
    public String resolveToken(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

    // 토큰 검증
    public boolean validateToken(String token) {
        try {
            // Bearer 검증
            if (!token.substring(0, "BEARER ".length()).equalsIgnoreCase("BEARER ")) {
                return false;
            } else {
                token = token.split(" ")[1].trim();
            }
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            // 만료되었을 시 false
            return !claims.getBody().getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
```


## Security Config

여기서부터가 Spring Security 설정을 할때 가장 많이 보는 부분일 것이다.

### JwtAuthenticationFilter

Filter를 적용함으로써 servlet에 도달하기 전에 검증을 완료할 수 있다.
Filter 동작의 자세한 과정은 아래 Security Config 설정에서 알아본다.

OncePerRequestFilter는 단 한번의 요청에 단 한번만 동작하도록 보장된 필터다.

```java

/**
 * Jwt가 유효성을 검증하는 Filter
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = jwtProvider.resolveToken(request);

        if (token != null && jwtProvider.validateToken(token)) {
            // check access token
            token = token.split(" ")[1].trim();
            Authentication auth = jwtProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
```

### SecurityConfig

Spring Security의 전반적인 설정을 한다.
내용이 길어 주석으로 작성했다.

```java
@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ID, Password 문자열을 Base64로 인코딩하여 전달하는 구조
                .httpBasic().disable()
                // 쿠키 기반이 아닌 JWT 기반이므로 사용하지 않음
                .csrf().disable()
                // CORS 설정
                .cors(c -> {
                            CorsConfigurationSource source = request -> {
                                // Cors 허용 패턴
                                CorsConfiguration config = new CorsConfiguration();
                                config.setAllowedOrigins(
                                        List.of("*")
                                );
                                config.setAllowedMethods(
                                        List.of("*")
                                );
                                return config;
                            };
                            c.configurationSource(source);
                        }
                )
                // Spring Security 세션 정책 : 세션을 생성 및 사용하지 않음
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                // 조건별로 요청 허용/제한 설정
                .authorizeRequests()
                // 회원가입과 로그인은 모두 승인
                .antMatchers("/register", "/login").permitAll()
                // /admin으로 시작하는 요청은 ADMIN 권한이 있는 유저에게만 허용
                .antMatchers("/admin/**").hasRole("ADMIN")
                // /user 로 시작하는 요청은 USER 권한이 있는 유저에게만 허용
                .antMatchers("/user/**").hasRole("USER")
                .anyRequest().denyAll()
                .and()
                // JWT 인증 필터 적용
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class)
                // 에러 핸들링
                .exceptionHandling()
                .accessDeniedHandler(new AccessDeniedHandler() {
                    @Override
                    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
                        // 권한 문제가 발생했을 때 이 부분을 호출한다.
                        response.setStatus(403);
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/html; charset=UTF-8");
                        response.getWriter().write("권한이 없는 사용자입니다.");
                    }
                })
                .authenticationEntryPoint(new AuthenticationEntryPoint() {
                    @Override
                    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
                        // 인증문제가 발생했을 때 이 부분을 호출한다.
                        response.setStatus(401);
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/html; charset=UTF-8");
                        response.getWriter().write("인증되지 않은 사용자입니다.");
                    }
                });

        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
```
PasswordEncoder를 createDelegatingPasswordEncoder()로 설정하면
`{noop}` asdf!@#asdfvz!@#... 처럼 password의 앞에 Encoding 방식이 붙은채로 저장되어 암호화 방식을 지정하여 저장할 수 있다.

추가로 확인할 내용이 있다.
Jwt를 검증하기 위한 Filter로 `JwtAuthenticationFilter`를 만들었다. 그렇다면 이 필터는 어디에 있어야 제 역할을 할까?

해당 부분을 확인하면 된다.
```java
.addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class)
```

인증을 처리하는 기본필터는 UsernamePasswordAuthenticationFilter다.
별도의 인증 로직을 가진 필터를 생성하고 사용하기 위해서는 UsernamePasswordAuthenticationFilter의 앞에 필터를 설정해주면 된다.


> 자세한 내용은 더 깊게 정리해봐야겠지만 
기본인증필터인 UsernamePasswordAuthenticationFilter의 앞에서 인증이 이뤄지면(SecurityContextHolder에 인증정보가 추가되면) AuthenticationFilter에서 인증 다음 흐름으로 넘어가는 방식으로 이해했다.

> 아마 IntelliJ를 사용중이라면 http 변수에 'Could not autowire. No beans of 'HttpSecurity' type found.라는 경고문구가 뜰 수도 있다.
클래스에 @EnableWebSecurity 어노테이션을 붙이면 해결된다. [stack overflow]
(https://stackoverflow.com/questions/72769680/intellij-idea-error-could-not-autowire-no-beans-of-httpsecurity-type-found)
![](/images/5ecb4750-a3f6-4c8d-95c0-ac4b9adab00b-image.png)

---

## 회원가입, 로그인 서비스

필터를 구성했으니 로그인, 로그아웃 서비스를 구성해보자

### DTO 생성

응답, 반환에 이용할 DTO를 생성한다.


```java
@Getter @Setter
public class SignRequest {

    private Long id;

    private String account;

    private String password;

    private String nickname;

    private String name;

    private String email;

}
```

```java
@Getter
@Builder @AllArgsConstructor @NoArgsConstructor
public class SignResponse {

    private Long id;

    private String account;

    private String nickname;

    private String name;

    private String email;

    private List<Authority> roles = new ArrayList<>();

    private String token;

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

비즈니스 로직에 대한 설명은 생략한다.

``` java
@Service
@Transactional
@RequiredArgsConstructor
public class SignService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public SignResponse login(SignRequest request) throws Exception {
        Member member = memberRepository.findByAccount(request.getAccount()).orElseThrow(() ->
                new BadCredentialsException("잘못된 계정정보입니다."));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new BadCredentialsException("잘못된 계정정보입니다.");
        }

        return SignResponse.builder()
                .id(member.getId())
                .account(member.getAccount())
                .name(member.getName())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .roles(member.getRoles())
                .token(jwtProvider.createToken(member.getAccount(), member.getRoles()))
                .build();

    }

    public boolean register(SignRequest request) throws Exception {
        try {
            Member member = Member.builder()
                    .account(request.getAccount())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .name(request.getName())
                    .nickname(request.getNickname())
                    .email(request.getEmail())
                    .build();

            member.setRoles(Collections.singletonList(Authority.builder().name("ROLE_USER").build()));

            memberRepository.save(member);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new Exception("잘못된 요청입니다.");
        }
        return true;
    }

    public SignResponse getMember(String account) throws Exception {
        Member member = memberRepository.findByAccount(account)
                .orElseThrow(() -> new Exception("계정을 찾을 수 없습니다."));
        return new SignResponse(member);
    }

}
```

### SignController

컨트롤러에서는 로그인, 회원가입, 유저 조회 3가지 기능을 구현했다.

```java
@RestController
@RequiredArgsConstructor
public class SignController {

    private final MemberRepository memberRepository;
    private final SignService memberService;

    @PostMapping(value = "/login")
    public ResponseEntity<SignResponse> signin(@RequestBody SignRequest request) throws Exception {
        return new ResponseEntity<>(memberService.login(request), HttpStatus.OK);
    }

    @PostMapping(value = "/register")
    public ResponseEntity<Boolean> signup(@RequestBody SignRequest request) throws Exception {
        return new ResponseEntity<>(memberService.register(request), HttpStatus.OK);
    }

    @GetMapping("/user/get")
    public ResponseEntity<SignResponse> getUser(@RequestParam String account) throws Exception {
        return new ResponseEntity<>( memberService.getMember(account), HttpStatus.OK);
    }

    @GetMapping("/admin/get")
    public ResponseEntity<SignResponse> getUserForAdmin(@RequestParam String account) throws Exception {
        return new ResponseEntity<>( memberService.getMember(account), HttpStatus.OK);
    }
}
```

# 동작 시나리오

우리는 위 코드로부터 다음과 같은 동작을 기대할 수 있다.

1. 회원가입
아이디, 비밀번호를 입력하여 회원가입을 한다.

2. 로그인
아이디, 비밀번호를 입력하여 로그인을 한다.
이때 access 토큰을 발급받아 Authentication Header에 넣는다.
이후의 인증은 Authentication Header를 통해 이루어진다.

3. 유저 조회
인증/인가된 사용자인지 필터에서 검증할 수 있다.

## 실행

- 실행을 하면 JPA가 테이블을 생성해준다.
![](/images/a96eab74-785b-4283-ad19-a3df1820c354-image.png)

- 실행 후 PostMan을 이용해 요청과 응답을 확인해본다.

### 회원가입

SignRequest DTO 정보에 맞게 회원가입 요청을 한다.

```json
{
    "account":"abc123",
    "password":"password",
    "nickname":"junho",
    "name":"junho",
    "email":"junho5336@gmail.com"
}
```

![](/images/ee92da37-7156-42fc-a973-ebe2edc414d0-image.png)

회원정보와 권한이 잘 저장된 것을 볼수있다.
![](/images/eb5b9020-086d-4c72-83ad-50877a85bdb2-image.png)

![](/images/7994e7ee-000e-49ea-91fc-8d23901d0d86-image.png)

> account, email 필드가 unique이기 때문에 중복 회원가입을 하면 exception이 발생한다.
![](/images/ba26486e-0f12-4049-93fd-0a5ad83e1831-image.png)

### 로그인

회원가입 한 정보로 로그인요청을 한다.

```json
{
    "account":"abc123",
    "password":"password"
}
```

유저의 정보와 토큰이 반환된다.
![](/images/b548015a-b541-4cd6-8640-d729d518fc28-image.png)

### 인증 확인

1. 토큰없이 /user/get을 호출해본다.
![](/images/1f4aaae0-3861-4eff-9cc2-0ff96a312798-image.png)

어떤 요청을 해도 "인증되지 않은 사용자입니다"를 반환한다.

2. 유저 토큰을 가진 사용자 (위에서 회원가입한 사용자)로 로그인 후 진행

Postman에서 'Authorization - Type - BearerToken을 선택하고 로그인을 했을 때 발급받은 토큰값을 넣어준다.

![](/images/449b810b-0f9c-4b2e-a41e-6d89e51f73ea-image.png)

![](/images/09de4730-9db7-4a31-8fab-e3ffd2e1a23c-image.png)

`/user/get?account=abc123` 요청하기

결과값이 잘 반환된다.
![](/images/7efa77d3-d509-478a-b125-c873fc4879d1-image.png)

잘못된 요청에 대해서 오류도 발생한다.
![](/images/07e31584-95bd-4b3b-8b94-9bb05fbd49d8-image.png)

3. Admin 권한의 API 요청하기

`/admin/get?account=abc123` 요청하기

권한이 없는 사용자로 막힌다.
![](/images/24354e0b-0a07-4347-8507-0854f185ffd3-image.png)

# 후기

Spring Seurity와 JWT를 이용한 인증과정을 간단하게 구현해보았다.
정리해놓고 보면 별거 없어보이지만 Spring Security를 처음 공부해보기 시작했을때는 인증 방식, 아키텍처 구현방식을 전혀 생각하지 않고 주먹구구식으로 구글링해가며 알아보기 시작했다.

인터넷의 방대한 양의 자료는 혼란을 겪게했다. 어디에서는 HttpBasic을 이용한 인증방식, 어디에서는 JWT를, 또 어디에서는 Session을 이용한 로그인 구현을 하고있었다.

거진 반년 이상은 구현에 손을 댈까 말까 고민만 계속했던 것 같다.

그러다 얼마전 한국어로 정발된 `스프링 시큐리티 인 액션`이 많은 도움이 되었다.
![](/images/162b5725-2c3a-43cf-b4d3-00171becffbd-image.png)

만약 스프링 시큐리티를 처음 시작하게 된다면 위 책을 읽고 시작하는것을 매우 추천한다.

사실 지금도 내가 Spring Security를 이해했다고 보기엔 부족한점이 너무많다.
하지만 공부해나가야 할 방향성을 어느정도 잡을 수 있었다.

최종 목적은 MSA 환경에서 사용할 수 있는 인증서버를 만드는 방향으로 학습을 진행해보려고한다. 그 과정에 있어 부가적으로 필요한 지식들이 많겠지만 방향성을 잃었을 때와는 마인드가 조금은 달라진것 같다.

아마 목표를 구현한 결과물이 실제 사용을 하기에는 부족함이 많겠지만 그 부족함으로부터 성장할 수 있는 기회가 얻어지리라 믿는다.



# Reference
https://minkukjo.github.io/framework/2020/12/18/Spring-142/

https://junhyunny.github.io/information/security/spring-boot/spring-security/cross-site-reqeust-forgery/

https://12teamtoday.tistory.com/141

https://velog.io/@seongwon97/Spring-Security-Filter%EB%9E%80

https://sungminhong.github.io/spring/security/

https://yceffort.kr/2021/05/drawback-of-jwt
