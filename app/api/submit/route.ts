import { NextResponse } from "next/server";

type SubmissionPayload = {
  form?: Record<string, string>;
  conceptPrompt?: string;
  imagePrompt?: string;
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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submittedAt: new Date().toISOString(),
        participantName: form.participantName ?? "",
        teamName: form.teamName ?? "",
        organizationName: form.organizationName ?? "",
        projectName: form.projectName ?? "",
        form,
        conceptPrompt: payload.conceptPrompt ?? "",
        imagePrompt: payload.imagePrompt ?? "",
        submissionText: payload.submissionText ?? "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets endpoint returned ${response.status}`);
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
