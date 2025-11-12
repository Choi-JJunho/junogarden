---
title: WebRTC
description: >-
  최근 토이프로젝트를 하나 하고싶은 마음이 들었다. 게시판, 채팅 등등 기존에 사용해보고싶었던 기술들을 생각하면서 친구와 대화하던 도중
  화상회의프로그램을 하나 만들어보는건 어떨까라는 생각이 들었다.
date: 2022-10-03T07:50:16.991Z
tags:
  - WebRTC
---
# 서론
최근 토이프로젝트를 하나 하고싶은 마음이 들었다.
게시판, 채팅 등등 기존에 사용해보고싶었던 기술들을 생각하면서 친구와 대화하던 도중 화상회의프로그램을 하나 만들어보는건 어떨까라는 생각이 들었다.

친구에게 webRTC라는 기술을 듣게되었고 화상회의 프로그램 구현을 위해 해당하는 지식을 우선 정리하고 시작하려고한다.

# WebRTC?
WebRTC는 서버를 최대한 거치지 않고 P2P로 브라우저 혹은 단말간(동등 계층간) 데이터를 주고받는 기술의 웹 표준이다.

> P2P
peer to peer network : 네트워크상에서 서버를 거치지않고 클라이언트간 직접 통신하는 방식

Web RTC를 이용하여 1:1, 1:N, N:N 방식의 서비스를 구현할 수 있다.

WebRTC는 각각의 기기가 서버의 도움 없이 연결되기 위해 연결을 도와주는 Signaling 서버가 필요하고
P2P 연결이 불가능한 상황을 대비한 TURN 서버가 필요하다.

## 용어정리

위 설명간 Signaling, TURN 서버 등 생소한 용어가 많아 정리하고 진행하고자 한다.

### Signaling

P2P 통신이 일어나기 전 세션 제어 메세지, 네트워크 구성, 미디어 기능 등의 정보를 교환하는데 사용한다.

쉽게말해 클라이언트간 실시간 미디어를 주고받기 위해 사전작업을 하는 것이다.

### ICE(Interactive Connectivity Establishment)

두 단말이 서로 통실할 수 있는 최적의 경로를 찾을 수 있도록 도와주는 프레임워크.

모든 단말은 방화벽, 내부망 등 각자의 네트워크 환경이 다양하기 때문에 각각의 Peer에 단순하게 연결할 수 없다.

ICE프로세스를 사용하면 NAT가 통신을 위해 필요한 포트를 열고 두 엔드 포인트가 연결할 수 있는 IP, port에 대한 정보를 갖게된다.

ICE는 STUN과 TURN 서버를 하나 혹은 둘다 사용해야한다.

### STUN(Session Traversal Utilities for NAT)

STUN 서버는 해당 Peer의 공인 IP 주소를 보내는 역할을 한다.
두 엔드포인드간의 연결을 확인하고 NAT 바인딩을 유지하기 위한 연결 유지 프로토콜로 사용할 수도 있다. 
<center><img src = "https://velog.velcdn.com/images/junho5336/post/abb274d4-be24-4ecd-b6b7-59a9cc842874/image.png" width="50%"></center>

> 두 단말이 같은 NAT 환경에 있지 않을 경우 또는 NAT 보안정책이 엄격하다는 등의 이유에 따라 STUN이 완벽한 해결책이 되지는 않는다.

### TURN(Traversal Using Relays arround NAT)

STUN의 확장으로 NAT환경에서 릴레이하여 통신하게된다.

TURN 서버는 인터넷 망에 위치하고 각 Peer들이 사설망 안에서 통신한다.

Turn 서버는 가능하면 마지막 수단으로 사용되는것을 권고하고있다.

<center><img src = "https://velog.velcdn.com/images/junho5336/post/e33eeffb-0b1d-414e-9ece-fcd11fcd34a7/image.png" width="50%"></center>

### SDP(Session Description Protocol)
해상도나 형식, 코덱, 암호화등의 멀티미디어 콘텐츠의 연결을 설명하기 위한 표준이다.

# WebRTC Architecture

위에서 기술한 시그널링을 통해 NAT를 우회하는 과정을 거치기 때문에 Web RTC가 실시간으로 웹에서 데이터를 교환할 수 있다.

## P2P 절차
1. 각 브라우저가 P2P 커뮤니케이션에 동의
2. 서로의 주소를 공유
3. 보안사항 및 방화벽 우회
4. 멀티미디어 데이터 실시간 교환.

라우터를 통과하여 연결할 방법을 찾는 과정을 NAT Traversal이라고한다.

STUN 서버에 의해 위 NAT Traversal 작업이 수행된다.
WebRTC 연결을 시작하기 전에 STUN 서버를 향해 요청을 보내면 서버는 NAT 뒤의 Peer들이 연결할 수 있도록 공인 IP와 포트를 찾아준다.

하지만 라우터별로 방화벽 정책이 다르거나 이전에 연결된 이력이 있는 네트워크만 접속할 수 있도록 제한을 걸기도 한다.

이때 STUN 서버를 통해 자신의 주소를 찾지 못할경우 TURN 서버를 대안으로 이용한다.

TURN 방식은 네트워크 미디어를 중개하는 서버다.
이 방식은 서버를 거치기 때문에 엄연히 P2P 통신이아니게 되며 구조상 지연이 발생하게 된다.
때문에 Peer가 보안이 엄격한 NAT 내부에 위치한 경우가 아니라면 최후의 수단으로 사용되어야한다.

## ICE

위 과정을 통해 STUN, TURN 서버를 이용해 획득한 IP 주소와 프로토콜, 포트의 조합으로 구성된 연결 가능한 네트워크 주소들을 후보(Candidate) 라고 부르며 이 과정을 후보 찾기(Finding Candidate)라고 부른다.

이를 통해

- 자신의 사설 IP와 포트번호
- 자신의 공인 IP와 포트번호
- TURN 서버의 IP와 포트번호

일반적으로 위 3개의 주소를 얻게된다.

이 모든 과정은 IE 프레임워크 위에서 이루어진다.

## SDP

SDP는 WebRTC에서 미디어와 관련된 초기 세팅정보를 기술한다.
![](/images/0853ac77-50c4-41e6-8d6f-b9b4d772f668-image.png)

발행 구독 모델(Pub/Sub)과 유사한 제안 응답 모델(Offer/Answer)을 갖고있다.

![](/images/0906d677-af60-412f-bcae-e640ec14103d-image.png)

Peer가 미디어스트림을 교환할것이라 제안하면 상대방으로부터 응답이 오기를 기다린다.
응답을 받으면 각자의 Peer가 수집한 ICE 후보중 최적의 경로를 결정하고 협상하는 프로세스가 발생한다.

이 과정을 통해 P2P연결이 설정되고 활성화된다.

## Signaling

해당부분은 WebRTC에서 지원하는 기능이 아니기 때문에 WebRTC 연결 전 사전에 준비해야하는 과정이다.
웹 소켓 방식 등을 이용하여 구현할 수도 있으며, 시그널링 정보를 조회할 수 있는 API를 만들고 브라우저에서 주기적으로 XHR을 요청하는 Polling 기법을 쓸 수도 있다.

아니면 아마존의 Kinesis Video Stream, 구글의 AppRTC와 같이 시그널링 서버를 제공해주는 솔루션을 사용하는 방법도 있다.

> 폴링 : 하나의 장치(또는 프로그램)가 충돌 회피 또는 동기화 처리 등을 목적으로 다른 장치(또는 프로그램)의 상태를 주기적으로 검사하여 일정한 조건을 만족할 때 송수신 등의 자료처리를 하는 방식을 말한다.

# 단점

WebRTC의 단점으로는 아래와 같은 것들이 있다.

1. 브라우저 간 호환성.
사파리, IE, 엣지와 같은 브라우저의 호환성을 장담하기 어렵다.

2. 시그널링 서버에 대한 명시적인 표준이 없음.
(나처럼) WebRTC를 처음 접하는 사람에 대해 입문간 혼란이 온다.

3. UDP 위에서 동작
WebRTC는 실시간성이 매우 중요한 기술이라 UDP 위에서 동작한다.
데이터를 빠르게 전송할수는 있으나 이 과정에서 데이터 손실이 발생할 수도 있다.

# 결론

브라우저간 통신이 기반이 되는 기술로 프론트 개발자들이 관심을 가지고 볼 만한 기술인 것 같다.
최근 시작한 Vue 공부와 겸하면서 동시에 시그널링 서버로 Socket을 이용해볼 수 있는 좋은 기회인 것 같다.

나중일이 되겠지만 WebRTC를 구현한 뒤에는 Socket을 이용한 김에 채팅(Kafka를 곁들인)까지 구현하는 것이 목표가 될 것 같다.


# Reference

https://tech.kakaoenterprise.com/121
https://gh402.tistory.com/38
https://developer.mozilla.org/ko/docs/Web/API/WebRTC_API/Signaling_and_video_calling
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols
https://eytanmanor.medium.com/an-architectural-overview-for-web-rtc-a-protocol-for-implementing-video-conferencing-e2a914628d0e
https://wormwlrm.github.io/2021/01/24/Introducing-WebRTC.html
