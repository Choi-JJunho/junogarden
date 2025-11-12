---
title: Swagger와 Tomcat에게 괴롭힘당한 썰
description: "서론  >TMI\U0001F440 SpringBoot를 이용해서 Swagger 2.9.2를 적용한 프로젝트를 만들었고, 이를 빌드해서 Tomcat으로 배포를 하려고했다. SpringBoot를 처음 써보고 모든 프로젝트를 IntelliJ에 의존하던 지난 날의 경험들로 군대 사지방 개발"
date: 2021-10-21T13:49:35.891Z
tags:
  - Spring Boot
  - Swagger
  - Tomcat
---
# 서론

>**TMI👀**
SpringBoot를 이용해서 Swagger 2.9.2를 적용한 프로젝트를 만들었고, 이를 빌드해서 Tomcat으로 배포를 하려고했다.
SpringBoot를 처음 써보고 모든 프로젝트를 IntelliJ에 의존하던 지난 날의 경험들로 군대 사지방 개발을 진행하기에는 너무 나약했다.
배포과정은 어렵지 않았지만 결과가 대참사였고 인생 첫 해커톤에서 가장 많은 시간을 들인게 Swagger 설정이 되었다...


`mvn clean spring-boot:run`으로 spring-boot 내장 서버로 구동할 때는 문제가 없었다.
하지만 빌드를 하고 Tomcat을 이용해 배포하려고 하니 아래와 같은 문제가 발생했다.

![](/images/af73690f-9b0b-4ca2-a673-e962a5cf702b-error.png)

잘못된 원인을 모르니 아무리 검색을 해봐도 명확한 답이 나오질 않았다.

> 혹시몰라 지인들에게 질문찬스를 요청했지만... 답은 나오지 않았다
![](/images/2bd85fd8-efc5-4c0e-8b8e-4de7c6058fcd-image.png)

---

# 문제 인식

## 구글링

우선 모든 문제는 구글링으로 시작한다.

![](/images/95c7fcb0-0bcc-4108-bf0a-4d0443e480df-image.png)

Config Class에 @EnableSwagger2 설정, 버전을 3.0.0으로 높이기, SpringSecurity와 설정 충돌 문제 등등 많은 해결방안이 있었지만 모두 나에게 해당되지 않는 해결방안이였다.

군대에서 약 3일간 개인정비시간을 소모해서 찾아봤지만 프로젝트 내 설정을 바꿔서 해결할 수 없었다.

Spring Boot에 대한 이해 부족이 화근이였다.

배포할때마다 mvn spring-boot:run을 계속 돌려주면 되긴 하겠지만 말도안되기 때문에 이 방법은 시도하고싶지도 않았다.

머리를 쥐어싸고 있는데 문득 눈에 보이는게 있었다.

>
![](/images/8efc7fab-0623-4544-b415-87242fae0c85-cat.png)
![](/images/bf63f7e9-8310-4da6-87f0-6dcfd9d2edf6-cat%20-%20%EB%B3%B5%EC%82%AC%EB%B3%B8.png)
![](/images/e2843c46-5778-48b8-8e06-3968c4336916-cat%20-%20%EB%B3%B5%EC%82%AC%EB%B3%B8%20(2).png)

Tomcat에 관련된 문제가있는게 아닐까??

---

# 해결과정

혹시 SpringBoot를 Tomcat에 배포하려면 뭔가 추가적인 설정이 필요한게 아닐까??

구글 검색 문구를 바꿨다.

`Spring Boot Tomcat 배포`

## SpringApplicationBuilder 설정하기

> Spiring Boot 는 기본적으로 `jar` 배포형태를 가지고 있다. 
tomcat 같은 웹서버도, db 도 다 내장으로 가질 수 있는 형태이기 때문에, **독립적인 프로그램이다** 라는 의미를 가지고 있다고 볼 수 있다.
`war` 파일은 웹 프로젝트, 즉 tomcat 과 같은 웹 서버 위에서 돌아가는 프로젝트라고 볼 수 있다.
[참고 사이트](https://4urdev.tistory.com/84)

`SpringApplicationBuilder`를 상속하여 Tomcat같은 Servlet Container 환경에서 SpringBoot 로 작성한 애플리케이션이 작동 가능 하도록 구성할 수 있다.

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
    
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }

}
```

추가로 설정해줘야하는 것이 있다면 pom.xml에서 package를 war로 설정하고 dependency를 추가하는 것이 있다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>CSK</groupId>
    <artifactId>ROOT</artifactId>
    <version>1</version>
    <packaging>war</packaging>
    <name>API</name>
    <description>2021 Army Hacker Thon ArMeal</description>
  ...

<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-tomcat</artifactId>
	<scope>provided</scope>
</dependency>
  ...
```

## 요약

1. SpringBoot에서 Tomcat과 같은 Container로 배포할 파일을 빌드하려면 `SpringApplicationBuilder` 설정을 해줘야한다.
2. 설정할 때 `pom.xml`에서 `packaging`과 `dependency`도 추가해줘야한다.
3. 해당 Swagger 오류는 복합적인 원인으로 설정이 꼬일 경우 발생하는 것 같다. 
마치 공부 초기에 마주했던 `NullpointerException` 같은놈이다...

# 후기

Swagger와 Tomcat에게 괴롭힘당했다고했지만 정작 SpringBoot가 범인이였다.
~~사실 기본기가 없는 내가 잘못이지~~😂

기존에 Spring 3로 개발할때 web.xml을 포함한 초기설정을 맞추는데만 시간을 많이 소모했었는데 SpringBoot에서는 이러한 설정들이 많이 생략되었다.

> **TMI👀**
Servlet 3.0이상의 버전에서 web.xml없이 배포가 가능해졌고, Tomcat 7.0 이상의 버전부터 Servlet 3.0을 지원한다고 한다.
web.xml 역할을 WebApplicationInitializer 인터페이스를 구현하여 프로그래밍적으로 ServletContext에 Spring IoC 컨테이너를 생성하여 추가할 수 있다고 한다.
[참고 사이트](https://medium.com/@SlackBeck/spring-boot-%EC%9B%B9-%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98%EC%9D%84-war%EB%A1%9C-%EB%B0%B0%ED%8F%AC%ED%95%A0-%EB%95%8C-%EC%99%9C-springbootservletinitializer%EB%A5%BC-%EC%83%81%EC%86%8D%ED%95%B4%EC%95%BC-%ED%95%98%EB%8A%94%EA%B1%B8%EA%B9%8C-a07b6fdfbbde)

Spring 3로만 개발을 시도해왔던 나로서는 이거 너무 편리한거같다...
![](/images/93690d0a-1ccc-42c1-a915-46b47330893e-image.png)

앞으로 토이프로젝트를할때 애용할거같다.
그래도 뭐든 기본이 중요한것같다.

# Reference
https://4urdev.tistory.com/84
https://serverwizard.tistory.com/165
https://medium.com/@SlackBeck/spring-boot-%EC%9B%B9-%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98%EC%9D%84-war%EB%A1%9C-%EB%B0%B0%ED%8F%AC%ED%95%A0-%EB%95%8C-%EC%99%9C-springbootservletinitializer%EB%A5%BC-%EC%83%81%EC%86%8D%ED%95%B4%EC%95%BC-%ED%95%98%EB%8A%94%EA%B1%B8%EA%B9%8C-a07b6fdfbbde
