---
title: jenkins로 빌드 - 배포하기
description: jenkins를 이용하여 빌드-배포하는 방법을 알아보자.
date: 2020-11-12T08:20:56.808Z
tags:
  - AWS
  - Jenkins
---
# 서론

> 💡 이 게시글은 2023.07.13에 일부 수정되었습니다.
버전이 업데이트되면서 자바 버전에 대한 호환성 및 설치 명령어가 변경되는 경우가 있기 때문에 정확한 내용은 [공식문서](https://www.jenkins.io/doc/book/installing/linux/)를 참고하는것을 권장합니다.


jenkins를 이용하여 자동 배포하는 방법을 알아보자.

> 만약 EC2 생성부터 알고싶다면 [이전 글](https://velog.io/@junho5336/AWS-%EA%B1%B8%EC%9D%8C%EB%A7%88-%EA%B8%B0%EB%A1%9D-EC2-%EC%83%9D%EC%84%B1%ED%8E%B8)을 참고해보길 바란다.



이 실습을 진행하기 위해 필요한 설정은 다음과 같다.

실습환경
- AWS EC2 (Ubuntu 18.04) 

> ❗ 주의 ❗
이 실습 환경은 다음을 고려해야합니다.
👀 Tomcat을 이용하여 Spring MVC Project를 배포할 것입니다.
👀 Maven을 이용하여 Build 할것이기 때문에 프로젝트의 구성이 Maven의 기본 빌드 환경에 맞게 갖추어져있어야 합니다.
👀 배포할 프로젝트가 github에 올라가있어야합니다.
👀 기본적으로 EC2 인스턴스를 2개올리고 서비스를 운영한다면 프리티어라도 금액이 청구되게 됩니다. (한달에 750hr 무료 -> 2개를 올릴 시 한달에 750 * 2 hr만큼 운영됨)

# EC2기본 환경 설정
Build Server로 사용할 EC2를 생성해준다.
보안그룹은 아래를 참고 
> 기존 jenkins의 기본 포트는 8080이지만 포트 변경 방법을 같이 알려주고자 8081로 바꿀것이다.
![](/images/4849a6a8-774f-46d5-930e-97653f2fdc8f-image.png)

SSH로 BuildServer로 접속해준다.

기본적인 update와 jdk 설치를 진행한다.

```shell
sudo apt update

sudo apt install openjdk-17-jre
```

jdk 설정이 진행되었으면 jenkins의 key를 받아주고 이를 적용시킨다.

```shell
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins
```

jenkins를 설치하고나서 실행중임을 확인한다.

```shell
systemctl status jenkins
```

![](/images/9e670160-70a6-41cc-8f5e-559f58d45ef3-image.png)

jenkins의 포트를 변경해주기 위해 `/lib/systemd/system/jenkins.service` 파일을 열어준다.

```shell
sudo vi /lib/systemd/system/jenkins.service
```

해당 파일을 열어보면 `Environment="JENKINS_PORT=8081"`이라는 부분이 보일 것이다.
해당 포트번호를 8081로 바꿔주고 저장한다.

![](/images/9e172909-b688-43fc-a084-fc20c2806a24-image.png)

저장후 demon을 reload한 뒤 jenkins를 재시작한다.

```shell
sudo systemctl daemon-reload
sudo systemctl restart jenkins
```

# jenkins 설치

EC2IP:8081로 jenkins로 접속한다.

![](/images/7fbf883b-881d-4f79-885a-534b443efc18-image.png)

`/var/lib/jenkins/secrets/iniialAdminPassword`를 통해 암호를 가져와야한다.
```
sudo cat /var/lib/jenkins/secrets/iniialAdminPassword
```
![](/images/babc0192-dfbe-402c-bc38-2e5f814c929f-image.png)

암호를 입력하면 아래 창이 뜨는데 `Install suggested plugins`로 기본적인 플러그인들을 받는다.
![](/images/f8f47564-fcd9-455f-a1c0-998bb222ef4b-image.png)

설치가 완료되면 어드민 계정을 설정할 수 있다.
![](/images/2d63ea7b-7321-443e-96c0-eeeaeacb03d6-image.png)

jenkins URL을 변경하는 탭이다.
추후에 변경 가능하니 그냥 넘어가도록 한다.
![](/images/1a0b2c04-0619-4555-8028-b332aa3e2a3e-image.png)

jenkins의 첫 화면
![](/images/03d373b5-195a-4b77-b1b6-6274fcae3d46-image.png)

## jenkins 플러그인

좌측의 jenkins 관리 - 플러그인 관리로 들어와준다. 
![](/images/2aa47dbb-edaa-4345-817c-613448d1aa24-image.png)

Deploy to container를 체크한다.
> 빌드 성공 후 container에 war파일을 배치시켜주는 플러그인

![](/images/e5a9d9b0-dfaa-4102-9c05-c286962b0700-image.png)

Publish Over SSH를 체크한다.
> SSH를 통해 빌드 산출물을 전송하기 위해 사용하는 플러그인

![](/images/0911ee1d-caa4-4c73-95a2-e668adb0c350-image.png)

체크를 완료했다면 `지금 다운로드하고 재시작 후 설치하기`
![](/images/f613f996-ca26-44c5-a2d2-15f3c27e17db-image.png)


## jenkins key 생성

다시 EC2 환경으로 돌아온다.

젠킨스 유저로 변경 후 홈디렉터리로 이동

```shell
sudo su jenkins
cd
```

키 생성
```shell
ssh-keygen -t rsa
```

# 배포 서버 EC2 설정

배포서버로 사용할 인스턴스를 새로 생성해준다.

> Application Server의 보안그룹
![](/images/2aaeb028-3efb-4e29-b4cf-42aa630227f0-image.png)

해당 인스턴스도 마찬가지로 update, upgrade 이후 jdk 설치까지 진행한다.
```shell
sudo apt update

sudo apt upgrade

sudo apt install openjdk-8-jdk
```

tomcat을 이용해 배포를 진행할 것이므로 [여기](https://archive.apache.org/dist/tomcat/tomcat-8/)에서 원하는 톰캣 버전을 선택해서 사용하면된다.
실습에서는 8.5.59버전을 사용할것이다.

``` shell
wget https://archive.apache.org/dist/tomcat/tomcat-8/v8.5.59/bin/apache-tomcat-8.5.59.tar.gz
```

받은 파일의 압축을 풀어준다.
```shell
tar xvf apache-tomcat-8.5.59.tar.gz
```

tomcat을 따로 저장할 경로를 생성해준다.
```shell
sudo mkdir -p /opt/tomcat

sudo mv apache-tomcat-8.5.59 /opt/tomcat

sudo ln -s /opt/tomcat/apache-tomcat-8.5.59/ /opt/tomcat/route
```

tomcat을 구동할 tomcat User를 생성해준다.
이때 암호를 사용하는것을 권장한다.
```shell
sudo adduser tomcat
```

tomcat 디렉터리의 사용자와 그룹을 tomcat으로 바꿔주고, shell파일들에 실행권한을 부여한다.
```shell
sudo chown -R tomcat:tomcat /opt/tomcat

sudo sh -c 'chmod +x /opt/tomcat/route/bin/*.sh'
```

tomcat을 실행시켜준다.
```shell
sudo su

cd /opt/tomcat/route/bin

./startup.sh
```
undefined


tomcat 유저의 ssh key를 생성한다.
```
sudo su tomcat

cd

ssh-keygen -t rsa
```
![](/images/1a7057e3-493f-4906-b5ac-efc1b09f0023-image.png)

tomcat 유저의 ssh 디렉토리에 authorized_keys 파일을 생성해준다.
```shell
touch authorized_keys
```


## SSH key 교환

jenkins가 설치되어있는 BuildServer로 돌아온다.

jenkins 유저로 접속하여 public ssh key를 확인한다.
```shell
sudo su jenkins

cd 

cat .ssh/id_rsa.pub
```
![](/images/643bd286-5cdb-4424-9a28-5e1ebbfaad96-image.png)

위 public 키를 복사해서 Application Server의 tomcat 유저의 .ssh 디렉터리에 새로 생성한 authorize_keys 파일에 넣어준다.
```
vi .ssh/authorized_keys
```
![](/images/5e6d72c8-bdbc-423d-a3b7-7929fd131cbd-image.png)

# jenkins 시스템설정

다시 jenkins로 돌아와서 시스템 설정을 해준다.
![](/images/5925adee-e2c2-430d-a75d-c9cc3689fd9a-image.png)

가장 아래로 내려보면 Publish over SSH 설정이 있을것이다.
Path to key 부분에는 jenkins의 private ssh key 경로를 적어준다.
그리고 그 아래 SSH Servers 탭에서는 Application Server의 주소와 유저네임 그리고 Remote Directory 경로를 적어준다.

이때 Remote Directory는 tomcat의 기본 경로를 뜻하고 `/opt/tomcat/route`를 적어주면 된다.
![](/images/0d292d9c-f322-4abe-8132-3e0a32149d4b-image.png)

오른쪽 아래에있는 Test Configuration을 눌러서 SSH 접속이 정상적으로 이뤄지는지 확인해본다. 정상적으로 이뤄진다면 Success가 뜰 것이다.
![](/images/c02d5b0c-bb24-40fa-ae0e-49a76578b876-image.png)

# jenkins Global Tool 설정

Global Tool Configuartion에 들어가준다.
![](/images/cae4a977-cf81-43bb-804e-f24c12a1a029-image.png)

JDK 경로를 설정해준다.
과정을 그대로 따라왔다면 java의 기본 경로는 `/usr/lib/jvm/java-8-openjdk-amd64` 일 것이다.
![](/images/e72e379d-a5b2-43de-b1ba-93722984c62e-image.png)

maven을 통해 Build를 진행할 것이므로 maven을 추가해주고 install automatically 설정을 켜고 저장하고 넘어간다.
![](/images/f39fe414-e780-4de5-bb37-56ef73c482f2-image.png)

# jenkins 프로젝트 생성

새 프로젝트를 생성해준다.
![](/images/9a48074d-9b8a-40f3-9030-cd12ad200aba-image.png)

Freestyle project로 생성해준다.
![](/images/86a74d9d-7096-4763-9323-9b677e32f1fa-image.png)

GitHub project를 눌러주고 자신이 배포할 프로젝트 주소를 적어준다.
undefined

소스코드 관리에서 Git을 선택하고 마찬가지로 프로젝트 주소를 적어준다.
이후 Credentials를 추가해야한다.
undefined

자신의 GitHub 계정에 대한 설정을 적어준다.
> Username : GitHub Username을 적어준다.
undefined
Password : GitHub Password를 적어준다.
ID : 별칭을 적어준다.

undefined

추가한 계정을 사용하고 다음으로 넘어간다.
undefined

빌드환경에서 Send files or execute commands over SSH after the build runs 옵션을 체크해준다.
다음 설정은 Maven의 기본 빌드경로를 따른다.
>Source files : target/ROOT.war
Remove prefix : target
Remote directory : webapp

undefined

Build탭에서 Add build step - `Invoke top-level Maven targets` 를 추가해준다.
Goals에는 `clean package war:war`를 넣어준다.
undefined

---

드디어 설정이 끝났다.. 오른쪽 버튼을 누르면 빌드, 배포가 이뤄진다.
undefined

배포 후에 Application Server IP:8080으로 접속해보자!
undefined

# 결론
사실 본격적인 프로젝트 배포라면 더 상세한 설정들이 필요하다.
> properties파일을 build파일에 따로 둔 다음 build할 때 해당 설정파일을 끼워 넣어서 빌드하는 설정이라던가...
cron으로 스케줄링을 해서 특정 시간마다 빌드-배포하게 한다던가...

그 부분에 대해서는 여러분의 몫으로 남겨두고자한다.
기본 설정에 대한 시간은 아껴드렸으니 나머지 부분은 화이팅..!

> 추후 다시 설정할 때 내가 필요한 내용이기도 해서 따로 시간내서 정리해본것도 있지만.. 이 글을 따라오면서 누군가에게 도움이 되었으면도 한다. 

# Reference

https://www.jenkins.io/doc/book/installing/linux/
