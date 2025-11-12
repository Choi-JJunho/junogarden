---
title: Spring Security - DelegatingFilterProxy
description: SpringSecurity랑 슬슬 친해져볼까나?
date: 2024-07-30T00:08:28.634Z
tags:
  - NEXTERS
  - Spring Boot
  - Spring Security
---
# 서론

NEXTERS 25기 프로젝트를 진행하면서 프로젝트에 SpringSecurity를 적용하게 되었다.
아니 사실상 적용해줬다 라고 표현하는게 더 맞는 표현이라고 봐야겠지?!

같이 백엔드 파트를 담당하는 팀원이 SpringSecurity 사용경험이 있기도 하고 실제 회사에서도 이를 다루고 있어 이참에 제대로 배워보자! 라는 마음으로 SpringSecurity를 프로젝트에 적용줬고 이참에 공부해봐야겠다고 생각하여 찾아보게되었다.

![](/images/9e926869-93bf-4278-8a62-edf170b24a89-image.png)

아키텍처를 먼저 이해한 뒤 세부 요소를 보면 그 흐름이 잘 들어올거라는 생각이 든다.
[Security 문서](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-filters-review)를 보면 DelegatingFilterProxy부터 다양한 요소들이 있는 것을 볼 수 있다.
일단 DelegatingFilterProxy를 좀 자세히 정리해보고 좀 아니다싶으면 이후의 내용들은 간략하게라도 정리해볼까 싶다. 
(의욕과 일정에 따라 달라질수 있음 주의)

> 참고문서
https://docs.spring.io/spring-security/reference/servlet/architecture.html

SpringSecurity 아키텍처를 차근차근 확인해보자.

![](/images/a1024ed3-028d-466c-8db0-487ef47889e6-image.png)

Client요청을 Servlet 계층에서 FilterChain 형태로 처리한다. 

## DelegatingFilterProxy


![](/images/6b79b43a-3145-494f-aa9b-c08697157c16-image.png)

Spring에서 제공하는 Filter의 구현체 중 DelegatingFilterProxy라는 친구가 있다. `(Delegating: 위임)`
이는 컨테이너의 생명주기와 Spring ApplicationContext를 연결하는 역할을 수행한다.
말이 좀 어려운데 쉽게말해 서블릿 컨테이너와 Spring IoC 컨테이너의 다리 역할을 한다라고 볼 수 있다.

그림에서 보다시피 DelegatingFilterProxy는 Spring IoC 컨테이너가 관리하는 Filter Bean을 가지고 있다.
그리고 DelegatingFilterProxy 내부의 Bean Filter는 FilterChainProxy이다.
> FilterChainProxy: DelegatingFilterProxy에서 실제 작업을 위임받아 처리하는 프록시다.

```java

public class DelegatingFilterProxy extends GenericFilterBean {
    @Nullable
    private String contextAttribute;
    @Nullable
    private WebApplicationContext webApplicationContext;
    @Nullable
    private String targetBeanName;
    private boolean targetFilterLifecycle;
    @Nullable
    private volatile Filter delegate;
    private final Object delegateMonitor;

// ...

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Filter delegateToUse = this.delegate;
        if (delegateToUse == null) {
            synchronized(this.delegateMonitor) {
                delegateToUse = this.delegate;
                if (delegateToUse == null) {
                    WebApplicationContext wac = this.findWebApplicationContext();
                    if (wac == null) {
                        throw new IllegalStateException("No WebApplicationContext found: no ContextLoaderListener or DispatcherServlet registered?");
                    }

                    delegateToUse = this.initDelegate(wac);
                }

                this.delegate = delegateToUse;
            }
        }

        this.invokeDelegate(delegateToUse, request, response, filterChain);
    }

// ...

    protected void invokeDelegate(Filter delegate, ServletRequest request, ServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        delegate.doFilter(request, response, filterChain);
    }
```
위 코드를 보면 `DelegatingFilterProxy` 내부의 doFilter 부분과 doFilter의 마지막에서 호출하는 invokeDelegate에 대한 부분을 가져왔다.

해당 코드를 보면 delegate라는 필터의 doFilter를 이용하여 파라미터를 전달하고 있다.
delegate는 어떻게 생기는건가 다시 확인해보자.

## SecurityFilterAutoConfiguration

SpringBoot 환경에서는 AutoConfiguartion을 이용해 많은 값을 자동으로 설정해준다.
여기서 Security 설정과 관련된 `SecurityFilterAutoConfiguration`이라는 설정을 살펴보자.

```java
@AutoConfiguration(
    after = {SecurityAutoConfiguration.class}
)
@ConditionalOnWebApplication(
    type = Type.SERVLET
)
@EnableConfigurationProperties({SecurityProperties.class})
@ConditionalOnClass({AbstractSecurityWebApplicationInitializer.class, SessionCreationPolicy.class})
public class SecurityFilterAutoConfiguration {
    private static final String DEFAULT_FILTER_NAME = "springSecurityFilterChain";

    public SecurityFilterAutoConfiguration() {
    }

    @Bean
    @ConditionalOnBean(
        name = {"springSecurityFilterChain"}
    )
    public DelegatingFilterProxyRegistrationBean securityFilterChainRegistration(SecurityProperties securityProperties) {
        DelegatingFilterProxyRegistrationBean registration = new DelegatingFilterProxyRegistrationBean("springSecurityFilterChain", new ServletRegistrationBean[0]);
        registration.setOrder(securityProperties.getFilter().getOrder());
        registration.setDispatcherTypes(this.getDispatcherTypes(securityProperties));
        return registration;
    }

    private EnumSet<DispatcherType> getDispatcherTypes(SecurityProperties securityProperties) {
        return securityProperties.getFilter().getDispatcherTypes() == null ? null : (EnumSet)securityProperties.getFilter().getDispatcherTypes().stream().map((type) -> {
            return DispatcherType.valueOf(type.name());
        }).collect(Collectors.toCollection(() -> {
            return EnumSet.noneOf(DispatcherType.class);
        }));
    }
}
```
뭔가 많은데 몇몇 군데만 핵심적으로 살펴보자.

우선 `DelegatingFilterProxyRegistrationBean`을 선언한 부분을 보면 `springSecurityFilterChain`이 있을때 Bean으로 등록한다고 명시되어있다.

> `@ConditionalOnBean` : 특정 Bean이 존재하면 Bean을 등록한다.

`springSecurityFilterChain`은 언제 등록할까?

```java

public abstract class AbstractSecurityWebApplicationInitializer implements WebApplicationInitializer {
    private static final String SERVLET_CONTEXT_PREFIX = "org.springframework.web.servlet.FrameworkServlet.CONTEXT.";
    public static final String DEFAULT_FILTER_NAME = "springSecurityFilterChain";
    private final Class<?>[] configurationClasses;

// ...

    private void insertSpringSecurityFilterChain(ServletContext servletContext) {
        String filterName = "springSecurityFilterChain"; // 👈 이거!!
        DelegatingFilterProxy springSecurityFilterChain = new DelegatingFilterProxy(filterName);
        String contextAttribute = this.getWebApplicationContextAttribute();
        if (contextAttribute != null) {
            springSecurityFilterChain.setContextAttribute(contextAttribute);
        }

        this.registerFilter(servletContext, true, filterName, springSecurityFilterChain);
    }
// ...
}
```

`AbstractSecurityWebApplicationInitializer`는 `springSecurityFilterChain`이라는 이름의 필터를 서블릿 컨텍스트에 등록하는 역할을 한다.

이 등록된 필터는 DelegatingFilterProxy를 사용해서 Spring 애플리케이션 컨텍스트에서 springSecurityFilterChain이라는 이름의 빈을 찾고, 해당 빈을 필터로 위임한다.

> `AbstractSecurityWebApplicationInitializer`: WebApplicationInitializer의 구현체로 웹 컨테이너와 DelegatingFilterProxy를 등록하는데 사용된다.

이 필터는 `DelegatingFilterProxyRegistrationBean`을 다루는데 이를 조금 더 살펴볼 필요가 있다.

## DelegatingFilterProxyRegistrationBean

`DelegatingFilterProxyRegistrationBean`는 Servlet Container Filter에 필터를 등록할 수 있게 도와준다.

```java
public class DelegatingFilterProxyRegistrationBean extends AbstractFilterRegistrationBean<DelegatingFilterProxy> implements ApplicationContextAware {
    private ApplicationContext applicationContext;
    private final String targetBeanName;
// ...
    public DelegatingFilterProxy getFilter() {
        return new DelegatingFilterProxy(this.targetBeanName, this.getWebApplicationContext()) {
            protected void initFilterBean() throws ServletException {
            }
        };
    }
// ...
}
```

getFilter() 메소드를 보면 DelegatingFilterProxy를 생산하는 것을 볼 수 있다.
이 Bean을 통해 DelegatingFilterProxy가 탄생한다.

잘 보면 이 클래스가 `AbstractFilterRegistrationBean`을 상속하고 있는 모습을 볼 수 있는데 이 클래스는 `ServletContextInitializer`를 구현하고 있다.

이 때문에 DelegatingFilterProxyRegistrationBean에서 만들어낸 필터를 서블릿 컨테이너에 등록할 수 있게 되는 것이다.
> ServletContextInitializer는 Servlet 3.0+ 에서만 지원한다고 한다.

# 정리
- `DelegatingFilterProxy`: 서블릿 컨테이너와 Spring IoC 컨테이너의 다리 역할을 한다. Spring Bean을 가지고있다.

- `DelegatingFilterProxyRegistrationBean`: 서블릿 컨테이너의 필터에 Spring Context를 주입한 DelegatingFilterProxy를 넣어준다.

- `SecurityFilterAutoConfiguration`: SpringBoot의 AutoConfiguration기능으로 `DelegatingFilterProxyRegistrationBean`을 등록해주는 역할을 한다.

- `AbstractSecurityWebApplicationInitializer`: WebApplicationInitializer의 구현체로 웹 컨테이너와 DelegatingFilterProxy를 등록하는데 사용된다. (WebApplicationInitializer를 구현한 클래스다)

## AbstractSecurityWebApplicationInitializer 동작흐름

AbstractSecurityWebApplicationInitializer 설명이 조금 추상적으로 느껴져 동작 흐름을 다시한번 정리해봤다.
(Thanks To GPT선생님)

1. **애플리케이션 시작**:
   - 웹 애플리케이션이 시작되면, `WebContainer`는 `WebApplicationInitializer` 인터페이스를 구현한 클래스를 찾는다.
   
2. **초기화**:
   - `SecurityWebApplicationInitializer`가 `AbstractSecurityWebApplicationInitializer`를 상속받았기 때문에, Spring Security 필터 체인이 자동으로 등록된다.
   
3. **필터 체인 구성**:
   - `DelegatingFilterProxy`가 `springSecurityFilterChain` 빈을 찾아서 모든 요청을 Spring Security 필터 체인으로 위임합니다.

4. **보안 설정 적용**:
   - `SecurityConfig` 클래스에서 정의한 보안 설정이 모든 요청에 적용됩니다.

# 후기

일단 파고들면서 보려다보니 시간이 오래걸린다. 그만큼 DelegatingFilterProxy랑 친해진 느낌은 드는데 인사해야할 키워드가 워낙 많아서 이 방식은 시간이 너무 오래걸릴거같다.

일단 전체적으로 가볍게 한번 정리하고 딥다이브는 나중에 구현된 코드까보면서 다시해봐야겠다.

# Reference

- https://velog.io/@yaho1024/spring-security-delegatingFilterProxy
- https://docs.spring.io/spring-security/reference/servlet/architecture.html
