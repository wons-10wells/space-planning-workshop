import { NextResponse } from "next/server";

type DraftRequest = {
  form?: Record<string, string>;
  materialText?: string;
  referenceImageNotes?: string;
};

const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);
const maxUploadBytes = 4 * 1024 * 1024;
const maxFiles = 5;

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
  let files: File[];

  try {
    const body = await request.formData();
    payload = JSON.parse(String(body.get("payload") ?? "{}")) as DraftRequest;
    files = [...body.getAll("materials"), ...body.getAll("references")].filter(
      (item): item is File => item instanceof File,
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "자료 업로드 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const materialText = payload.materialText?.trim() ?? "";
  const referenceImageNotes = payload.referenceImageNotes?.trim() ?? "";
  const form = payload.form ?? {};

  if (!materialText && !files.length && !referenceImageNotes) {
    return NextResponse.json(
      { ok: false, message: "PDF나 사진을 올리거나 자료 메모를 입력해 주세요." },
      { status: 400 },
    );
  }

  if (files.length > maxFiles || files.reduce((total, file) => total + file.size, 0) > maxUploadBytes) {
    return NextResponse.json(
      { ok: false, message: "파일은 최대 5개, 전체 4MB 이하로 올려 주세요. 큰 PDF는 필요한 페이지만 나눠 저장해 주세요." },
      { status: 413 },
    );
  }

  if (files.some((file) => !allowedTypes.has(file.type))) {
    return NextResponse.json(
      { ok: false, message: "PDF, JPG, PNG, WEBP 파일만 분석할 수 있습니다." },
      { status: 400 },
    );
  }

  const instruction = `
너는 한국어 공간기획 워크숍의 보조 퍼실리테이터다.
첨부된 기획서, 사진, 브랜드 이미지와 자료 메모를 직접 읽고 워크시트 초안을 만든다.

규칙:
- 반드시 JSON 객체 하나만 반환한다.
- JSON key는 다음 목록만 사용한다: ${draftKeys.join(", ")}
- 자료에서 확인할 수 없는 항목은 빈 문자열로 둔다. 추측하거나 "확인 필요"로 채우지 않는다.
- 이미 현재 입력값이 있는 항목은 변경하지 않는다.
- 참고 이미지는 색상과 분위기의 근거로만 쓰고, 문서에 없는 예산이나 면적을 추측하지 않는다.
- 사진 속 글씨가 읽히지 않으면 그 정보는 비워 둔다.
- 한국어로 작성한다.
- 공간 목표, 현재 상태, 제약 조건은 워크숍 참가자가 바로 수정할 수 있게 구체적인 문장으로 쓴다.

첨부 파일:
${files.length ? files.map((file) => file.name).join(", ") : "없음"}

자료 메모 요약:
${materialText || "없음"}

참고 이미지 설명:
${referenceImageNotes || "없음"}

현재 입력값:
${JSON.stringify(form, null, 2)}
`;

  try {
    const parts = await Promise.all(
      files.map(async (file) => ({
        inlineData: {
          mimeType: file.type,
          data: Buffer.from(await file.arrayBuffer()).toString("base64"),
        },
      })),
    );
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
              parts: [{ text: instruction }, ...parts],
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
