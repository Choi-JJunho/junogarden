---
title: Redis
description: SpringBoot Project에 Redis를 적용시키기 위해 Redis에 대해 알아보는 시간을 가져보자.
date: 2022-07-09T08:29:05.039Z
tags:
  - Redis
  - Spring Boot
---
# 서론
SpringBoot Project에 Redis를 적용시키기 위해 Redis에 대해 알아보는 시간을 가져보자.

![redis](/images/05dc4459-da3b-4a52-b53f-986734ffad45-image.png)


# 본론

## Cache란?

Redis에 대해 알아보기 전 Cache에 대해 먼저 짚고 넘어가야할 필요가 있다.
Cache는 자주 사용하는 데이터나 값을 미리 복사해놓는 임시 장소를 가리킨다.
이는 저장공간이 비교적 작고, 빠른 성능을 제공한다.

![application logic](/images/eadd6a04-58af-45de-806d-16f34f719bb2-image.png)

cache는 일반적으로 위와 같은 flow로 사용된다.
동일한 flow에서 사용방식에 따라 look aside cache, write back으로 나뉜다.

### look aside cache (Lazy Loading)

캐시에 데이터가 있을 시 (cache hit) 캐시에서 데이터를 가져오고, 캐시에 데이터가 없는 경우(cache miss)에는 DB에서 데이터를 가져와 다시 캐시에 저장하고 결과를 반환한다.

### write back

데이터를 캐시에만 기록하며 이후 캐시에 있는 데이터를 DB에 한번에 등록한다.
쓰기가 많이 일어나도 캐시에만 업데이트되기 때문에 빠른 처리가 가능하다.
하지만 캐시가 휘발성 메모리기 때문에 데이터 유실 가능성이 있다.

## Redis란?

Redis(Remote Dictionary Server) 는 오픈소스로 NoSQL이다.
외부에서 사용 가능한 Key-Value 쌍의 해시맵 형태의 서버로 별도의 쿼리 없이 Key값을 통해 빠르게 결과를 가져올 수 있다. 또한 메모리에서 데이터를 처리하여 작업속도가 빠르다.

### Redis의 특징

레디스의 특징은 다음과 같다.

- 영속성을 지원하는 인 메모리 데이터 저장소
- List, Set, Sorted Set, Hash와 같은 Collection을 지원한다.
- 싱글 스레드 방식으로 인해 연산을 원자적으로 수행 가능

### 영속성을 지원한다고?

메모리에서 데이터를 처리하는데 영속성을 보장한다는게 이상하게 보였다.
Redis는 영속성을 보장하기위해 데이터를 디스크에 저장할 수 있다고한다.
서버가 내려가도 디스크에 저장된 데이터를 읽어서 메모리에 로딩한다.

데이터를 디스크에 저장하는 방식은 크게 두가지가 있다.

1. RDB (Snapshotting) 방식
순간적으로 메모리에 있는 내용 전체를 .rdb 형태로 디스크에 옮겨담는다.
예상하지 못한 작동중단이 일어날 시 마지막으로 스냅샷이 생성된 이후의 자료는 유실될 수 있다는 단점이 있다.

2. AOF (Append On File) 방식
Redis의 모든 write / update 연산 자체를 모두 log파일에 기록하는 형태다.
지속성 측면에서 더 유리하고, 예상하지못한 작동중단이 발생해도 데이터 오염 문제가 발생하지 않는다.
하지만 AOF 파일이 동일한 데이터셋의 rdb파일보다 용량이 크다는 단점도 있다.

## SpringBoot에 적용

SpringBoot 프로젝트에 Redis를 적용시키는 방법을 알아보자.

### dependency 적용

Maven
``` xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

```

Gradle
``` gradle
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

### application.yml 설정

redis는 기본포트로 6379포트를 사용한다.

``` yml
  redis:
    host: localhost
    port: 6379
```


### Redis Config

Redis 저장소와 연결하기위한 설정으로는 RedisRepository, RedisTemplate 두가지 방법이 있다.
RedisRepository 방식은 객체로 Entity를 관리하는 방식으로 CrudRepository를 extends하여 사용할 수 있다.
아래는 RedisTemplate를 이용하는 방식을 사용해 볼 것이다.

Config
``` java
@Configuration
public class RedisConfig {
    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }
    @Bean
    public RedisTemplate<?, ?> redisTemplate() {
        RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        return redisTemplate;
    }
}
```

Service
``` java
@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate redisTemplate;

    public String redisConnectionTest() {
        final String key = "key";
        final String data = "value";

        final ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(key, data);

        return valueOperations.get(key);
    }
}
```

다음과 같이 잘 연결된 모습을 볼 수 있다.
![](/images/ce41863a-542b-4ef6-b376-cdfe908369d8-image.png)

# Reference

https://devlog-wjdrbs96.tistory.com/374
https://bcp0109.tistory.com/328
https://docs.spring.io/spring-data/data-redis/docs/current/reference/html/#reference
