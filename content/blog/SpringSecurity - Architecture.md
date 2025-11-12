---
title: SpringSecurity - Architecture
description: Spring Security의 아키텍처를 살펴봤다
date: 2024-07-30T02:05:24.057Z
tags:
  - NEXTERS
  - Spring Boot
  - Spring Security
---
# 서론

지난 글에서 DelegatingFilterProxy에 대해 정리해봤다.
이런식이면 한세월 걸릴거같으니 아키텍쳐를 간단하게 훑어보자

# 아키텍쳐

문서를 기반으로 간략하게 이해할 수 있는 정도만 정리하면서 넘어가보자.
공식문서를 내 언어로 번역한 글이라고 생각하면될거같다.

> 🚧 해석 과정에서 잘못된 정보가 있을 수도 있습니다 🚧
🙏 따끔한 지적 대환영합니다 🙏

## DelegatingFilterProxy

![](/images/8f33a1a3-5fbf-4d57-8675-7ccba3587e07-image.png)

우선 SpringSecurity는 Servlet 필터를 기반으로 필터 처리를 한다.
지난 글에서 알아봤던 `DelegatingFilterProxy`가 SpringApplicationContext와 Servlet Filter의 연결점 역할을 해줬다.
정확히는 Servlet Filter에서의 작업을 Spring Bean에게 위임한다고 해서 `DelegatingFilterProxy`라는 이름이 붙었다고 생각하면 될거같다.

```kotlin
fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
	val delegate: Filter = getFilterBean(someBeanName)
	delegate.doFilter(request, response)
}
```

공식문서의 의사코드를 확인해보면 Spring Bean을 Lazy하게 가져와서(`getFilterBean` 부분) 작업을 위임하도록 구성되어있다.

## FilterChainProxy

![](/images/ae67a265-11ed-42c8-891e-b1fc667045bf-image.png)

FilterChainProxy는 Spring Security에서 제공하는 필터로 SecurityFilterChain을 통해 여러 필터 인스턴스에 작업을 위임하는 역할을 한다.

> 그림에 보이는 FilterChain 박스 부분은 Servlet의 영역일테고.. 그 밖의 영역은 별도의 SecurityFilterChain 영역같은데 여기도 Servlet인가?

FilterChainProxy는 Bean이라서 DelegatingFilterProxy로 래핑되어있다.

위에서 이야기했던 `DelegatingFilterProxy`의 위임 대상이 바로 이 `FilterChainProxy`라고 볼 수 있겠다.

## SecurityFilterChain

이어서 `FilterChainProxy`가 가리키는 `SecurityFilterChain`은 Spring Security Filter 인스턴스를 결정하는데 사용된다.

![](/images/10a62b91-1720-45b0-86b7-c066bab38d56-image.png)

SecurityFilterChain에 속해있는 Security Filter들은 일반적으로 Bean이다.
Bean이면 `DelegatingFilterProxy`를 통해 등록되려나? 싶지만 이 친구들은 `FilterChainProxy`를 통해 등록된다.

> ???: 왜 `FilterChainProxy`를 통해 등록하지? 라고 생각한다면 특징을 알려주는게 인지상정

- 그림에서 보다시피 FilterChainProxy는 Spring Security 처리과정 중 Servlet부터 시작되는핵심 지점이다. (같은말 하는것같지만) Servlet 지원 기능의 시작점 역할을 한다는 특징이 있다.

> Spring Security의 Servlet 쪽 처리에 대한 디버깅을 하고싶다면 FilterChainProxy에다가 디버그 점을 찍어서 확인해보면 좋다고한다.

- FilterChainProxy는 Spring Security의 핵심 구성요소이기 때문에 필수 작업을 수행할 수 있다. 
  - 대표적으로 인증 정보를 다루는 과정에서 SecurityContext를 정리하는 역할을 이곳에서 수행한다.

> SecurityContext는 SecurityContextHolder가 ThreadLocal로 다룬다.
이 값을 비워주지 않으면 찌꺼기가 남아 다른 인증에 영향을 미칠 수 있다.

  - HttpFirewall을 적용해서 특정 유형의 공격에 대한 방어도 한다.
- Security Filter Chain의 호출 시점을 결정할 수 있다.
  - Servlet 컨테이너에서는 URL을 기준으로 호출된다.
  - FilterChainProxy의 RequestMatcher 인터페이스가 HttpServletRequest값으로 기준을 정할 수 있도록 유동적으로 구성할 수 있게 만들어준다.

![](/images/ed95de82-c49b-43e8-adb1-5b2ceda57904-image.png)

각각의 SecurityFilterChain은 고유하고, 독립적으로 설정될 수 있다.

## Security Filters

Security Filter들은 SecurityFilterChain API를 통해 FilterChainProxy에 들어간다.
이 필터들은 인증, 인가, Exploits 방지 등의 목적으로 사용된다. (`Exploits`: 악용)

필터들은 특정 순서를 가지고 실행된다. 예를들어 인증은 인가보다 먼저 호출되어야한다.
일반적으로 필터 순서를 알 필요는 없지만 필터를 커스텀하는 등의 특수한 경우 순서를 알아야할 수 있다.
순서를 알고싶다면 [`FilterOrderRegistration 코드`](https://github.com/spring-projects/spring-security/blob/6.3.1/config/src/main/java/org/springframework/security/config/annotation/web/builders/FilterOrderRegistration.java#L63)를 확인하면 된다.

```java
// 해당 코드를 보면 CORS -> 인증 -> 인가 순으로 필터가 등록되어있다는것을 볼 수 있다.
	FilterOrderRegistration() {
		Step order = new Step(INITIAL_ORDER, ORDER_STEP);
		put(HeaderWriterFilter.class, order.next());
		put(CorsFilter.class, order.next());
		put(CsrfFilter.class, order.next());
// ...
		put(BasicAuthenticationFilter.class, order.next());
		put(RequestCacheAwareFilter.class, order.next());
		put(SecurityContextHolderAwareRequestFilter.class, order.next());
		put(JaasApiIntegrationFilter.class, order.next());
		put(RememberMeAuthenticationFilter.class, order.next());
		put(AnonymousAuthenticationFilter.class, order.next());
		this.filterToOrder.put("org.springframework.security.oauth2.client.web.OAuth2AuthorizationCodeGrantFilter",
				order.next());
		put(SessionManagementFilter.class, order.next());
		put(ExceptionTranslationFilter.class, order.next());
		put(FilterSecurityInterceptor.class, order.next());
		put(AuthorizationFilter.class, order.next());
		put(SwitchUserFilter.class, order.next());
	}
```

SecurityConfig로 필터체인 순서를 걸면 이렇게 작성할 수 있다.

```kotlin
import org.springframework.security.config.web.servlet.invoke

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http {
            csrf { }
            authorizeHttpRequests {
                authorize(anyRequest, authenticated)
            }
            httpBasic { }
            formLogin { }
        }
        return http.build()
    }

}
```

### Security Filters 등록 확인

만약 특정 Filter가 적용되었는지 확인하고싶다면 info level의 로그에서 다음과 같은 형태의 로그를 확인해볼 수도 있다.

```
2023-06-14T08:55:22.321-03:00  INFO 76975 --- [           main] o.s.s.web.DefaultSecurityFilterChain     : Will secure any request with [
org.springframework.security.web.session.DisableEncodeUrlFilter@404db674,
org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter@50f097b5,
org.springframework.security.web.context.SecurityContextHolderFilter@6fc6deb7,
org.springframework.security.web.header.HeaderWriterFilter@6f76c2cc,
org.springframework.security.web.csrf.CsrfFilter@c29fe36,
org.springframework.security.web.authentication.logout.LogoutFilter@ef60710,
org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter@7c2dfa2,
org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter@4397a639,
org.springframework.security.web.authentication.ui.DefaultLogoutPageGeneratingFilter@7add838c,
org.springframework.security.web.authentication.www.BasicAuthenticationFilter@5cc9d3d0,
org.springframework.security.web.savedrequest.RequestCacheAwareFilter@7da39774,
org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter@32b0876c,
org.springframework.security.web.authentication.AnonymousAuthenticationFilter@3662bdff,
org.springframework.security.web.access.ExceptionTranslationFilter@77681ce4,
org.springframework.security.web.access.intercept.AuthorizationFilter@169268a7]
```

이는 등록에 대한 정보 확인이고 요청별 필터 로깅은 조금 나중에 이야기해보겠다.

### 사용자 정의 필터

SpringSecurity의 인증 방식이 아닌 별도의 Custom한 인증 방식을 사용해야하는 경우 Filter를 구현하여 사용자 정의 필터를 Security Filter로 등록할 수도 있다.

```java
// 사용자 정의 필터
// 요청 당 한번만 실행되는 Filter를 사용하고자 한다면 OncePerRequestFilter를 사용해도 좋다.
public class TenantFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String tenantId = request.getHeader("X-Tenant-Id"); (1)
        boolean hasAccess = isUserAllowed(tenantId); (2)
        if (hasAccess) {
            filterChain.doFilter(request, response); (3)
            return;
        }
        throw new AccessDeniedException("Access denied"); (4)
    }

}

// 이렇게 적용할 수 있다.
@Bean
fun filterChain(http: HttpSecurity): SecurityFilterChain {
    http
        // ...
        .addFilterBefore(TenantFilter(), AuthorizationFilter::class.java)
    return http.build()
}
```

Filter를 Bean으로 등록하는 과정에서 한가지 주의할점이 있다.
`@Component`를 달거나 Filter의 구성에서 빈으로 선언하면, Spring Boot가 내장 컨테이너에 자동으로 등록할 수 있다.
이렇게 되면 필터가 IoC 컨테이너와 Spring Security에 의해 두 번 호출되고 다른 순서로 호출될 수 있는 문제가 발생한다.

```java
@Bean
public FilterRegistrationBean<TenantFilter> tenantFilterRegistration(TenantFilter filter) {
    FilterRegistrationBean<TenantFilter> registration = new FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
}
```

Filter를 Spring Bean으로 선언할때는 FilterRegistrationBean을 활용하여 컨테이너에 등록되지 않도록 설정할 수 있으니 참고하는게 좋겠다.
enabled 속성을 false로 설정하면 IoC Container에 등록되지 않는다.

## Handling Security Exceptions

Security에서의 에외처리를 알아보자.
ExceptionTranslationFilter에서는 `AccessDeniedException`, `AuthenticationException`을 HTTP Response로 변환한다.

아래 이미지로 `ExceptionTranslationFilter`와 다른 요소들의 관계를 볼 수 있다.

![](/images/795dfb3e-c3b7-4e2f-9f35-fbb434d7f216-image.png)

1. `ExceptionTranslationFilter`가 FilterChain.doFilter(request, response)를 호출해서 애플리케이션 나머지를 호출한다.
2. 사용자가 인증되지 않았거나 `AuthenticationException`인 경우, 인증을 시작한다.
  - SecurityContextHolder를 지운다.
  - HttpServletRequest가 저장되어 인증이 성공하면 원래 요청을 재요청하는데 사용할 수 있게 저장된다.
  - AuthenticationEntryPoint는 자격증명을 요청한다. 로그인페이지로 리디렉션하거나 WWW-Authenticate 헤더를 보내는 등의 행위를 한다.
3. AccessDeniedException이 발생하면 AccessDeniedHandlerrk wjqrms rjqn cjflfmf gksek.

> 애플리케이션이 `AccessDeniedException` 이나 `AuthenticationException`에러를 던지지 않으면 아무 작업도 안한다.

의사코드는 이렇게 생겼다.
	
```java
try {
	filterChain.doFilter(request, response);
} catch (AccessDeniedException | AuthenticationException ex) {
	if (!authenticated || ex instanceof AuthenticationException) {
		startAuthentication();
	} else {
		accessDenied();
	}
}
```


## Saving Requests Between Authentication

인증하는 과정에서 요청을 어떻게 저장할까?

위에서 이야기한 보안 예외처리 그림에서 나왔던 RequestCache를 보고 감이 왔겠지만 인증이 성공하면 RequestCache 구현체에 HttpServletRequest를 저장한다. 그리고 이 정보를 인증 후 기존 요청을 재요청하는데 활용된다.

RequestCacheAwareFilter는 RequestCache를 사용해 HttpServletRequest를 가져온다.
기본적으로 Security에서 HttpSessionRequestCache를 사용하도록 구성되어있다.

```kotlin
// 예시: continue라는 파라미터가 있을때 cache에 저장한다.
@Bean
open fun springSecurity(http: HttpSecurity): SecurityFilterChain {
    val httpRequestCache = HttpSessionRequestCache()
    httpRequestCache.setMatchingRequestParameterName("continue")
    http {
        requestCache {
            requestCache = httpRequestCache
        }
    }
    return http.build()
}
```

기본이 세션에 저장하는건데 세션을 사용하지 않고 싶을수도 있다.
토큰방식을 쓰거나 DB에 저장하는 등의 방식을 사용한다면 이 값을 굳이 `HttpSessionRequestCache`를 사용할 이유가 없다.
이 경우 `NullRequestCache`를 사용하면 된다.

```kotlin
@Bean
open fun springSecurity(http: HttpSecurity): SecurityFilterChain {
    val nullRequestCache = NullRequestCache()
    http {
        requestCache {
            requestCache = nullRequestCache
        }
    }
    return http.build()
}
```

> `RequestCacheAwareFilter`라는 필터는 RequestCache를 사용하여 원래 요청을 다시 하는 역할을 수행한다.

## Logging

Spring Security에서 제공하는 Log를 확인하면 보다 구체적인 로그 확인이 가능하다.


application.yml에서는 이런식으로 설정할 수 있고,

```yaml
logging:
  level:
    org:
      springframework:
        security: TRACE
```

logback으로는 이렇게 설정할수 있다.

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <!-- ... -->
    </appender>
    <!-- ... -->
    <logger name="org.springframework.security" level="trace" additivity="false">
        <appender-ref ref="STDOUT" />
    </logger>
</configuration>
```

# 후기

영어가 짧아서 읽는데 시간이 좀 걸리긴 했지만 큰 흐름은 이해한것 같다.
생각보다 그림도 친절하고 설명이 잘 되어있다고 느꼈다.
흐름을 알고 나니 무엇을 디버깅해야할지 감이 온것같다 👍 (FilterChainProxy)
