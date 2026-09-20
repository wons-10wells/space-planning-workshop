import { NextResponse } from "next/server";

type SubmissionPayload = {
  form?: Record<string, string>;
  submissionText?: string;
};

export async function POST(request: Request) {
  const endpoint = process.env.GOOGLE_SHEETS_WEBAPP_URL;

  if (!endpoint) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "제출 기능 설정이 아직 없습니다. Vercel 환경변수 GOOGLE_SHEETS_WEBAPP_URL을 추가해 주세요.",
      },
      { status: 500 },
    );
  }

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint.trim())) {
    return NextResponse.json(
      { ok: false, message: "Vercel의 GOOGLE_SHEETS_WEBAPP_URL에 Apps Script 웹 앱 /exec 주소를 설정해 주세요." },
      { status: 500 },
    );
  }

  let payload: SubmissionPayload;

  try {
    payload = (await request.json()) as SubmissionPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "제출 데이터 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const form = payload.form ?? {};

  try {
    const response = await fetch(endpoint.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectName: form.projectName?.trim() || "미정",
        submissionText: payload.submissionText ?? "",
      }),
    });
    const responseText = await response.text();

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { ok: false, message: "Apps Script 접근이 거부됐습니다. 웹 앱 접근 권한을 '모든 사용자'로 다시 배포해 주세요." },
        { status: 502 },
      );
    }

    if (responseText.includes("doPost") && responseText.includes("찾을 수 없습니다")) {
      return NextResponse.json(
        { ok: false, message: "Apps Script 배포 버전에 doPost 함수가 없습니다. 코드를 저장하고 새 버전으로 배포해 주세요." },
        { status: 502 },
      );
    }

    let result: { ok?: boolean; schema?: string; message?: string };
    try {
      result = JSON.parse(responseText) as { ok?: boolean; schema?: string; message?: string };
    } catch {
      return NextResponse.json(
        { ok: false, message: "Apps Script가 JSON 대신 오류 페이지를 반환했습니다. 웹 앱 URL과 배포 기록을 확인해 주세요." },
        { status: 502 },
      );
    }

    if (!response.ok || result.ok !== true) {
      return NextResponse.json(
        { ok: false, message: result.message || `Apps Script 제출에 실패했습니다. (HTTP ${response.status})` },
        { status: 502 },
      );
    }

    if (result.schema !== "workshop-three-columns-v1") {
      return NextResponse.json(
        { ok: true, message: "제출 요청은 처리됐지만 Apps Script가 이전 형식으로 응답했습니다. 시트의 행을 확인하고 3열용 doPost 코드를 새 버전으로 배포해 주세요." },
      );
    }

    return NextResponse.json({ ok: true, message: "제출이 완료되었습니다." });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "구글시트 제출에 실패했습니다. Apps Script 배포 URL과 접근 권한을 확인해 주세요.",
      },
      { status: 502 },
    );
  }
}
