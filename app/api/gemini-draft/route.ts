import { NextResponse } from "next/server";

type DraftRequest = {
  form?: Record<string, string>;
  materialText?: string;
  fileNames?: string[];
};

const draftKeys = [
  "organizationName",
  "organizationType",
  "users",
  "region",
  "participantName",
  "teamName",
  "projectName",
  "goal",
  "keywords",
  "mood",
  "spaceType",
  "size",
  "existingCondition",
  "mustHave",
  "activities",
  "budget",
  "productionMethod",
  "constraints",
  "maintenance",
  "brandColorText",
] as const;

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not include JSON.");
  }

  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Gemini API 키가 설정되어 있지 않습니다. Vercel 환경변수 GEMINI_API_KEY를 추가해 주세요.",
      },
      { status: 500 },
    );
  }

  let payload: DraftRequest;

  try {
    payload = (await request.json()) as DraftRequest;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 데이터 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const materialText = payload.materialText?.trim() ?? "";
  const fileNames = payload.fileNames ?? [];
  const form = payload.form ?? {};

  if (!materialText && !fileNames.length) {
    return NextResponse.json(
      { ok: false, message: "자료 메모 요약이나 파일명을 먼저 입력해 주세요." },
      { status: 400 },
    );
  }

  const instruction = `
너는 한국어 공간기획 워크숍의 보조 퍼실리테이터다.
참가자가 붙여넣은 기획서/브랜드 자료 메모와 현재 입력값을 바탕으로 워크시트 초안을 만든다.

규칙:
- 반드시 JSON 객체 하나만 반환한다.
- JSON key는 다음 목록만 사용한다: ${draftKeys.join(", ")}
- 확실하지 않은 정보는 지어내지 말고 "자료 기반으로 확인 필요"처럼 표시한다.
- 이미 현재 입력값에 구체적인 내용이 있으면 유지하거나 살짝 정돈한다.
- 한국어로 작성한다.
- 공간 목표, 현재 상태, 제약 조건은 워크숍 참가자가 바로 수정할 수 있게 구체적인 문장으로 쓴다.

입력 파일명:
${fileNames.length ? fileNames.join(", ") : "없음"}

자료 메모 요약:
${materialText || "없음"}

현재 입력값:
${JSON.stringify(form, null, 2)}
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: instruction }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini returned ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    const draft = extractJson(text);
    const filteredDraft = Object.fromEntries(
      draftKeys
        .map((key) => [key, typeof draft[key] === "string" ? draft[key] : ""])
        .filter(([, value]) => value),
    );

    return NextResponse.json({ ok: true, draft: filteredDraft });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Gemini 초안 생성에 실패했습니다. API 키, 무료 티어 한도, 입력 내용을 확인해 주세요.",
      },
      { status: 502 },
    );
  }
}
