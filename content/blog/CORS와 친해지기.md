---
title: CORS와 친해지기
description: "서론  >TMI \U0001F440 이번에 처음으로 해커톤에 참가해보면서 환경이 달랐다. 모든 참가자들에게 비싼돈 줘가면서 얼마 안쓸 도메인을 주지 않고, 제공해주는건 VM 원격 접속을 위한 정보뿐... 그동안 내가 공부하면서 서버를 만들고, 사용하던 방식은 AWS에서 EC2를 열고"
date: 2021-10-19T13:55:56.309Z
tags:
  - CORS
  - Spring Boot
---
# 서론

>**TMI** 👀
이번에 처음으로 해커톤에 참가해봤다. 평소 로컬에서 개발하던 방식과 너무 달랐다. 모든 참가자들에게 비싼돈 줘가면서 얼마 안쓸 도메인을 주지 않고, 제공해주는건 VM 원격 접속을 위한 정보뿐... 
그동안 내가 공부하면서 서버를 만들고, 사용하던 방식은 AWS에서 EC2를 열고, 도메인을 구입하고, SSL 인증서를 발급받고, HTTPS로 연결하는게 당연한 것이라 여겼다


일단 앞선 환경은 다 제껴두고 배포를 진행해봤다.

> **어림도없지!!**
![ERR_CONNECTION_REFUSED Image](/images/8dccf32d-6388-4b5b-b51a-31c174a57a1e-ERR_CONNECTION_REFUSED.png)


Github CodeSpace 환경을 사용하는 FE에서 HTTP로 배포되어있는 서버에 요청하려고하니 HTTPS -> HTTP로 요청하는 상황이 되버렸다.

![안전하지 않은 콘텐츠 허용](/images/ec4909e5-1f02-4219-8af2-99c262eabd3f-image.png)

클라이언트가 웹브라우저를 아쉬운대로 웹 브라우저에서 임의로 안전하지 않은 콘텐츠를 허용해서 접속을 시도했다.

![CORS_ERROR](/images/3e0e71f2-7af3-4100-8e5d-ced07e0faf7d-cors.png)

> 🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️

CORS? 분명 입대전에 공부했던 내용인데 실제로 저 문제를 겪으리라곤 상상도 못했었나보다.
역시 문제에 직면해봐야하는거같다.

---

# 문제 인식하기

문제가 무엇인고...
FE, BE 개발로 나눠서 개발을 진행중이었다. 둘다 학습한 내용을 처음 적용해보기 때문에 
**FE의 기술을 모르는 BE** / **BE의 기술을 모르는 FE**의 대화는 참으로 엉망진창이였다.
> 실시간 갈고리 수집중...**(⊙_⊙)？(⊙_⊙)？**
![](/images/f0a6fa77-054b-4ca8-806b-a17706781f03-chat.png)
헤더에 저 값을 넣어서 주라고? 그래서 그거 어떻게하는건데?
![https://evan-moon.github.io/2020/05/21/about-cors/](/images/a0e23512-4830-4ee5-85f9-560c06750598-chat2.png)
아무튼 CORS라는 놈이 문제란거지...

---

# CORS란?

**교차 출처 리소스 공유(Cross-Origin Resouce Sharing)** ~~뭔소리야~~

말만 들어서는 뭔소린지 감이 잘 안온다.
작은 개념 하나씩 이해해보자

## 출처(Origin)
우리가 보는 URL은 하나의 문자열로 보이지만 여러개 구성요소로 나눠져있다.

![](/images/86eb1d53-dec1-45a5-8be1-b21ef19cc64d-image.png)

`Protocol`, `Host`부터 `:80`, `:443`과 같은 포트번호까지 합친 것을 출처라고 한다.

즉, `Protocol`부터 포트번호까지 일치해야 같은 출처라고 인정된다

> **TMI👀**
브라우저의 console창에 `console.log(location.origin)`을 쳐보면 어플리케이션이 실행되고있는 출처가 나온다.
![](/images/1e93556b-d119-4032-8fce-b14029b731c0-image.png)

## 출처의 구분

>그래서 누구잘못이라는거에요?🤷‍♂️

출처를 비교하는 로직은 서버가 아닌 브라우저에 구현되어있는 스펙이다.

![](/images/cd2c3a90-16ce-4e06-9f9d-c1efe0e1162f-image.png)

서버는 CORS를 위반하더라도 정상적으로 응답을 해주고, 응답의 파기 여부는 브라우저가 결정한다.

>🤔
이 부분이 누구의 문제인지 헷갈리게한 부분이다.
분명히 서버 로그에서는 문제없이 응답을 보냈는데 브라우저에서는 CORS문제가 있다고하니...


## CORS 동작과정

웹 클라이언트에서는 요청헤더의 Origin이라는 필드에 출처를 함께 담아보낸다.

`Origin: https://client.com`

이후 서버는 응답 헤더의 `Access-Control-Allow-Origin`이라는 값에 허용된 출처를 담아준다.
그러면 클라이언트는 자신이 보낸 Origin 값과 `Access-Control-Allow-Origin`값을 비교하여 응답이 유효한지 확인해본다.

---

# 해결하기

많은 해결방법이 있지만 **SpringBoot를 사용하는 환경 + 제한된 시간내 해결해야하는 급박함**이 겹쳐 허둥지둥 해결한 방법이다.

## Spring Security 설정을 추가하여 해결하기

배포하는 환경이 아니라 개발환경이기 때문에 모든 요청에 대해 Allow를 해줬다.

> CORS외의 설정은 전부 disable()했다...
~~실 서비스였다면 대참사~~

### 1.pom.xml에 설정 추가

```xml
...
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
...
```

### 2. WebSecurityConfig 작성

프로토타입용이라서 CORS외 요청은 disable하고 모든 요청에 대해 Allow해줬다... 
~~이러면 Spring Security를 쓴 의미가?~~

```java
@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
   @Bean
   public PasswordEncoder getPasswordEncoder() {
      return new BCryptPasswordEncoder();
   }

   @Override
   protected void configure(HttpSecurity http) throws Exception {
      http.cors().and()
         .csrf().disable()
         .formLogin().disable()
         .headers().frameOptions().disable();
   }

   @Bean
   CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration configuration = new CorsConfiguration();
      configuration.setAllowedOrigins(Arrays.asList("*"));
      configuration.setAllowedMethods(Arrays.asList("*"));
      configuration.setAllowedHeaders(Arrays.asList("*"));
      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);
      return source;
   }

}
```

---

# 후기

갑작스럽게 끝나버리긴했는데 '아무튼 성공했다!'는 결론이 났다.

![](/images/5a40e350-2cd3-4f73-99c8-c1ba6a9d5c5f-image.png)

그래도 이런 경험에서 얻어가는건 분명히 있었다.
급한데 뭣도 안되고 길도 모르니 지식으로 아무리 공부해도 경험으로 느끼는게 없으면 무의미하다는 걸 알게되었다.
그리고 어떤 프로젝트를 진행해도 손색없을정도의 초기 설정프로젝트 정도는 미리 가지고있는게 좋을거 같다. 해커톤을하는데 무슨 설정하는데 시간이 제일 오래걸린다. 나중에 시간 좀 내서 Spring Security도 깔쌈하게(?) 적용시켜서 하나 만들어놔야겠다.

>적어도 이런상황은 안나오게 열심히 노력해야지...😀
![](/images/dcc10cb8-a19e-4ad0-a478-e5beece51f27-image.png)

>추가로 기본적인 FE 공부도 좀 해야겠다.😅
BE가 FE의 기술을 모르니 소통이 안되는 문제가 참... 어려운 문제다
![](/images/115f2c53-5b22-4be5-adf3-108db3d3836d-image.png)

---

# 전역 후 회고

전역 후 다시금 프로젝트 해결과정을 보는데 어영부영 넘어간 상황이 너무 많아 다시 정리하려고한다.

저 당시에는 Http Header에 값을 담아서 전송을 어떻게하는지 몰랐다고 보는것이 더 명확하다고 할 수 있다.

그렇다면 SpringBoot에서 Http통신을 하는 과정을 이해할 필요가 있다.

## HttpServlet Request
![](/images/bd2f2be4-98ee-4cc6-a3e9-92ca6a7de8f6-image.png)

WAS가 웹브라우져로부터 Servlet요청을 받으면 다음과 같은 순서로 진행된다.

1. 요청을 받을 때 전달 받은 정보를 HttpServletRequest객체를 생성하여 저장

2. 웹브라우져에게 응답을 돌려줄 HttpServletResponse객체를 생성(빈 객체)

3. 생성된 HttpServletRequest(정보가 저장된)와 HttpServletResponse(비어 있는)를 Servlet에게 전달

### HttpServletRequest

http프로토콜의 request정보를 서블릿에게 전달하기 위한 목적으로 사용하며 헤더 정보, 파라미터, 쿠키, URI, URL 등의 정보를 읽어 들이는 메서드와 Body의 Stream을 읽어 들이는 메서드를 가지고 있다.

### HttpServletResponse

WAS는 어떤 클라이언트가 요청을 보냈는지 알고 있고, 해당 클라이언트에게 응답을 보내기 위한 HttpServleResponse 객체를 생성하여 서블릿에게 전달하고 이 객체를 활용하여 content type, 응답 코드, 응답 메시지 등을 전송한다.

정보를 전달하는 데 있어 이해하고 있어야할 기본적인 내용이지만 구멍이 나있으면 위 상황처럼 정말 애만 먹는다...

---

# Reference
https://evan-moon.github.io/2020/05/21/about-cors/
https://velog.io/@vraimentres/CORS
https://zester7.tistory.com/33
https://coding-factory.tistory.com/742
