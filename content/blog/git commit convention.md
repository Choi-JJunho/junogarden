---
title: git commit convention
description: git commit message convention에 집중해보자
date: 2022-10-27T05:09:38.526Z
tags:
  - Git
---
# 서론

commit message 스타일을 정해두면 git을 이용한 협업을 수행할 때 상호간의 코드리뷰 및 이전 커밋로그 확인에 용이하다.

git commit message convention에 대해 알아보자.

# Convention 알아보기

``` texts
type: Subject (제목)
# 한줄 띄우기
body (본문)
# 한줄 띄우기
footer (꼬리말)
```

## Subject(제목)

어떤 것을 했는지 명확한 단어가 들어가야 하고, 너무 길게 작성하지 않는다.

- 50자 이하, 대문자로 시작하여 작성하고, 마침표로 끝내지 않는다.
- 명령문(동사원형)으로 작성한다.
> Git이 사용하는 메시지 형식에 맞춰 일관성을 주기 위해 위와 같은 규칙을 정해놓는다.
예를들어 GitHub에서 README.md 파일을 만든다고 했을 때 `Create README.md` 와 같이 명명하는 것을 확인할 수 있다.
![](/images/7de38b61-d5e9-4f4f-b199-2ca3c10a22d5-image.png)

### Type

type은 다음을 참고하면 좋다.

| Tag Name         | Description                                                                                   |
|------------------|-----------------------------------------------------------------------------------------------|
| Feat             | 새로운 기능을 추가                                                                            |
| Fix              | 버그 수정                                                                                     |
| Design           | CSS 등 사용자 UI 디자인 변경                                                                  |
| Style            | 코드 포맷 변경, 세미 콜론 누락, 코드 수정이 없는 경우                                         |
| Refactor         | 프로덕션 코드 리팩토링                                                                        |
| Comment          | 필요한 주석 추가 및 변경                                                                      |
| Docs             | 문서 수정                                                                                     |
| Test             | 테스트 코드, 리펙토링 테스트 코드 추가, Production Code(실제로 사용하는 코드) 변경 없음       |
| Chore            | 빌드 업무 수정, 패키지 매니저 수정, 패키지 관리자 구성 등 업데이트, Production Code 변경 없음 |
| Rename           | 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우                                            |
| Remove           | 파일을 삭제하는 작업만 수행한 경우                                                            |



## Body(본문)

해당 내용은 선택사항이다.
보다 자세한 커밋 메세지를 작성하고자 할 때, 제목에 이어서 부가적인 설명을 붙인다.
이 커밋을 한 이유와 변경 내용 등을 작성한다.

## Footer(꼬리말)

해당 내용도 마찬가지로 선택사항이다.
주로 이슈 번호를 참조시킬 때 사용한다.

# commit Template

위 내용에 익숙해지기 어려울수도, 조직별로 명명규약이 달라 헷갈릴 수도 있다.
그럴 때 마다 규칙을 확인하는 것도 좋겠지만 commit message 템플릿을 별도로 지정해서 commit 시 가이드를 띄워주는 방법도 존재한다.

``` text
# type: Subject 형식으로 작성하며 제목은 최대 50글자 정도로만 입력
# 제목을 아랫줄에 작성, 제목 끝에 마침표 금지, 무엇을 했는지 명확하게 작성

# 본문(추가 설명) 작성

# 꼬릿말(footer) 작성

################
# Feat : 새로운 기능 추가
# Fix : 버그 수정
# Docs : 문서 수정
# Test : 테스트 코드 추가
# Refactor : 코드 리팩토링
# Style : 코드 의미에 영향을 주지 않는 변경사항
# Chore : 빌드 부분 혹은 패키지 매니저 수정사항
################
```

## Git Bash를 이용해 적용하기

![](/images/46a686dd-f15d-442f-9e27-b900f4111d60-image.png)

![](/images/7bcecf53-f76c-44b2-adef-7976650b9499-image.png)

아래 명령어를 수행한다.
`
git config --global commit.template /c/project/moyeo_web/.gitcommit_message_template.txt
`
> 모든 프로젝트에 적용하기 위해 --global옵션을 붙였다.


![](/images/d36c9243-2c76-4871-814e-b1369e7189ce-image.png)

이후 `git commit`을 수행할 때 다음과 같이 주석으로 안내 문구가 뜬다.
해당 주석에 맞게 내용을 작성한 뒤 :wq로 내용을 저장(커밋) 하면
![](/images/1744afa2-0d1d-4c41-876c-a15db8511d1f-image.png)

아래와 같이 제목, 본문, 꼬리말이 적용된것을 볼 수 있다.
![](/images/80bf79d7-2fd9-4070-89a6-7f1ebbf39745-image.png)


> git fork를 사용할 경우
![](/images/f7f7ceb2-e0ed-4526-b663-725bf8878b80-image.png)
vim 환경이 아니기 때문에 위처럼 #이 주석처리되지않고 텍스트로 출력된다.


# Reference

https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines

https://www.conventionalcommits.org/ko/v1.0.0/

https://string.tistory.com/112

https://chanhuiseok.github.io/posts/git-4/
