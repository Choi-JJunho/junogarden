---
title: No newline at end of file
description: GitHub에서 No newline at end of file 경고문구를 날리는 이유에 대해 알아보자
date: 2023-03-11T12:48:35.195Z
tags:
  - 코드 컨벤션
---
# 서론

![](/images/067ed4a9-b8cf-48e3-aa12-5bce204588ff-image.png)

GitHub에서 PR을 제출하면서 마지막줄의 개행이 없다는 경고문을 띄워주는 것을 확인할 수 있었다.

파일의 마지막 newline은 왜 필요할까?

# POSIX 표준

> [위키백과]
POSIX는 이식 가능 운영 체제 인터페이스(Portable Operating System Interface)의 약자로 서로 다른 UNIX OS의 공통 API를 정리하여 이식성이 높은 유닉스 응용 프로그램을 개발하기 위한 목적으로 IEEE가 책정한 애플리케이션 인터페이스 규격이다.
> > POSIX의 마지막 글자 X는 유닉스 호환 운영체제에 보통 X가 붙는 것에서 유래한다.

![](/images/a3cd3d6c-9fdd-432b-82c3-b6acf9baadf6-image.png)

POSIX에서 지정한 규격에서 파일의 가장 마지막 줄에는 개행이 있어야한다는 규약이 있다.

## 왜?

예를들면 Linux Terminal에서 마지막 개행이 없는 파일을 연속적으로 cat 명령어로 연속적으로 조회한다고 가정해보자 

> `test.txt`
hello

``` shell
$ cat test.txt test.txt
hellohello
```
위와 같이 여러 파일을 한번에 조회하고자 할 때 마지막 라인 줄바꿈이 없다면 어느파일인지 구분하기가 어려워 질 것이고, 이는 원래 요구하고자 하는 동작방식으로부터 많이 벗어나는 방향으로 이어질 수 있다.

위와같은 이유도 있겠지만 일단 규칙이고 약속으로 지정해둔 내용이기에 GitHub에서도 POSIX 규약을 어기지 않도록 `No newline at end of file` 경고문구를 날려주는 것 같다.

# IntelliJ 설정

만약 IntelliJ를 사용한다면 마지막 개행을 추가해주는 옵션을 설정해줄 수 있다.

![](/images/a952de3a-ac23-4aaa-a066-7aaab7c474ca-image.png)

Preference > Editor > General > On Save >`Ensure every saved file ends with a line break`
위 옵션을 체크해주면 파일 저장 시 파일의 마지막 줄에 개행을 자동으로 추가해준다.

# 결론

- GitHub에서는 POSIX 표준을 지키기 위해 No newline at end of file 경고문구를 띄운다.
- IntelliJ에서는 사용자의 실수로 이러한 문제가 일어나는 것을 방지하기 위해 저장 시 파일 마지막에 개행을 추가해주는 옵션이 있다.

![](/images/637cdac9-7c88-4d44-92b1-2b98b6f024fe-image.jpeg)

과연 미미 노트북도 POSIX 규약을 따를까?

# Reference

https://ko.wikipedia.org/wiki/POSIX

https://yeonyeon.tistory.com/241

https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline

https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_206

