---
title: Javadoc으로 코드를 문서화 하기
description: javadoc에 대해 알아보자.
date: 2022-10-29T06:53:22.841Z
tags:
  - Java
  - JavaDoc
  - 주석
---
# 서론 

Java로 코드를 작성하면서 해당 함수가 어떤 역할을 하는지 알려주기 위해 주석을 사용하곤한다.

보통 자바를 시작하거나 관련된 책 혹은 수업을 들을 때 주석을 작성하는 방법 3가지를 알게 된다.
`//` : 한줄 주석
`/* */` : 여러줄 주석
`/** */` : 문서화를 위한 주석

이번에 소개할 Javadoc은 바로 3번째 문서화를 위한 주석을 의미한다.

> **위키백과**
javadoc은 Java 소스 코드에서 HTML 형식의 API 문서를 생성하기 위해 Sun Microsystems에서 Java 언어용으로 만든 문서 생성기입니다.

# Javadoc 사용하기
방법은 간단하다.
해당 메소드 혹은 함수(변수도 가능하다)의 상단에 `/** */`형태로 설명을 작성해주면 된다.

![](/images/e1fe9495-6639-4deb-84b6-d54284d2f498-image.png)

IntelliJ를 기준으로 해당 함수위에 마우스를 올렸을 때 함수의 설명을 볼 수 있다.
![](/images/9ca7fc9c-1e1b-4c3e-b554-0f0e48b246cd-image.png)

Eclipse에서는 이렇게 보인다고한다. [[출처]](https://androphil.tistory.com/212?category=423962)
![](/images/17f299a9-80f8-431a-b7b4-c96952e511f8-image.png)


## Annotation
위에서 봤듯이 `@param`, `@return`과 같은 Annotation을 이용하여 기술하는 방식도 있다.

다음과 같은 기능들이 있으니 참고하면 좋을 것 같다.

``` java
@author : 코드 소스 작성자

@deprecated : 해당 클레스(구현체)의 삭제 또는 지원이 중단되는 것을 알려줌

@exception : 예외처리할 수 있는 것들을 정의, 알파벳 순

@param : 매개변수 메서드, 생성자 설명

@return : 리턴값 설명

@see : 파일이 참조하는 다른 클래스와 메서드 등

@serial : Serializeable 인터페이스에 사용

@serialData : writeObject writeExternal 메소드로 작성된 데이터 설명

@serialField : serialPersistnetFields 모든 배열에 사용됨

@since : 해당 클래스가 추가된 버전

@throws : @exception처럼 예외처리하는 것들을 정의

@version : 구현체, 패키지 버전 명시
```

# 작성 방식
[다음 글](https://johngrib.github.io/wiki/java/javadoc/)에서 javadoc을 보다 간단명료하게 작성하기위한 방법을 알 수 있었다.

아래에 해당 내용 중 가장 중요하다고 생각한 내용 일부만 간단하게 정리한다.
아래 내용보다 더 좋은 내용들을 다루고 있으니 위 글을 읽어보는것을 추천한다.

- 내용에는 리턴값을 명시한다.
- 구현 내용에 의존하지 않는다.

``` java
/** 주어진 페이지의 각 자리수 합을 구한다. */ ❌
/** 주어진 정수의 각 자리수 합을 반환한다. */ ✅
```

- @param
`@param 파라미터-이름 설명` 형태로 작성한다.
`ex) @param integer 변환할 정수`

- @return
명사형으로 짧게 작성한다.
`ex) 비어 있는 문자열이면 true`

# Reference

https://agileryuhaeul.tistory.com/entry/Javadoc%EC%9D%B4%EB%9E%80-Javadoc-%EC%82%AC%EC%9A%A9%EB%B0%A9%EB%B2%95

https://suzyalrahala.tistory.com/42

https://johngrib.github.io/wiki/java/javadoc/

https://ko.myservername.com/what-is-javadoc-how-use-it-generate-documentation#What_Is_JavaDoc
