# HAPPYTOGEDOG : SNS기반 반려동물 종합 관리 플랫폼
*소개, 서비스 화면, 수상내역등은 https://github.com/affinity96/2020_CapstonDesign-APP 에 기재되어 있습니다*

## 전체 시스템 구조도
![그림1](https://user-images.githubusercontent.com/53653160/111263609-7eaeb900-8669-11eb-9aac-6ee92d1b52c0.png)

### 시스템 구조도 내 각 구성 요소별 역할

- 사용자:	사용자는 반려동물의 사회성 기르는 활동과 일상을 관리하는데 어려움을 느끼는 맞벌이 부부이다.
- 관리자: 관리자는 앱 내에서 사용자, 그룹, 게시물 등을 관리하며, Google Admob을 통해 노출할 광고를 결정하고 수익을 관리한다.
- Android Application: 사용자들이 반려동물의 일정 관리, 일상 기록, 다른 사용자와의 소통을 할 수 있는 서비스를 제공한다.
- KaKao Map API: 반려동물의 산책 중 주변 정보 확인, 주변 반려동물 확인 등의 기능을 제공한다.
- Google Admob: 수익 창출을 위해 Google Admob에서 광고를 받아 와 앱 내부에 노출한다.
- Main Server: Naver Cloud를 이용한 Node.Js 기반의 API 서버로 Client로부터 요청을 받아 DB에 접근하여 데이터를 주고받는다.
- Database: MySQL 데이터베이스를 사용하여 서비스 유지를 위해 필요한 정보를 저장한다.
- Firebase:	회원가입, 로그인 시 개인정보 보호와 채팅, 실시간 위치 공유, 푸시 알림 등의 기능을 제공한다

## 컴포넌트별 상세구조
![그림2](https://user-images.githubusercontent.com/53653160/111263606-7ce4f580-8669-11eb-8947-8f23c5e1ef4d.png)

### Front End
 최초 사용 시 회원 가입, 그룹 추가, 반려동물 추가, 게시글 작성 및 조회 등 사용자가 수행한 작업을 데이터 베이스에 반영하기 위하여 RESTful API를 사용해 서버와 수시로 통신한다. 사용자의 주소 검색을 위해서는 Daum 주소 API가 사용되며, Selenium을 사용하여 반려동물의 등록번호로 반려동물 정보를 크롤링한다. 또한, 반려동물의 일과 관리 중 산책 서비스를 이용하기 위해서 본 시스템에서는 KaKao Map API를 사용한다.

### Back End
 Back End 에서는 Naver Cloud Platform 상에서 Express Framework를 사용하여 Node.js 서버를 구성한다. 서버는 Front-End에서 API 요청이 오는 경우 구축된 MySQL 데이터 베이스에 접근하여 요청 데이터를 받아온다. 또한, Push 알림 기능을 위해 특정 트리거가 발동하면 Firebase에 데이터를 전송하여 사용자에게 Push 알림 요청을 보낸다.
 
### Firebase
 회원 가입 시 사용자 정보 저장, 채팅, Push알림, 실시간 위치 공유 기능 등을 위해 사용된다. Firebase Auth를 사용하여 사용자의 Email ID와 비밀번호를 저장하였으며, Firebase Realtime Database를 통해 채팅과 산책 시 실시간 위치 공유 기능을 수행한다. Push 알림의 경우 백엔드에서 요청을 보내면 Firebase Cloud Messaging을 통해 해당 사용자에게 알림을 전송한다. 또한, Google Admob을 사용하여 광고를 받아와 앱 내부 광고를 노출한다.
 
## 전체 DB 스키마 - MySQL
![그림3](https://user-images.githubusercontent.com/53653160/111263608-7e162280-8669-11eb-89cf-fef12e68007d.jpg)
