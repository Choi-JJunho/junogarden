---
title: Postman 토큰 편하게 구성하기
description: postman에서 인증토큰을 클릭 한번으로 구성해봅시다
date: 2024-03-21T07:13:03.610Z
tags:
  - API
  - Postman
  - 백엔드
---
# 서론

API를 개발하면서 로컬환경에서 API가 정상적으로 동작하는지 테스트하려고한다.
이때 몇몇 API는 인증 토큰을 요청하기도한다.

가령 예를들면 이미지를 업로드하는 API가 있을 때 이 API는 인증된 사용자만이 사용할 수 있다.

이를 위해 `로그인 API 호출` - `반환값에서 토큰값 복사` - `Auth 탭에서 토큰 넣고 요청 보내기` 이 과정을 모든 job에서 반복해야한다.

조금은 편리하게 토큰값을 넣을 수 있도록 postman 설정을 구성해보자

# Postman

> Postman 설치 및 기본적인 사용방법은 생략한다.

우선 새로운 Collection을 생성한다.

![](/images/e865687a-adb7-4a05-9161-ad5d3c1352c9-image.png)

Add request를 눌러 Collection 내부에 request를 생성한다.

![](/images/14a249b3-6b6e-4097-ad96-b8d40242a3bc-image.png)

생성하면 아래와 같은 화면으로 구성된다.

![](/images/4309e8df-0069-444e-9869-ab5332812750-image.png)

## 전역 환경변수 선언

postman 전역적으로 활용할 환경변수를 설정해줄 수 있다.

좌측 탬의 Environments 탭에서 환경변수를 설정할 수 있다.
좌측 상단의 + 버튼을 눌러 새로운 환경변수를 생성한다.

![](/images/45f6a4dd-ef20-4809-b5c6-a5bc4fbf2e35-image.png)

환경변수를 설정하는 탭에서 윗 부분은 환경변수의 이름, 아래 Variable은 변수명을 의미한다.
login-token이라는 Variable을 선언해주자.

> 설정을 변경한다면 저장을 꼭 눌러주자. 상단 탭의 주황색 점이 있다는 것은 변경사항이 존재하고 저장이 안됐다는 것을 의미한다.

![](/images/5a0f7db2-3318-44e0-80e0-77c4cddf800f-image.png)

## 전역 환경변수 설정

위에서 설정을 완료했다면 우측 상단에 환경변수를 선택할 수 있는 탭에 방금 선언한 값이 있는것을 확인할 수 있다. 이를 선택한다.

![](/images/ec1c88e1-7706-4d82-8264-b246c5406b84-image.png)

다시 Collections 탭으로 와서 만들었던 Collection을 선택한다.
Collection의 Authorization 탭을 눌러 인증 방식을 설정한다.
Type은 사용하는 인증방식을 선택한다.
Token은 인증 토큰을 입력하는 공간이다.

Token 값에 `{{login-token}}` 이라고 입력하여 전역변수를 활용함을 명시적으로 선언해줄 수 있다.

> 필자는 Bearer + JWT 인증방식을 사용하고있다.

![](/images/523ad708-c11b-4e32-8404-38f3e041d93a-image.png)

> 저장하는거 잊지말자

### 로그인 토큰 담기

필자는 로그인을 수행하면 다음과 같이 응답을 받는다.
여기서 `token`이라는 값이 인증에 사용되는 값이다.

로그인을 수행하면 token 값을 전역변수에 저장할 것이다.

![](/images/a99381e6-a7ff-478f-b9aa-cddad5db7385-image.png)

`Tests` 탭에서 반환되는 값에 대한 조작을 할 수 있다.
아래와 같이 스크립트를 작성하여 전역변수 `login-token`에 토큰값을 담는다.

![](/images/079ebf63-bafe-410f-b7ae-8b1cdddc9a0a-image.png)

```javascript
var data = JSON.parse(responseBody);
pm.environment.set("login-token", data.token);
```

여기까지 설정을 완료했다면 로그인 수행 시 다음과 같은 과정으로 인증 토큰이 전역적으로 저장된다.

로그인 수행 -> Environment의 `login-token` 값에 토큰값 저장 (전역)


## 전역 환경변수 사용

이제 인증이 필요한 Request 요청을 생성하고 여기에 인증값을 넣어주자.

인증값이 없을때는 요청이 정상적으로 수행되지 않음을 확인할 수 있다.

![](/images/a29adaf5-8451-46d4-bd5e-d88c27c37197-image.png)

Authorization 탭에서 Authorization Type을 `Inherit auth from parent`로 설정해준다.

이제 하위 Request는 상위(Collection)에서 사용하는 `{{login-token}}` 인증방식을 공유받을 수 있다.

![](/images/74e36a6f-33b1-464d-83bd-5b937c2abf03-image.png)

로그인을 수행한다.

위에서 이야기했듯이 이 과정을 통해 전역 로그인 토큰이 설정되었다.

![](/images/40f2504b-72cc-4359-adeb-621db2f2dbc5-image.png)

이제 인증이 적용된 요청이 정상적으로 수행되는 모습을 확인할 수 있다.

![](/images/b116114a-8ee6-47e3-862e-9055ae0626ba-image.png)

# 정리

이를 통해 토큰 복사 - 붙여넣기라는 귀찮은 과정을 클릭 한번으로 줄일 수 있었다.
단순하지만 나름 편리한 기능이라고 생각해서 정리해둔다.
