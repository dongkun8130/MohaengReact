# 🛫 Mohaeng React (Admin)

![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)

> 모행(Mohaeng) 관리자 페이지 — 여행 통합 플랫폼의 운영·관리 기능을 담당하는 React 프로젝트

이 저장소는 **React 기반 관리자 페이지 저장소**이며, Spring/JSP 기반 Backend와 별도로 관리됩니다.

```text
Backend Repository
→ Spring / JSP 기반 Backend 및 일반·기업회원 화면

React Repository (현재)
→ React 기반 관리자 페이지
```

- Backend Repository: [MohaengProject](https://github.com/dongkun8130/MohaengProject)

---

## 📖 Description

모행은 하나의 팀 프로젝트이며, Backend와 React Frontend를 별도의 GitHub Repository에서 관리했습니다. 이 저장소는 그중 관리자 전용 화면을 담당하며, JWT 인증으로 Backend `/api/**`와 통신합니다.

- **기간**: 2025.12.03 ~ 2026.02.03 (9주)
- **팀**: 총 7명의 모든 팀원이 Frontend와 Backend 개발에 함께 참여했으며 PL, AA, DA, BA, TA 역할을 나누어 협업했습니다. (PL 1 | AA 2 | DA 2 | BA 1 | TA 1)

---

## 🖥️ 주요 화면

<!-- 관리자 페이지 화면 이미지 추가 -->

---

## ⭐ Main Features

### 백엔드 연동 완료

- 관리자 로그인 (JWT + reCAPTCHA)
- 일반회원 관리, 포인트 관리, 회원 신고 관리
- 숙소/투어 상품 관리
- 여행 일정 관리
- 관리자 로그 조회 (카테고리·레벨·기간별 필터, 통계)
- 공지사항, FAQ 관리
- 환불/정산 관리
- 상품 문의, 리뷰 관리

### UI 구현 (백엔드 연동 예정)

- 대시보드, 회원/서비스 통계, 챗봇, 배너 관리, 결제 관리 등

---

## 🔧 Tech Stack

- React 19, React Router v7
- Axios (Backend API 통신)
- Chart.js / Recharts (통계 시각화)
- react-google-recaptcha
- SweetAlert2 (알림/확인창)
- XLSX (엑셀 내보내기)
- Vite

---

## 🔨 Architecture

React 관리자 페이지는 Axios를 통해 Backend `/api/**`와 통신하며, JWT 인증 방식을 사용합니다.

- 로그인 성공 시 발급받은 JWT를 localStorage에 저장
- Axios 인터셉터로 모든 요청 헤더에 `Authorization: Bearer` 토큰을 자동 첨부
- 응답에서 401/403 발생 시 토큰을 제거하고 로그인 페이지로 이동

(인증 흐름에 대한 자세한 내용은 [Backend README](https://github.com/dongkun8130/MohaengProject#-architecture)를 참고하세요.)

---

## 💻 Getting Started

### Requirements

- Node.js
- npm

### Installation

```bash
npm install
npm run dev
```

개발 서버는 `http://localhost:7272`에서 실행됩니다. (Backend의 `@CrossOrigin` 설정과 연동된 고정 포트입니다)

---

## 👨‍💻 Role & Contribution

**관리자 로그 조회 화면 구현 (`statistics/Logs.jsx`)**

- 카테고리·레벨·기간·검색어 조건을 조합한 다중 필터 로그 조회 화면 구현
- Backend `/admin/statistics/logs`(목록), `/admin/statistics/logs/stats`(통계) API와 연동

---

## 👨‍👩‍👧‍👦 Team

총 7명이 참여한 팀 프로젝트입니다. 모든 팀원이 Frontend와 Backend 개발에 함께 참여하면서 PL, AA, DA, BA, TA 역할을 나누어 협업했습니다.
