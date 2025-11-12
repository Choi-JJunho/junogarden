---
title: 중복된 이름의 클래스를 Bean으로 등록하기
description: >-
  동일한 이름의 클래스를 Bean으로 생성할 때 BeanDefinitionStoreException이 발생한다. 왜 이런 오류가 발생하고
  어떻게 해결할지 정리해보자.
date: 2022-10-28T08:28:33.074Z
tags:
  - Spring Boot
  - exception
---
# 서론 
동일한 이름의 클래스를 Bean으로 생성할 때 BeanDefinitionStoreException이 발생한다.

![](/images/acee131e-b3b5-4dc9-8d15-c6567c1617f4-image.png)

왜 이런 오류가 발생하고 어떻게 해결할지 정리해보자.

# 문제 원인 파악

![](/images/fdcb3b00-4cca-494f-9c92-427b031d1f7f-image.png)

[공식문서](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-scanning-name-generator)를 확인해보면 Spring에서 Bean을 생성할 때 Bean의 이름이 별도로 지정되어있지 않다면 클래스명을 특정 규칙을 통해 변환하여 지정한다고 한다.

> [Bean Naming Conventions](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-beanname)를 보면 시작하는 단어는 소문자인 camel-case를 사용한다고 한다.
![](/images/e2556f87-6d4f-4e55-821e-37cae1d97455-image.png)

만약 지정된 이름이 없는 Bean의 Defult Naming 전략을 변경하고싶다면 `BeannameGenerator`를 상속하여 custom하게 구현할 수 있다.

![](/images/44468289-b2fe-4b77-964b-7cfc32e797b9-image.png)

> Spring 5.2.3부터는 [FullyQualifiedAnnotationBeanNameGenerator](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/FullyQualifiedAnnotationBeanNameGenerator.html) Class 를 이용하여 다른 패키지에 있는 동일한 이름의 클래스에 대해 이름을 다르게 지을 수 있다고 한다.

# 적용
`CustomBeanNameGenertor` Class를 생성하여 BeannameGenerator를 구현한다.
``` java
public class CustomBeanNameGenerator implements BeanNameGenerator {

    @Override
    public String generateBeanName(BeanDefinition beanDefinition, BeanDefinitionRegistry beanDefinitionRegistry) {
        final String result;
        result = generateFullBeanName((AnnotatedBeanDefinition) beanDefinition);
        return result;
    }

    private String generateFullBeanName(final AnnotatedBeanDefinition definition) {
        return definition.getMetadata().getClassName();
    }
}
```

Applciation 구동부에 @ConponentScan의 옵션을 설정해줌으로써 defualt 전략이 `CustomBeannameGenerator`를 참고하도록 한다.
``` java
...
@ComponentScan(nameGenerator = CustomBeanNameGenerator.class)
public class Application extends SpringBootServletInitializer {

    public static void main(String[] args) {
    }
}
```

# Reference

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html

https://eastglow.github.io/back-end/2018/12/30/Spring-Bean-%EC%83%9D%EC%84%B1-%EC%8B%9C-%EC%9D%B4%EB%A6%84%EC%97%90-%ED%8C%A8%ED%82%A4%EC%A7%80%EB%AA%85%EA%B9%8C%EC%A7%80-%ED%8F%AC%ED%95%A8%ED%95%98%EA%B8%B0.html

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html
