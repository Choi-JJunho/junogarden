---
title: "Random 함수와 동시성"
description: "두개 이상의 스레드가 동시에 Random 함수에 접근한다면 어떤 일이 일어날까?"
date: 2024-01-21T08:08:55.338Z
tags: ["Java","동시성"]
---
# 서론

코인 이슈를 해결하는 도중에 ThreadLocalRandom을 사용하는 코드를 발견하여 이에 대한 내용을 정리해본다.

# 상황 정의

![](/images/c41fd39f-3a90-431c-bc09-1a1df98b177c-image.png)

현재 KOIN은 회원가입 시 인증코드를 이메일로 전송하는 로직을 가지고있다.

이 때 인증을 위한 코드를 구현하기 위해 다음과 같은 흐름을 생각해볼 수 있다.

1. 클라이언트에서 회원가입 Request를 전송한다.
2. Request 정보를 받은 서버는 회원 정보를 저장한다. (미인증상태)
3. 회원에게 이메일을 보내고 클라이언트에게 Response를 반환한다. (외부 API 사용)

위 흐름에서 3번 과정이 외부 API를 호출하고있으므로 시간이 오래 걸릴 것이다.
이 모든 과정이 동기적으로 흘러간다면 회원가입 로직 하나가 엄청 오래 걸릴것이다.

3번 과정(이메일을 보내는 과정)은 별도의 스레드에게 책임을 넘기고 클라이언트에게 Response를 보내도록 비동기 방식을 채택할 수 있다.

이때 이러한 비동기 방식을 채택하면서 한가지 문제점이 발생할 수 있다.

# 문제 정의

인증코드를 생성하는 시나리오를 다음과 같이 정의한다.

```java
public class RandomGenerator {
	
    private final Random random = new Random();
    
    private static int getCertificationCodeNumber() {
        return random.nextInt(1_000_000);
    }

    public static CertificationCode getCertificationCode() {
        return CertificationCode.from(String.format("%06d", getCertificationCodeNumber()));
    }
}
```

Random 클래스를 이용하여 난수를 생성하고 6자리 숫자 형태의 코드를 생성하는 단순한 로직이다.

만약 두개의 스레드가 동시에 nextInt() 메소드를 수행하면 어떤 일이 일어날까?

## 살펴보기

`nextInt()` 의 구현부를 자세히 살펴보자.

```java
    public int nextInt(int bound) {
        if (bound <= 0)
            throw new IllegalArgumentException(BadBound);

        int r = next(31);
        int m = bound - 1;
        if ((bound & m) == 0)  // i.e., bound is a power of 2
            r = (int)((bound * (long)r) >> 31);
        else {
            for (int u = r;
                 u - (r = u % bound) + m < 0;
                 u = next(31))
                ;
        }
        return r;
    }
```

얼핏 보면 객체의 상태를 변경하지 않아 큰 상관없는게 아닐까? 싶지만 진짜 문제는 next() 메소드에 존재한다.

```java
    protected int next(int bits) {
        long oldseed, nextseed;
        AtomicLong seed = this.seed;
        do {
            oldseed = seed.get();
            nextseed = (oldseed * multiplier + addend) & mask;
        } while (!seed.compareAndSet(oldseed, nextseed));
        return (int)(nextseed >>> (48 - bits));
    }
```
바로 여기서 seed를 설정하는 곳에서 문제가 발생한다.

여러 스레드가 동시에 seed 값을 수정하려고하면 다음과 같은 문제가 발생할 수 있다.

> CompareAndSwap
스레드가 원자적으로 수행되는것을 보장하기 위해 메모리의 최신값을 기준으로 연산하고있는지 확인하는 작업을 이야기한다.
https://en.wikipedia.org/wiki/Compare-and-swap

1. A Thread가 Random 연산을 수행한다. (CompareAndSwap의 seed: A)
2. B Thread가 Random 연산을 수행한다. (CompareAndSwap의 seed: A)
3. A Thread가 연산을 마치고 seed 값을 변경한다. (seed: A')
4. B Thread가 연산을 마치려고 시도하지만 연산을 시도한 값과 현재 설정된 값이 달라서 (상태가 변경되어) 연산을 실패처리한다.
(CompareAndSwap의 기준값: A, 현재 값: A')

위와 같이 동시에 연산을 수행하면서 발생하는 공유하는 자원이 불일치하는 현상 때문에 Thread가 연산을 실패하는 상황이 생길 수 있다.
대량의 데이터를 처리하는 과정에서 이러한 실패 작업이 많아질수록 성능에 영향을 미칠 것이다.

그렇다면 어떻게 해결할 수 있을까?

## 해결방식

Random을 호출하는 부분에 lock을 걸어서 해결할 수도 있겠지만 lock이 걸리는 순간 Thread가 해당 작업을 점유하여 다른 Thread가 작업을 처리할 수 없게 된다. 이렇게되면 오히려 시간이 더 오래걸릴 수 있다.

Java에서는 ThreadLocalRandom 클래스를 제공한다.

간단하게 설명하자면 Thread별로 seed값을 별도로 관리하도록 하여 공유자원으로서 seed를 사용하지 않는 방식으로 구현되어있다.

java 8 이전에는 Thread별로 Random 인스턴스를 가지도록 구성이 되었다.
이는 스레드별로 `new Random()`을 통해 인스턴스를 하나씩 가지는 구조가 되어 불필요한 인스턴스화가 반복되는 구조다.

java 8부터는 Thread 자체에 seed값을 구성하여 굳이 Random 인스턴스를 가지지 않아도 되도록 개선되었다.

> Thread class의 threadLocalRandomSeed 값이 선언되어있다.
> 
> ![](/images/caed1f3d-e2df-4e5e-b181-d10fa94f1583-image.png)

# 후기

이렇게 ThreadLocalRandom을 사용하는 이유에 대해 알아봤다.
비동기 처리를 할때는 항상 1억명 이상의 사용자 혹은 요청이 온다고 가정하고 생각해보는 습관을 가져보는게 좋을 것 같다. 스레드 관점에서 생각하는 연습도 자주 해봐야겠다.

# Reference

https://www.baeldung.com/java-thread-local-random