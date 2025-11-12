---
title: AWS S3로 이미지 배포하기
description: AWS S3를 이용하여 정적 이미지를 배포해보자
date: 2023-08-23T18:03:56.934Z
tags:
  - AWS
---
# 서론

![](/images/4e4e3b49-6af8-4643-a382-2fce08831c4f-image.png)

피움 팀에서 비로그인 시 로그인을 수행하라는 페이지와 함께 이미지를 띄우려고 한다.
이 때 코드를 배포하지 않고도 이미지를 변경할 수 있는 방법이 없을까 생각했다.

현재 이미지를 프론트엔드의 assets에 넣어서 배포를 하게 된다면 이미지가 변경하나에도 배포가 이뤄져야한다는 번거로움이 존재한다.

CDN을 이용하여 이미지를 배포하고 해당 파일을 관리할 수 있다면 재배포하는 번거로움은 줄어들 것이다.

다시말해 `https://이미지경로.이미지이름.png`라는 경로는 동일하나 해당 서버에 있는 자원을 변경하면 이미지가 변경될 수 있다.

이러한 효과를 내기 위해 AWS의 S3를 이용해볼 수 있다.

# AWS S3란?

아마존 웹 서비스에서 제공하고있는 객체 스토리지 서비스(Simple Storage Service)다.
쉽게 말해 클라우드 환경에 저장소를 제공하는 서비스를 의미한다.

![](/images/81f9076a-e54f-4b9e-9f42-78751f69741b-image.png)

# 시작하기

> [사례별로 알아본 안전한 S3 사용 가이드](https://techblog.woowahan.com/6217/)를 참고하여 작성된 글입니다.
개인 AWS 계정으로 실습을 진행하는점 참고 부탁드립니다~

지금부터 AWS S3를 이용해 정적 웹 호스팅을 수행해보자.

## 웹 호스팅 준비하기

![](/images/48959aa7-91ec-4a11-b005-8615bb4a7239-image.png)

버킷 생성부터 시작해보자.

### 버킷 생성

![](/images/00b5852a-cab4-498b-9f98-ef1529c47375-image.png)

우선 S3 서비스에 들어가서 버킷을 생성한다.


![](/images/27c6bf1d-5e46-48a4-aece-e8087ada7df1-image.png)

`ACL 비활성화됨`, `모든 퍼블릭 엑세스 차단` 옵션을 선택해준다.

![](/images/c52b26ca-a4d1-4f59-9bda-03ecbb95bd8e-image.png)

기본 암호화는 `Amazon S3 관리형 키(SSE-S3)를 사용한 서버 측 암호화`를 선택하고 버킷을 생성한다.

![](/images/a36b87bc-e319-4b7a-a613-7266d4eabd46-image.png)

위와같이 버킷이 생성된 모습을 확인할 수 있다.

![](/images/f4d013c7-1800-4e79-9461-93e7f5dbaf2d-image.png)

버킷 탭에 들어가서 이미지를 하나 업로드하자.

![](/images/9009dac2-acdd-4297-88a3-e5ee655ecd16-image.png)

favicon.png 파일을 업로드했다.

![](/images/54bd6ff7-5c76-42a8-bb73-06d0544cf3b6-image.png)

이 상태로 객체 URL에 접근해보면

![](/images/1d73dbad-391c-435a-9405-92a29b4109e2-image.png)

다음과 같이 Access Denied가 뜬다.
버킷을 생성할 때 Public으로 생성하지 않았기 때문이다.

## 비공개인 버킷에 접근하기

버킷을 Private으로 만들었기 때문에 사용자가 자원에 직접적으로 접근하지 못한다.

![](/images/89e980f9-9bbb-43ae-9786-da2c27639f0b-image.png)

사용자가 CloudFront를 우회하여 접근할 수 있도록 구성해보자.

### CloudFront 설정

![](/images/02099c08-bac3-491c-80e5-add7c6f74744-image.png)

CloudFront 배포 생성에서 원본 도메인을 위에서 생성한 S3로 선택한다.

![](/images/c342ce3b-085a-4dd8-be98-4c2de684203c-image.png)

이후 원본액세스 제어 설정을 선택하고 `제어 설정 생성` 탭을 선택한다.

![](/images/fd7a9515-c13a-4a31-b399-aa3c43fb8899-image.png)

위와같이 제어 설정을 구성한다.

![](/images/c54b4d99-a5a1-40d2-8fcc-b9975c258876-image.png)

기본 캐시 동작은 `Redirect HTTP to HTTPS` 를 선택하고 새 배포를 생성한다.
(WAF 설정은 적용하지 않았다)

### 버킷 정책 업데이트

![](/images/77d86fe9-839f-4193-a208-7eda3d647ed0-image.png)

CloudFront를 생성하면 위처럼 S3 버킷 정책을 업데이트하도록 나온다.
`정책 복사` 를 투르고 `정책을 업데이트하려면 S3 버킷 권한으로 이동합니다.` 를 누른다.

![](/images/c2a0780f-1cd9-40db-9593-bc72476562cf-image.png)

버킷 - 퀀합 탭에서 버킷 정책 편집으로 들어간다.

![](/images/8d8e608c-1026-47c6-b7fe-e599fc1bde9f-image.png)

복사한 내용을 버킷 정책에 붙여넣고 변경사항을 저장한다.

### 접속하기

![](/images/8079cb32-afdf-4c7a-95f4-861cd8f48bbf-image.png)

이제 CloudFront 탭에 다시 들어가서 배포 도메인 이름을 확인한다.

`배포도메인/{S3경로파일명}`로 호출했을 때 파일이 정상적으로 호출되는지 확인해본다.

![](/images/12422a54-f288-4dc2-b44d-4e0025892165-image.png)

### 대체 도메인 설정하기

> 해당 과정을 수행하기 위해서는 도메인을 구입이 선행되어야합니다.
도메인 구입은 [피움의 배포과정](https://velog.io/@junho5336/%ED%94%BC%EC%9B%80%EC%9D%98-%EB%B0%B0%ED%8F%AC%EA%B3%BC%EC%A0%95#%EB%8F%84%EB%A9%94%EC%9D%B8-%EC%A0%95%ED%95%98%EA%B8%B0)을 참고해주세요

매번 `배포도메인/{S3경로파일명}`으로 접속하기에는 도메인의 길이도 너무 길고 복잡하다.

`image.pium.life/{S3경로파일명}`로 접속하도록 구성해보자.

### 인증서 발급

우선 인증서를 발급받아야한다.

특정 웹서버에 인증서를 붙이는것이 아니므로 image.pium.life에 대해 SSL 인증서만 발급받아보자.

- **certbot으로 SSL 인증서 발급**

> certbot에 대한 내용은 [피움 팀블로그 - 내 서버에 HTTPS 설정하기](https://pium-official.github.io/apply-https/)를 참고

맥북에서 image.pium.life에 대한 SSL 인증서를 발급받아보자.
certbot을 받아준다.

```shell
# certbot 설치
brew install certbot

# dns challenge 방식의 인증을 수행한다
sudo certbot certonly --manual --preferred-challenges dns -d image.pium.life
```

![](/images/c5eceee5-178f-44da-a3dc-d5f76f1baa46-image.png)

서비스에 대한 동의를 진행한다.

![](/images/40c51981-0b5f-43dc-bfc8-08b07cb72c02-image.png)

여기서 해당 도메인의 소유자인지 검증하기위해 DNS 서비스에 위 값을 등록해야한다.
**(아직 엔터를 누르면 안된다!!!)**

![](/images/346baffc-fdaa-47bd-b2b7-06ee9f3e776b-image.png)

위처럼 DNS 관리 툴에서 TXT 레코드 정보를 추가해준다.
이후 해당 도메인이 정상적으로 배포되었는지 확인하기 위해 `Admin Toolbox: https://...`에 쓰여있는 링크로 접속한다.

> https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.image.pium.life.

![](/images/1ef250f2-02e2-427c-9e67-c969aa3d6ff9-image.png)

도메인이 아직 배포되지 않았다면 `Record not found!`가 뜬다.

![](/images/0d86efdf-ff7e-4572-8c70-524fc1840b34-image.png)

잠시 기다리면 이렇게 도메인 조회가 된다.

![](/images/36364776-27c8-488f-97ef-9bdcada9bbff-image.png)

배포 확인 후 다시 이 화면으로 넘어와서 엔터를 누르면 된다.

![](/images/62ac6dcf-1ac6-4c35-98b7-afcddab43f8f-image.png)

![](/images/11c0c9c3-899f-42e4-8548-4e4e177c1edb-image.png)

`/etc/letsencrypt/live/image.pium.life` 경로에 SSL 인증서가 발급되었다.

> 인증서 발급이 완료되었으므로 DNS 서비스에 등록했던 TXT 레코드는 삭제해도된다.

### AWS에 인증서 넣기

이제 이 인증서를 AWS로 가져가보자.

![](/images/4c70d2ae-e646-4546-8762-9638c6620af1-image.png)

AWS의 Certificate Manager 서비스를 이용한다.

![](/images/eaf11b35-7dd1-4a2b-a4b6-2799c11322a3-image.png)

> CloudFront의 SSL 인증서 적용 과정에서 미국 동부(버지니아 북부) 리전의 인증서를 요구하기 때문에 리전을 버지니아-북부로 설정해두고 작업을 진행해야한다!
>
> ![](/images/6a13e622-cdff-44f4-abdf-810c36aea380-image.png)
>
> ![](/images/a5180dd1-caf0-4a28-8f83-88791dee1209-image.png)


인증서 가져오기를 수행한다.

![](/images/f0dfe029-8979-43c7-af15-0726511c993e-image.png)

인증서 세부 정보를 입력하는 칸이 나오는데 각각 해당하는 정보를 적어주면 된다.

![](/images/feddde9f-4cfe-4913-a217-b743768345e1-image.png)

```
sudo cat cert.pem
sudo cat privkey.pem
sudo cat fullchain.pem
```

> ![](/images/9d27e460-cccc-45f2-81b4-15a69ef00d82-image.png)
> 
> `-----BEGIN CERTIFICATE-----`부터 
> `-----END CERTIFICATE-----`까지 
> 다 복사해서 넣어줘야한다.

![](/images/072733c1-f962-4c32-9c6e-bf5fe1750512-image.png)

등록을 누르면 다음과 같이 인증서를 가져올 수 있다.

![](/images/260c2b90-2e33-4c83-9e9b-e2e129e81997-image.png)

### CloudFront 별칭 설정

![](/images/63a14bb8-30b2-48bb-b1da-87e9aa21b5b9-image.png)

DNS 호스팅 사이트에 가서 CNAME 레코드를 추가해준다.
호스트는 image이고 값은 CloudFront의 배포 주소를 넣어준다.

![](/images/adff06f1-fcda-4a9e-9e15-faf3a24d5b72-image.png)

CloudFront 탭으로 와서 편집탭으로 들어간다.

![](/images/b6fa1b42-f99e-4cd8-9ecf-ad697956e406-image.png)

대체 도메인을 작성하고 추가한 SSL 인증서를 선택한 뒤 저장한다.

![](/images/8c1f134f-d67c-4ded-a087-32fabdf998d0-image.png)

이제 image.pium.life로 cloudfront로 접속할 수 있게 되었다.

# 후기

단순한 내용도 많았지만 중간에 인증서 발급 등과 같은 세세한 부분에서 헤맬 수 있다고 생각하여 최대한 자세하게 기록했다.

# Reference

https://medium.com/dream-youngs/lets-encrypt-dns-%EB%A1%9C-%EB%93%B1%EB%A1%9D%ED%95%98%EA%B8%B0-fdc3efda36af
