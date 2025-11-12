---
title: final은 불변일까?
description: final이 정말 불변을 의미할까요?
date: 2023-02-26T08:14:55.221Z
tags:
  - Java
  - 사실불변아님
---
# 서론
지난 포스팅 [함수 파라미터의 final 키워드](https://velog.io/@junho5336/%ED%95%A8%EC%88%98-Parameter%EC%9D%98-final-%ED%82%A4%EC%9B%8C%EB%93%9C)의 내용 중 `final 키워드는 변경 불가능하다 라는 말에 핵심을 두고있다.`라는 문구를 작성했었다.

불변하다는 의미로 해당 문구를 작성했으나 `final은 불변이 아니다!` 라는 피드백을 받게 되어 final에 대해 다시 알아보는 시간을 가져보게 되었다.

# final이 뭔데?

[Wikipedia의 final(Java) 항목에](https://en.wikipedia.org/wiki/Final_(Java)) 서술되어있는 문구를 보면 다음과 같이 말하고있다.

>In the Java programming language, the final keyword is used in several contexts to define an entity that can only be assigned once.
- Java 프로그래밍 언어에서 final 키워드는 **`한 번만 할당할 수 있는 엔터티를 정의`**하기 위해 여러 컨텍스트에서 사용됩니다.

불변이 아니라는 말을 듣고 나니 **`한 번만 할당할 수 있는`** 이라는 문구가 굉장히 신경쓰인다.

변경 불가능이 아닌 한 번만 할당할 수 있다 라는 문구로부터 final 키워드와 친해지는 시간을 가져보자

# final의 사용

할당이라는 키워드에 초점을 두고 사용 위치에 따라 final이 어떤 역할을 하는지 알아보자.

## final과 class

![](/images/4dd93490-ce2f-4d09-96a0-cddc4ae063dd-image.png)

final 키워드를 클래스에 붙여줄 경우 해당 클래스는 상속할 수 없다.

## final과 method

![](/images/76f33c73-89f4-4b43-968c-c508f5149057-image.png)

final 메소드는 override 할 수 없다.
> override : 자식 클래스가 함수를 재정의할 수 있게 해주는 기능이다.

## final과 변수

![](/images/24a15975-6126-469e-ac07-3c43e212a3b4-image.png)

final 변수는 값을 재할당할 수 없다.

# 재할당 할 수 없다 != 불변이다

원시타입(primitive type)에 대해서 재할당 할 수 없다라는 말을 불변과 연관지을 수는 있어보인다.

하지만 객체에 대해서는 상황이 다르다.

불변 객체를 예로 들어보자.
불변 객체란 객체 생성 이후 내부 상태가 변하지 않는, 변경할 수 없는 객체를 의미한다.

![](/images/c123037b-b63f-4cad-95a4-f9904b4c9326-image.png)

final로 선언한 `Hello`라는 객체가 있다고 가정해보자

Hello 객체를 final로 선언했음에도 `setNumber()` 메소드를 통해 객체 내부의 상태값이 변경되는 것을 볼 수 있다.
객체의 내부 상태가 변하는 상황을 불변이라고 보기는 어렵다.

``` java
@Test
void final_키워드가_불변이라고_들었습니다() {
    Hello hello = new Hello();
    List<String> words = hello.getWords();

    words.add("hello");
    words.add("world");

    Assertions.assertThat(words).containsExactly("hello", "world");
    Assertions.assertThat(hello.getWords()).containsExactly("hello", "world");
}

public class Hello {

    private final List<String> words = new ArrayList<>();

    public List<String> getWords() {
        return words;
    }
}
```

내부에 List를 가지고있는 Hello 객체를 살펴보자.
해당 List를 꺼내와서 임의로 값을 조작할 수 있기 때문에 위와같은 상황도 불변이라고 보기 어렵다.

# 그래서 불변 어떻게하는건데?

불변객체에 보다 가까워지기 위해서 다음과 같은 시도를 할 수 있다.

## 생성자 초기화

``` java
public class Hello {

    private final String word;

    public Car(String word) {
			this.word = word;
		}

}
```

final로 선언된 필드값을 생성자에서만 주입 받는다면 해당 상태에 대해서는 불변을 보장할 수 있다.

> 객체를 필드로 가지고있다면?
무한 루프로 이야기가 흘러간다. (무시해도 좋다)
필드로 가지고있는 객체에 대해 선언된 필드값을 생성자에서만 주입받도록 하고,
그 객체가 필드로 가지고있는 객체에 대해 선언된 필드값을 생성자에서만 주입받도록 하고,
그 객체가 필드로 가지고있는 객체가 필드로 가지고 있는 객체에 대해 선언된 필드값을 생성자에서만 주입받도록 하고 ... 😅


## Immutable Collection

객체 내부에서 Collection을 사용한다면 Unmodifiable Collection을 사용하여 List에 대한 불변을 고려할 수 있다.

``` java
public class Hello {

    private final List<String> words;

    public Car(List<String> words) {
		this.words = words;
	}
    
    public List<String> toUnmodifiableWords() {
        Collections.unmodifiableList(words);
    }

}
```
위와같은 방식을 사용할 경우 List 그 자체로는 불변일지 모르지만 내부에 존재하는 객체에 대해서 해당 객체의 주소값을 알 접근 및 변경 가능성이 존재하기 때문에 불변을 보장한다고 보기 어렵다.

List의 내부까지 불변으로 만들고 싶다면 다음과 같은 방법으로 값을 복사하여 Unmodifiable List로 반환하는 방법이 있다.

``` java 
public class Hello {

    private final List<String> words;

    public Car(List<String> words) {
		this.words = words;
	}
    
    public List<String> toUnmodifiableWords() {
        Collections.unmodifiableList(new ArrayList<String>(words));
    }
}
```

복사 비용을 고려하여 어디까지 방어적 복사를 고려할지 생각해보고 사용하는것이 좋아보인다.

# + final은 상수인가요?

우리는 `수식에서 변하지 않는 값`을 상수라 칭한다.

final은 재할당이 되지 않으므로 상수라고 할 수 있을까? 

``` java
public class Hello {

    private final String word = "hello World!";
    
    public String getWord() {
        this.word;
    }
}
```

위와 같은 간단한 예제를 통해서는 Yes라는 답을 할 수도 있겠다.

한 발짝 물러서서 보다 넓은 관점에서 바라보면 "이 말이 옳은걸까?" 라는 의문을 가지게 될것이다.

``` java
public class Hello {

    private final String word;

    public Car(String word) {
		this.word = word;
	}
    
    public String getWord() {
        this.word;
    }
}
```

생성자 주입을 통해 필드를 초기화하는 객체의 관점에서 보면 final 필드는 객체마다 다르고 생성자의 인수로 초기화되면서 여러가지 값을 가질 수 있기 때문에 final을 상수라고 보기 어려울 것 같다.

``` java
public class Hello {
    private final String word;
...
}

public class Hello {
    private static final String word;
...
}
```
여기서 한 발짝 더 물러나서 메모리의 관점에서 보면 static이 아닌 단순한 final로 선언한 변수는 객체마다 저장되기 때문에 메모리 측면에서 상수로 보기가 어렵다.

## 그래서 상수가 뭔데?

따라서

한번 초기화 되면 변하지않고, 
클래스에만 포함되고,
객체별로 저장되지 않는

`static final` 키워드를 통해 선언된 필드를 상수라고 할 수 있겠다.


# Reference

[final은 불변을 보장할까?](https://velog.io/@kbsat/final%EC%9D%80-%EB%B6%88%EB%B3%80%EC%9D%84-%EB%B3%B4%EC%9E%A5%ED%95%A0%EA%B9%8C)

[Java 불변 객체(Immutable Object) 에 대해 알아보자](https://devoong2.tistory.com/entry/Java-%EB%B6%88%EB%B3%80-%EA%B0%9D%EC%B2%B4Immutable-Object-%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)

[상수(Constant)란 무엇인가?](https://crazykim2.tistory.com/741)

[8. Java 자바 - final 필드와 상수 ](https://kephilab.tistory.com/51)
