# 공간기획 프롬프트 워크숍

공간기획 워크시트 입력값을 바탕으로 AI 이미지 생성용 프롬프트, 누락 정보, 현실성 체크, 제출용 결과를 출력하는 워크숍용 웹앱입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 포함 기능

- 기관 정보 입력
- 시작 방식 선택: 기존 자료 입력 또는 직접 작성
- 기획서 PDF/브랜드 이미지 업로드 흐름
- 자료 메모 기반 요약 초안 생성
- Gemini API 기반 초안 생성
- 참가자명/팀명 입력
- 프로젝트 정보 입력
- 공간 정보 입력
- 예산 및 제작 조건 입력
- 공간기획 프롬프트 생성
- 누락 정보와 현실성 검토 포인트 출력
- 최종 이미지 생성용 프롬프트 출력
- 최종 이미지 요청문에 이미지 생성 명령 포함
- 이미지 스타일 선택: 실사형, 아이소메트릭, 건축모형, 플레이모빌, 손그림 스케치
- 브랜드 컬러 선택
- 브랜드 컬러 직접 입력
- 부스 스타일 선택
- 결과 프롬프트 복사
- 제출용 전체 결과 복사
- 제출하기 버튼으로 Google Sheet 저장

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS

## Google Sheet 제출 설정

1. Google Sheet를 새로 만듭니다.
2. 메뉴에서 `확장 프로그램` → `Apps Script`를 엽니다.
3. 아래 코드를 붙여넣고 저장합니다.

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.participantName || "",
    data.teamName || "",
    data.organizationName || "",
    data.projectName || "",
    data.conceptPrompt || "",
    data.imagePrompt || "",
    data.submissionText || "",
    JSON.stringify(data.form || {}),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

코드 저장 후 반드시 `배포` → `배포 관리` → 웹 앱 배포 `수정`에서 새 버전으로 다시 배포해야 합니다. 웹 앱 URL 테스트 시 `doPost` 함수를 찾을 수 없다는 오류가 나오면 위 코드가 저장/배포되지 않은 상태입니다.

4. `배포` → `새 배포` → 유형 `웹 앱`을 선택합니다.
5. 실행 권한은 본인, 접근 권한은 `모든 사용자`로 설정합니다.
6. 생성된 Web App URL을 복사합니다.
7. Vercel 프로젝트 설정에서 `Settings` → `Environment Variables`에 아래 값을 추가합니다.

```text
GOOGLE_SHEETS_WEBAPP_URL=복사한_Web_App_URL
```

8. Vercel에서 다시 배포하면 `구글시트에 제출하기` 버튼이 작동합니다.

## Gemini 초안 생성 설정

1. [Google AI Studio](https://aistudio.google.com/)에서 API 키를 만듭니다.
2. Vercel 프로젝트 설정에서 `Settings` → `Environment Variables`에 아래 값을 추가합니다.

```text
GEMINI_API_KEY=복사한_Gemini_API_Key
```

3. Vercel에서 다시 배포하면 `Gemini 무료 티어로 초안 만들기` 버튼이 작동합니다.

현재 버전은 PDF 본문을 자동 추출하지 않고, 사용자가 `자료 메모 요약`에 붙여넣은 내용을 바탕으로 워크시트 초안을 만듭니다.
