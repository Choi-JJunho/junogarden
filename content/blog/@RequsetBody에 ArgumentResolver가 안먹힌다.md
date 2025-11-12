---
title: '@RequsetBody에 ArgumentResolver가 안먹힌다?'
description: '부제 : RequestBodyAdvice에 대해 알아보자'
date: 2023-04-23T07:49:54.656Z
tags:
  - ArgumentResolver
  - RequestBody
  - Spring Boot
---
# 서론

[지난 글](https://velog.io/@junho5336/Spring%EC%97%90%EC%84%9C-%EC%96%B4%EB%96%BB%EA%B2%8C-%EC%96%B4%EB%85%B8%ED%85%8C%EC%9D%B4%EC%85%98%EC%97%90-%EB%94%B0%EB%9D%BC-%EC%97%AD%ED%95%A0%EC%9D%B4-%EC%83%9D%EA%B8%B8%EA%B9%8C)에 이어서 ArgumentResolver를 사용하려 했으나 @RequestBody를 붙이니 ArgumentResolver가 동작하지 않았다!!!

```java
@RestController
public class MyController {

    @GetMapping("/validTest")
    public MyUser argumentTest(@MyValid @RequestBody MyUser value) {
        return value;
    }
}
```
```java
public class MyUser {
    private String name;

    MyUser() {
    }

    public String getName() {
        return name;
    }
}
```

구조는 위와 같이 변경되었다.
기존에 String을 인자로 받던 떄와는 다르게 MyUser라는 객체를 통해 바인딩을 한다.
이 때 Header에 `participants`라는 값이 없거나  `participants` == `juno` 라면 예외가 발생하는 것이 정상적인 시나리오여야한다.

![](/images/52bea0c3-8dd4-4f50-8e08-3122b77d2b3d-image.png)

하지만 결과는 위처럼 예외가 발생하지 않는 모습을 볼 수 있다.

어떠한 이유로 `@RequestBody`를 사용했을 때 ArgumentResolver가 동작하지 않는지 확인해보자.

# @RequestBody

![](/images/d66a2a4f-0e04-4556-b638-32609ee0edce-image.png)

`@RequestBody`는 ArgumentResolver의 구현체인 `RequestResponseBodyMethodProcessor`에 의해 처리된다.


해당 구현체를 확인하면 다음과 같이 @RequestBody를 찾아서 사용한다는 것을 알 수 있다.

```java
	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.hasParameterAnnotation(RequestBody.class);
	}
```

`@MyValid`, `@RequestBody`를 선언함으로써 `CustomArgumentResolver`,`RequestResponseBodyMethodProcessor`가 동작한다. 

즉, 1개의 객체 생성을 위해 2개의 ArgumentResolver 처리 어노테이션이 붙어 있게 되는 꼴이다.

ArgumentResolver의 우선순위 상 `@RequestBodty`를 수행하는 ArgumentResolve의 우선순위가 더 높기 때문에 위와같은 현상이 발생한다.

다시말해 `@RequestBody`의 우선순위가 높고, `RequestResponseBodyMethodProcessor`를 거쳐 값이 이미 객체로 만들었기 때문에 기존의 ArgumentResolver로 동작하지 않는다.

## 객체를 만든 뒤의 처리방법?

우선순위 때문에 ArgumentResolver가 동작하지 않는다는 점을 알게 되었다.

그렇다면 어떻게 `@RequestBody`가 붙어있는 값에 대한 처리를 추가로 해줄 수 있을까?

## RequestBodyAdvice

Spring에서는 `RequestBodyAdvice`라는 인터페이스를 제공하고있다.

해당 인터페이스를 상속받으면 `@RequestBody` 어노테이션이 선언된 부분에 대해서 추가적인 작업을 수행할 수 있다.

생성한 구현체를 사용하기 위해서는 `RequestMappingHandlerAdapter`에 구현체를 직접 등록하거나 `@ControllerAdvice` 어노테이션을 붙여주는 방법이 있다.

`RequestBodyAdvice`는 다음과 같은 메소드들을 제공한다. 해당 메소드들을 구현하면 `@RequestBody`의 동작을 커스터마이징할 수 있다.

```java
public interface RequestBodyAdvice {

	boolean supports(MethodParameter methodParameter, Type targetType,
			Class<? extends HttpMessageConverter<?>> converterType);

	HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter,
			Type targetType, Class<? extends HttpMessageConverter<?>> converterType) throws IOException;

	Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter,
			Type targetType, Class<? extends HttpMessageConverter<?>> converterType);

	@Nullable
	Object handleEmptyBody(@Nullable Object body, HttpInputMessage inputMessage, MethodParameter parameter,
			Type targetType, Class<? extends HttpMessageConverter<?>> converterType);
}
```

- supports: 해당 RequestBodyAdvice를 적용할지 여부를 결정함
- beforeBodyRead: body를 읽어 객체로 변환되기 전에 호출됨
- afterBodyRead: body를 읽어 객체로 변환된 후에 호출됨
- handleEmptyBody: body가 비어있을때 호출됨

### 구현하기

시나리오를 다시 구성해보자

```java
@RestController
public class MyController {

    @GetMapping("/validTest")
    public MyUser argumentTest(@MyValid @RequestBody MyUser value) {
        return value;
    }
}
```

위와같은 요청이 있을 때

```java
public class MyUser {
    private String name;
    private LocalDateTime time = null;

    MyUser() {
    }

    public String getName() {
        return name;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}
```

`MyUser` 객체에 현재 시간을 넣어주는 동작을 추가해보자.

### CustomRequestBodyAdvice

위에서 설명했던 RequestBodyAdvice를 상속받는 CustomRequestBodyAdvice를 생성해보자

#### supports()

```java
@Override
public boolean supports(MethodParameter methodParameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
    return methodParameter.hasParameterAnnotation(MyValid.class) && targetType.getTypeName().equals(MyUser.class.getTypeName());
}
```

supports 메소드를 오버라이드했다.
`@MyValid` 어노테이션이 달려있고, 해당 객체의 타입이 MyUser인 경우 동작을 수행한다.

#### beforeBodyRead()

```java
@Override
public HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) throws IOException {
    return inputMessage;
}
```

객체로 변환되기 전에 처리할 동작을 정의한다.
특별한 처리 없이 값을 반환한다.

#### handleEmptyBody

```java
@Override
public Object handleEmptyBody(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
    return body;
}
```

body가 비어있을 때 동작을 정의한다.
특별한 처리 없이 값을 그대로 반환한다.

#### afterBodyRead()

```java
@Override
public Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
    MyUser user = (MyUser) body;
    user.setTime(LocalDateTime.now());
    return user;
}
```

객체로 변환된 후의 동작을 정의한다.
이곳에서 객체에 현재 시간값을 넣어준다.

### 전체 코드

```java
@RestControllerAdvice
public class CustomRequestBodyAdvice implements RequestBodyAdvice {

    @Override
    public boolean supports(MethodParameter methodParameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return methodParameter.hasParameterAnnotation(MyValid.class) && targetType.getTypeName().equals(MyUser.class.getTypeName());
    }

    @Override
    public HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) throws IOException {
        return inputMessage;
    }

    @Override
    public Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        MyUser user = (MyUser) body;
        user.setTime(LocalDateTime.now());
        return user;
    }

    @Override
    public Object handleEmptyBody(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return body;
    }
}
```
따라서 CustomRequestBodyAdvice는 위와같이 구성된다.
Spring Bean 등록을 위해 클래스에 `@RestControllerAdvice` 어노테이션도 붙여준다.

### 실행하기

![](/images/c59962ea-95b2-45ae-9cdd-86e5dd6cab95-image.png)

요청에 이름만 넣었지만 정상적으로 시간이 들어간 것을 확인할 수 있다.

다음과 같은 흐름으로 데이터가 처리되었음을 확인할 수 있다.

1. `@RequsetBody`를 통해 요청값이 객체로 바인딩 되었다.
2. `CustomRequestBodyAdvice`를 통해 `@MyValid` 어노테이션이 붙은 객체에 대해 다음 동작을 수행한다.
  a. 현재 시간을 생성된 MyUser에 넣는다.
3. 결과적으로 파라미터값이 바인딩완료 된 순간에는 이름과 시간값이 모두 포함되어있다.

# 결론

RequestBodyAdvice를 상속받아 Custom하게 구현해봤다.

큰 흐름에서는 ArgumentResolver와 다를 것이 없지만 동일한 ArgumentResolver 동작 시 @RequestBody에 대한 ArgumentResolver가 우선순위를 가짐으로써 동작하지 않았기 때문에 위와 같은 흐름으로 학습을 진행해봤다.

AOP, Interceptor 등과 같은 방법을 이용할 수도 있겠지만 @RequestBody에 대한 처리라는 관심사로 본다면 RequestBodyAdvice를 사용하는것이 적절해보인다.

# Reference

[[Spring] @RequestBody에 ArgumentResolver(아규먼트 리졸버)가 동작하지 않는 이유, RequestBodyAdvice로 @RequestBody에 부가 기능 구현하기](https://mangkyu.tistory.com/250)

[Github / InvocableHandlerMethod](https://github.com/spring-projects/spring-framework/blob/main/spring-web/src/main/java/org/springframework/web/method/support/InvocableHandlerMethod.java#L159)

[Docs : Interface RequestBodyAdvice](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/RequestBodyAdvice.html)

[Stack Overflow : Spring MVC - Why not able to use @RequestBody and @RequestParam together](https://stackoverflow.com/questions/19468572/spring-mvc-why-not-able-to-use-requestbody-and-requestparam-together)
