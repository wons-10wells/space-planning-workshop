"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Building2,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Layers3,
  PencilLine,
  Send,
  Sparkles,
  UploadCloud,
  WalletCards,
} from "lucide-react";

type FormState = {
  organizationName: string;
  organizationType: string;
  users: string;
  region: string;
  participantName: string;
  teamName: string;
  projectName: string;
  goal: string;
  keywords: string;
  mood: string;
  spaceType: string;
  size: string;
  existingCondition: string;
  mustHave: string;
  activities: string;
  budget: string;
  productionMethod: string;
  constraints: string;
  maintenance: string;
  style: string;
  brandColor: string;
  brandColorText: string;
  boothStyle: string;
};

type FieldKey = keyof FormState;
type StartMode = "materials" | "manual" | null;

const initialForm: FormState = {
  organizationName: "",
  organizationType: "",
  users: "",
  region: "",
  participantName: "",
  teamName: "",
  projectName: "",
  goal: "",
  keywords: "",
  mood: "",
  spaceType: "",
  size: "",
  existingCondition: "",
  mustHave: "",
  activities: "",
  budget: "",
  productionMethod: "",
  constraints: "",
  maintenance: "",
  style: "실사형",
  brandColor: "브랜드 원색 중심",
  brandColorText: "",
  boothStyle: "워크숍 부스형",
};

const styleOptions = [
  {
    label: "실사형",
    prompt: "photorealistic architectural interior visualization, natural lighting, realistic materials",
  },
  {
    label: "아이소메트릭",
    prompt: "clean isometric spatial design illustration, readable zoning, soft shadows",
  },
  {
    label: "건축모형",
    prompt: "architectural scale model, white card model, miniature people, material samples",
  },
  {
    label: "플레이모빌",
    prompt: "playful Playmobil-inspired miniature scene, toy-like figures, clear activity zones",
  },
  {
    label: "손그림 스케치",
    prompt: "hand-drawn architectural concept sketch, watercolor accents, annotated atmosphere",
  },
];

const brandColorOptions = [
  {
    label: "브랜드 원색 중심",
    prompt: "use the brand's primary colors clearly on key surfaces, signage, and focal furniture",
  },
  {
    label: "밝고 경쾌한 컬러",
    prompt: "use bright, energetic colors with a friendly public-workshop atmosphere",
  },
  {
    label: "차분한 중립톤",
    prompt: "use calm neutral tones with subtle brand color accents",
  },
  {
    label: "자연/친환경 톤",
    prompt: "use natural greens, warm wood tones, recycled-looking textures, and soft brand accents",
  },
  {
    label: "고대비 포인트",
    prompt: "use a high-contrast accent color system for strong wayfinding and visual recognition",
  },
];

const boothStyleOptions = [
  {
    label: "워크숍 부스형",
    prompt: "a practical workshop booth layout with tables, display boards, storage, and clear circulation",
  },
  {
    label: "전시 쇼케이스형",
    prompt: "an exhibition showcase booth with product-like displays, graphic panels, and curated lighting",
  },
  {
    label: "상담 라운지형",
    prompt: "a welcoming consultation lounge booth with soft seating, semi-private conversation zones, and reception signage",
  },
  {
    label: "체험형 팝업",
    prompt: "an interactive pop-up booth with hands-on activity zones, modular fixtures, and visible participation moments",
  },
  {
    label: "교육/세미나형",
    prompt: "an educational seminar booth with a small presentation area, writable surfaces, and flexible seating",
  },
];

const sections: Array<{
  title: string;
  icon: ReactNode;
  fields: Array<{
    key: FieldKey;
    label: string;
    placeholder: string;
    type?: "input" | "textarea";
  }>;
}> = [
  {
    title: "워크숍 참여 정보",
    icon: <PencilLine className="h-4 w-4" />,
    fields: [
      { key: "participantName", label: "참가자명", placeholder: "예: 홍길동" },
      { key: "teamName", label: "팀/그룹명", placeholder: "예: 3조, 청소년 공간팀, 브랜드 A팀" },
    ],
  },
  {
    title: "기관 정보",
    icon: <Building2 className="h-4 w-4" />,
    fields: [
      { key: "organizationName", label: "기관명", placeholder: "예: 주식회사 텐웰즈" },
      { key: "organizationType", label: "기관 유형", placeholder: "예: 공공기관, 학교, 지역 커뮤니티 시설" },
      { key: "users", label: "주 이용자", placeholder: "예: 초등 고학년, 보호자, 지역 주민" },
      { key: "region", label: "지역/맥락", placeholder: "예: 오래된 주거지와 시장 사이의 생활권" },
    ],
  },
  {
    title: "프로젝트 정보",
    icon: <Clipboard className="h-4 w-4" />,
    fields: [
      { key: "projectName", label: "프로젝트명", placeholder: "예: 방과후 창작 라운지 조성" },
      { key: "goal", label: "공간 목표", placeholder: "이 공간이 해결해야 할 문제와 기대 변화를 적어주세요.", type: "textarea" },
      { key: "keywords", label: "핵심 키워드", placeholder: "예: 환대, 자율성, 전시, 돌봄, 조용한 몰입" },
      { key: "mood", label: "원하는 분위기", placeholder: "예: 밝지만 과하지 않고, 따뜻하고 정돈된 느낌" },
    ],
  },
  {
    title: "공간 정보",
    icon: <Layers3 className="h-4 w-4" />,
    fields: [
      { key: "spaceType", label: "공간 종류", placeholder: "예: 로비, 교실, 복도, 유휴실, 야외 데크" },
      { key: "size", label: "면적/규모", placeholder: "예: 약 45㎡, 10m x 4.5m, 천장고 2.6m" },
      { key: "existingCondition", label: "현재 상태", placeholder: "채광, 벽/바닥 상태, 기존 가구, 동선 문제를 적어주세요.", type: "textarea" },
      { key: "mustHave", label: "필수 요소", placeholder: "예: 이동식 테이블 4개, 게시벽, 수납, 소규모 발표 영역" },
      { key: "activities", label: "주요 활동", placeholder: "예: 만들기, 토론, 전시, 휴식, 대기, 상담" },
    ],
  },
  {
    title: "예산 및 제작 조건",
    icon: <WalletCards className="h-4 w-4" />,
    fields: [
      { key: "budget", label: "예산", placeholder: "예: 1,500만원 이하, 가구 포함, 공사비 별도" },
      { key: "productionMethod", label: "제작 방식", placeholder: "예: 기성 가구 중심, 목공 제작 일부, 셀프 페인팅 가능" },
      { key: "constraints", label: "제약 조건", placeholder: "소음, 소방법, 철거 가능 범위, 전기/배관, 일정 등을 적어주세요.", type: "textarea" },
      { key: "maintenance", label: "유지관리 조건", placeholder: "예: 청소 쉬움, 파손 시 교체 쉬움, 관리 인력 적음" },
    ],
  },
];

const requiredFields: Array<{ key: FieldKey; label: string; reason: string }> = [
  { key: "organizationName", label: "기관명", reason: "공간의 정체성과 사용자 맥락을 잡는 기준입니다." },
  { key: "users", label: "주 이용자", reason: "연령, 신체 조건, 이용 습관에 따라 가구와 동선이 달라집니다." },
  { key: "goal", label: "공간 목표", reason: "이미지가 단순 장식이 아니라 문제 해결 방향을 담게 합니다." },
  { key: "spaceType", label: "공간 종류", reason: "실내/외부, 통과/체류 공간 여부가 시각화 구도를 바꿉니다." },
  { key: "size", label: "면적/규모", reason: "현실적인 밀도와 가구 배치를 판단하는 핵심 정보입니다." },
  { key: "budget", label: "예산", reason: "마감재, 제작 방식, 제안 수준의 현실성을 가르는 조건입니다." },
  { key: "constraints", label: "제약 조건", reason: "안전, 공사 범위, 일정 리스크를 프롬프트에 반영해야 합니다." },
];

const geminiDraftFields: FieldKey[] = [
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
];

const materialDraft: Partial<FormState> = {
  organizationType: "자료 기반으로 확인 필요",
  users: "자료에서 언급된 주요 이용자 확인 필요",
  goal: "업로드/입력한 자료를 바탕으로 공간의 목적, 해결할 문제, 기대 효과를 정리해 주세요.",
  keywords: "브랜드 톤, 핵심 가치, 공간 키워드 확인 필요",
  mood: "자료의 색감, 문장 톤, 이미지 분위기를 바탕으로 수정해 주세요.",
  spaceType: "자료 기반으로 확인 필요",
  existingCondition: "현장 사진이나 기존 도면에서 확인되는 상태를 정리해 주세요.",
  productionMethod: "자료에 제시된 제작 범위와 조달 방식을 확인해 주세요.",
  constraints: "일정, 공사 가능 범위, 안전/소방, 예산 제약을 확인해 주세요.",
  maintenance: "운영 인력과 청소/교체 난이도를 기준으로 확인해 주세요.",
};

function joinOrFallback(value: string, fallback: string) {
  return value.trim() || fallback;
}

function buildConceptPrompt(form: FormState) {
  return [
    `작성자/팀: ${joinOrFallback([form.participantName, form.teamName].filter(Boolean).join(" / "), "작성자 미정")}`,
    `공간기획 프로젝트: ${joinOrFallback(form.projectName, "이름 미정 프로젝트")}`,
    `기관/맥락: ${joinOrFallback(form.organizationName, "기관명 미정")} (${joinOrFallback(form.organizationType, "기관 유형 미정")}), ${joinOrFallback(form.region, "지역 맥락 미정")}`,
    `주 이용자: ${joinOrFallback(form.users, "주 이용자 미정")}`,
    `공간 목표: ${joinOrFallback(form.goal, "공간 목표 미정")}`,
    `대상 공간: ${joinOrFallback(form.spaceType, "공간 종류 미정")}, 규모 ${joinOrFallback(form.size, "면적 미정")}`,
    `현재 상태: ${joinOrFallback(form.existingCondition, "현재 상태 미정")}`,
    `주요 활동: ${joinOrFallback(form.activities, "활동 미정")}`,
    `필수 요소: ${joinOrFallback(form.mustHave, "필수 요소 미정")}`,
    `분위기/키워드: ${joinOrFallback([form.mood, form.keywords].filter(Boolean).join(", "), "분위기 미정")}`,
    `브랜드 컬러/부스 스타일: ${joinOrFallback(form.brandColorText, form.brandColor)}, ${form.boothStyle}`,
    `예산/제작 조건: ${joinOrFallback(form.budget, "예산 미정")}, ${joinOrFallback(form.productionMethod, "제작 방식 미정")}`,
    `제약/관리: ${joinOrFallback(form.constraints, "제약 조건 미정")}, ${joinOrFallback(form.maintenance, "유지관리 조건 미정")}`,
  ].join("\n");
}

function buildSubmissionText(form: FormState, conceptPrompt: string, imagePrompt: string) {
  return [
    "[공간기획 워크숍 제출본]",
    `작성자: ${joinOrFallback(form.participantName, "미정")}`,
    `팀/그룹: ${joinOrFallback(form.teamName, "미정")}`,
    "",
    "1. 공간기획 프롬프트",
    conceptPrompt,
    "",
    "2. 최종 이미지 생성 요청문",
    imagePrompt,
  ].join("\n");
}

function buildImagePrompt(form: FormState) {
  const style = styleOptions.find((option) => option.label === form.style) ?? styleOptions[0];
  const brandColor =
    brandColorOptions.find((option) => option.label === form.brandColor) ?? brandColorOptions[0];
  const boothStyle =
    boothStyleOptions.find((option) => option.label === form.boothStyle) ?? boothStyleOptions[0];
  const brandColorDirection = form.brandColorText.trim()
    ? `use these exact brand colors as the main palette: ${form.brandColorText.trim()}`
    : brandColor.prompt;

  return [
    `아래 조건을 바탕으로 공간 컨셉 이미지를 생성해 주세요.`,
    `Create a ${style.prompt} for a community space planning concept.`,
    `Project context: ${joinOrFallback(form.organizationName, "local public organization")} wants to create ${joinOrFallback(form.projectName, "a new shared space")} for ${joinOrFallback(form.users, "local users")}.`,
    `Space: ${joinOrFallback(form.spaceType, "multipurpose room")} of ${joinOrFallback(form.size, "moderate size")}, currently ${joinOrFallback(form.existingCondition, "plain and underused")}.`,
    `Design goal: ${joinOrFallback(form.goal, "make the space welcoming, flexible, and practical")}.`,
    `Brand color direction: ${brandColorDirection}.`,
    `Booth style direction: ${boothStyle.prompt}.`,
    `Include: ${joinOrFallback(form.mustHave, "flexible furniture, storage, display wall, clear circulation")}.`,
    `Activities: ${joinOrFallback(form.activities, "workshops, rest, small group activities, exhibitions")}.`,
    `Mood and keywords: ${joinOrFallback([form.mood, form.keywords].filter(Boolean).join(", "), "warm, organized, inclusive, durable")}.`,
    `Budget and fabrication constraints: ${joinOrFallback(form.budget, "limited budget")}; ${joinOrFallback(form.productionMethod, "ready-made furniture with simple custom elements")}; ${joinOrFallback(form.constraints, "minimal construction")}.`,
    `Make the proposal realistic, safe, accessible, easy to maintain, and suitable for Korean public or educational facilities.`,
    `Avoid luxury finishes, impossible structures, excessive decoration, cluttered layouts, unsafe stairs, blocked exits, and unreadable signage.`,
    `이미지를 생성해 주세요.`,
  ].join(" ");
}

function getRealismChecks(form: FormState) {
  const checks: string[] = [];
  const budgetText = form.budget.replace(/,/g, "");
  const budgetNumbers = budgetText.match(/\d+/g)?.map(Number) ?? [];
  const hasSmallBudget = budgetNumbers.some((number) => number < 500);

  if (!form.size.trim()) {
    checks.push("면적이 없으면 가구 수량과 동선 폭을 과장하기 쉽습니다. 대략적인 가로x세로라도 입력하세요.");
  }

  if (!form.budget.trim()) {
    checks.push("예산이 비어 있어 마감재와 제작 수준을 현실적으로 제한하기 어렵습니다.");
  } else if (hasSmallBudget) {
    checks.push("예산이 낮게 보입니다. 구조 변경보다 도장, 조명 보완, 이동식 가구, 사인물 중심으로 제안하는 편이 현실적입니다.");
  }

  if (!form.constraints.trim()) {
    checks.push("소방, 피난 동선, 전기, 철거 가능 범위 같은 제약을 적어야 실제 시공 가능성 검토가 됩니다.");
  }

  if (form.mustHave.split(",").length > 6 || form.mustHave.split("、").length > 6) {
    checks.push("필수 요소가 많습니다. 작은 공간이라면 고정 가구보다 이동식/겸용 요소로 정리하는 것이 좋습니다.");
  }

  if (!form.maintenance.trim()) {
    checks.push("유지관리 조건이 없으면 멋진 이미지가 나와도 운영 부담이 커질 수 있습니다.");
  }

  if (!checks.length) {
    checks.push("핵심 조건이 잘 잡혀 있습니다. 다음 단계에서는 치수, 동선 폭, 재료 단가를 더 구체화하면 좋습니다.");
  }

  return checks;
}

function buildMaterialSummary(materialText: string, fileNames: string[]) {
  const fileSummary = fileNames.length
    ? `입력 자료: ${fileNames.join(", ")}`
    : "입력 자료: 아직 파일이 선택되지 않았습니다.";
  const textSummary = materialText.trim()
    ? `자료 메모 요약: ${materialText.trim().slice(0, 260)}${materialText.trim().length > 260 ? "..." : ""}`
    : "자료 메모 요약: 기획서의 핵심 문장, 브랜드 설명, 요구사항을 직접 요약해 주세요.";

  return `${fileSummary}\n${textSummary}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white transition hover:bg-graphite focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
      title="복사"
    >
      <Copy className="h-4 w-4" />
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [startMode, setStartMode] = useState<StartMode>(null);
  const [materialText, setMaterialText] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [geminiState, setGeminiState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [geminiMessage, setGeminiMessage] = useState("");
  const [imageToolMessage, setImageToolMessage] = useState("");

  const conceptPrompt = useMemo(() => buildConceptPrompt(form), [form]);
  const imagePrompt = useMemo(() => buildImagePrompt(form), [form]);
  const submissionText = useMemo(
    () => buildSubmissionText(form, conceptPrompt, imagePrompt),
    [form, conceptPrompt, imagePrompt],
  );
  const materialSummary = useMemo(
    () => buildMaterialSummary(materialText, fileNames),
    [materialText, fileNames],
  );
  const missingFields = useMemo(
    () => requiredFields.filter((field) => !form[field.key].trim()),
    [form],
  );
  const checks = useMemo(() => getRealismChecks(form), [form]);

  function updateField(key: FieldKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function chooseMode(mode: Exclude<StartMode, null>) {
    setStartMode(mode);
    setDraftMessage("");
    if (mode === "manual") {
      setForm(initialForm);
      setMaterialText("");
      setFileNames([]);
    }
  }

  function applyMaterialDraft() {
    const baseName = fileNames[0]?.replace(/\.[^/.]+$/, "") ?? "";
    const hasMaterialText = Boolean(materialText.trim());
    setForm((current) => ({
      ...current,
      ...materialDraft,
      projectName: current.projectName || baseName || "자료 기반 공간기획 프로젝트",
      goal: materialText.trim() || materialDraft.goal || "",
      keywords: current.keywords || "브랜드 이미지, 사용자 경험, 공간 정체성, 현실적 제작",
      mood: current.mood || "자료의 색감과 브랜드 톤을 반영한 분위기",
      style: current.style,
    }));
    setDraftMessage(
      hasMaterialText
        ? "자료 메모를 바탕으로 초안을 채웠습니다. 아래 워크시트에서 내용을 확인하고 수정해 주세요."
        : "파일명만 반영했습니다. 현재 버전은 PDF 내용을 자동 분석하지 않으므로 핵심 내용을 직접 붙여넣으면 초안이 더 구체화됩니다.",
    );
  }

  async function applyGeminiDraft() {
    setGeminiState("loading");
    setGeminiMessage("Gemini가 자료 메모를 읽고 워크시트 초안을 만드는 중입니다.");

    try {
      const response = await fetch("/api/gemini-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form,
          materialText,
          fileNames,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        draft?: Partial<FormState>;
        message?: string;
      };

      if (!response.ok || !result.ok || !result.draft) {
        throw new Error(result.message || "Gemini 초안 생성 중 문제가 발생했습니다.");
      }

      setForm((current) => {
        const next = { ...current };
        geminiDraftFields.forEach((key) => {
          const value = result.draft?.[key];
          if (typeof value === "string" && value.trim()) {
            next[key] = value;
          }
        });
        return next;
      });
      setGeminiState("success");
      setGeminiMessage("Gemini 초안을 반영했습니다. 아래 워크시트에서 사실관계와 표현을 확인해 주세요.");
      setDraftMessage("");
    } catch (error) {
      setGeminiState("error");
      setGeminiMessage(
        error instanceof Error
          ? error.message
          : "Gemini 초안 생성에 실패했습니다. Vercel 환경변수 GEMINI_API_KEY를 확인해 주세요.",
      );
    }
  }

  async function handleSubmit() {
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form,
          conceptPrompt,
          imagePrompt,
          submissionText,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "제출 중 문제가 발생했습니다.");
      }

      setSubmitState("success");
      setSubmitMessage("제출이 완료되었습니다. 구글시트에서 새 행을 확인해 주세요.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "제출 설정을 확인해 주세요. Google Apps Script URL이 필요합니다.",
      );
    }
  }

  async function openImageTool(url: string, label: string) {
    try {
      await navigator.clipboard.writeText(imagePrompt);
      setImageToolMessage(`${label}가 열립니다. 새 창에서 복사된 요청문을 직접 붙여넣어 주세요.`);
    } catch {
      setImageToolMessage(`${label}가 열립니다. 요청문 복사가 막히면 위의 최종 이미지 요청문 복사 버튼을 사용해 주세요.`);
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-ink/10 bg-linen/90">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-moss/30 bg-white/70 px-3 py-1 text-sm font-semibold text-moss">
              <Sparkles className="h-4 w-4" />
              공간기획 워크숍
            </div>
            <h1 className="flex max-w-3xl items-center gap-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              <Sparkles className="h-8 w-8 shrink-0 text-coral sm:h-10 sm:w-10" />
              기획서를 넣으면 공간기획을 해드려요
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-graphite">
              참가자별로 기관, 공간, 예산 조건을 입력하시고,
              <br />
              기입된 정보와 조건들을 확인합니다.
              <br />
              생성된 요청문을 복사해 AI에 입력하면,
              <br />
              공간 컨셉 이미지가 나옵니다.
            </p>
          </div>
          <div className="grid content-end gap-2 rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="text-sm font-semibold text-graphite">진행 상태</div>
            <div className="h-3 overflow-hidden rounded-full bg-fog">
              <div
                className="h-full rounded-full bg-coral transition-all"
                style={{
                  width: `${Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)}%`,
                }}
              />
            </div>
            <div className="text-sm text-graphite">
              필수 정보 {requiredFields.length - missingFields.length}/{requiredFields.length}개 입력됨
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8">
        <div className="grid gap-4">
          <section className="rounded-md border border-moss/20 bg-white p-4 shadow-panel">
            <div className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                <Clipboard className="h-4 w-4" />
              </span>
              워크숍 진행 안내
            </div>
            <div className="grid gap-2 text-sm leading-6 text-graphite sm:grid-cols-3">
              <div className="rounded-md bg-linen/70 p-3">1. 시작 방식을 선택하고 자료 또는 빈칸으로 초안을 만듭니다.</div>
              <div className="rounded-md bg-linen/70 p-3">2. 누락 정보와 현실성 체크를 보며 내용을 보완합니다.</div>
              <div className="rounded-md bg-linen/70 p-3">3. 제출용 결과를 복사해 진행자에게 공유합니다.</div>
            </div>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                <Sparkles className="h-4 w-4" />
              </span>
              시작 방식
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseMode("materials")}
                className={`grid min-h-28 gap-2 rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 ${
                  startMode === "materials"
                    ? "border-coral bg-coral/10"
                    : "border-ink/15 bg-linen/40 hover:border-moss hover:bg-white"
                }`}
              >
                <span className="inline-flex items-center gap-2 text-base font-bold text-ink">
                  <FileText className="h-5 w-5 text-moss" />
                  기존 자료로 시작
                </span>
                <span className="text-sm leading-6 text-graphite">
                  기획서 PDF, 브랜드 이미지, 메모를 넣고 요약된 초안을 만든 뒤 수정합니다.
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseMode("manual")}
                className={`grid min-h-28 gap-2 rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 ${
                  startMode === "manual"
                    ? "border-coral bg-coral/10"
                    : "border-ink/15 bg-linen/40 hover:border-moss hover:bg-white"
                }`}
              >
                <span className="inline-flex items-center gap-2 text-base font-bold text-ink">
                  <PencilLine className="h-5 w-5 text-moss" />
                  직접 작성
                </span>
                <span className="text-sm leading-6 text-graphite">
                  빈 워크시트에서 질문에 답하며 공간기획 정보를 직접 채웁니다.
                </span>
              </button>
            </div>
          </section>

          {startMode === "materials" ? (
            <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
              <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                  <UploadCloud className="h-4 w-4" />
                </span>
                자료 입력
              </div>
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-graphite">기획서/브랜드 이미지</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(event) =>
                      setFileNames(Array.from(event.target.files ?? []).map((file) => file.name))
                    }
                    className="rounded-md border border-dashed border-ink/20 bg-linen/40 px-3 py-3 text-sm text-graphite file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-graphite">자료 메모 요약</span>
                  <textarea
                    value={materialText}
                    onChange={(event) => setMaterialText(event.target.value)}
                    rows={5}
                    placeholder="기획서의 핵심 문장, 브랜드 톤, 요구사항을 직접 요약해 주세요. 예: 사회적가치페스타 참여 부스, 텐웰즈 브랜드 컬러 활용, 상담과 체험이 가능한 팝업형 공간"
                    className="min-h-32 rounded-md border border-ink/15 bg-linen/40 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-graphite/45 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </label>
                <div className="rounded-md bg-fog p-3 text-sm leading-6 text-graphite">
                  <pre className="whitespace-pre-wrap font-sans">{materialSummary}</pre>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={applyMaterialDraft}
                    className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-graphite focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    기본 초안 만들기
                  </button>
                  <button
                    type="button"
                    onClick={applyGeminiDraft}
                    disabled={geminiState === "loading"}
                    className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-moss/90 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    {geminiState === "loading" ? "Gemini 생성 중" : "Gemini 무료 티어로 초안 만들기"}
                  </button>
                </div>
                <p className="rounded-md bg-fog p-3 text-sm leading-6 text-graphite">
                  Gemini 버튼은 Vercel 환경변수에 API 키를 설정한 뒤 배포 링크에서 작동합니다. PDF 본문 자동 추출은 아직 아니며, 자료 메모 요약에 붙여넣은 내용을 바탕으로 초안을 만듭니다.
                </p>
                {draftMessage ? (
                  <p className="rounded-md border border-coral/20 bg-coral/5 p-3 text-sm leading-6 text-graphite">
                    {draftMessage}
                  </p>
                ) : null}
                {geminiMessage ? (
                  <p
                    className={`rounded-md p-3 text-sm leading-6 ${
                      geminiState === "success"
                        ? "bg-fog text-moss"
                        : geminiState === "error"
                          ? "border border-coral/20 bg-coral/5 text-graphite"
                          : "bg-linen text-graphite"
                    }`}
                  >
                    {geminiMessage}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          {startMode === "manual" ? (
            <section className="rounded-md border border-moss/20 bg-white p-4 text-sm leading-6 text-graphite shadow-panel">
              빈 워크시트로 시작합니다. 아래 질문에 답하면 오른쪽 결과가 즉시 갱신됩니다.
            </section>
          ) : null}

          {sections.map((section) => (
            <section key={section.title} className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
              <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                  {section.icon}
                </span>
                {section.title}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const isTextarea = field.type === "textarea";
                  return (
                    <label
                      key={field.key}
                      className={isTextarea ? "grid gap-2 md:col-span-2" : "grid gap-2"}
                    >
                      <span className="text-sm font-semibold text-graphite">{field.label}</span>
                      {isTextarea ? (
                        <textarea
                          value={form[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          rows={4}
                          placeholder={field.placeholder}
                          className="min-h-28 rounded-md border border-ink/15 bg-linen/40 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-graphite/45 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                        />
                      ) : (
                        <input
                          value={form[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          placeholder={field.placeholder}
                          className="h-11 rounded-md border border-ink/15 bg-linen/40 px-3 text-sm outline-none transition placeholder:text-graphite/45 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                <ImageIcon className="h-4 w-4" />
              </span>
              이미지 스타일
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {styleOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => updateField("style", option.label)}
                  className={`min-h-12 rounded-md border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 ${
                    form.style === option.label
                      ? "border-coral bg-coral text-white"
                      : "border-ink/15 bg-linen/50 text-graphite hover:border-moss hover:bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                <Sparkles className="h-4 w-4" />
              </span>
              브랜드 컬러
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {brandColorOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => updateField("brandColor", option.label)}
                  className={`min-h-12 rounded-md border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 ${
                    form.brandColor === option.label
                      ? "border-coral bg-coral text-white"
                      : "border-ink/15 bg-linen/50 text-graphite hover:border-moss hover:bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="mt-4 grid gap-2">
              <span className="text-sm font-semibold text-graphite">브랜드 컬러 직접 입력</span>
              <input
                value={form.brandColorText}
                onChange={(event) => updateField("brandColorText", event.target.value)}
                placeholder="예: #005BAC, 흰색, 라임 포인트 / 네이비 70%, 아이보리 20%, 오렌지 10%"
                className="h-11 rounded-md border border-ink/15 bg-linen/40 px-3 text-sm outline-none transition placeholder:text-graphite/45 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
              />
            </label>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fog text-moss">
                <Building2 className="h-4 w-4" />
              </span>
              부스 스타일
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {boothStyleOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => updateField("boothStyle", option.label)}
                  className={`min-h-12 rounded-md border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 ${
                    form.boothStyle === option.label
                      ? "border-coral bg-coral text-white"
                      : "border-ink/15 bg-linen/50 text-graphite hover:border-moss hover:bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-4">
          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">누락 정보</h2>
              <span className="rounded-md bg-fog px-2 py-1 text-xs font-bold text-moss">
                {missingFields.length}개
              </span>
            </div>
            {missingFields.length ? (
              <ul className="grid gap-2">
                {missingFields.map((field) => (
                  <li key={field.key} className="rounded-md border border-coral/20 bg-coral/5 p-3">
                    <div className="text-sm font-bold text-ink">{field.label}</div>
                    <div className="mt-1 text-sm leading-6 text-graphite">{field.reason}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-md bg-fog p-3 text-sm leading-6 text-graphite">
                필수 입력이 채워졌습니다. 이제 세부 치수와 현장 사진을 붙이면 더 좋은 결과를 만들 수 있습니다.
              </p>
            )}
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <h2 className="mb-3 text-lg font-bold text-ink">현실성 체크</h2>
            <ul className="grid gap-2">
              {checks.map((check) => (
                <li key={check} className="rounded-md bg-linen/70 p-3 text-sm leading-6 text-graphite">
                  {check}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">공간기획 프롬프트</h2>
              <CopyButton text={conceptPrompt} />
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-ink p-3 text-sm leading-6 text-linen">
              {conceptPrompt}
            </pre>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">최종 이미지 요청문</h2>
              <CopyButton text={imagePrompt} />
            </div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-graphite p-3 text-sm leading-6 text-linen">
              {imagePrompt}
            </pre>
          </section>

          <section className="rounded-md border border-coral/20 bg-white p-4 shadow-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">제출용 전체 결과</h2>
              <CopyButton text={submissionText} />
            </div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-linen p-3 text-sm leading-6 text-graphite">
              {submissionText}
            </pre>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitState === "submitting"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white transition hover:bg-coral/90 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitState === "submitting" ? "제출 중" : "구글시트에 제출하기"}
              </button>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openImageTool("https://chatgpt.com/", "챗지피티")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-graphite focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  챗지피티로 이미지 생성하기
                </button>
                <button
                  type="button"
                  onClick={() => openImageTool("https://gemini.google.com/", "구글 제미나이")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-moss/90 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  구글 제미나이로 이미지 생성하기
                </button>
              </div>
              <p className="rounded-md bg-fog p-3 text-sm leading-6 text-graphite">
                버튼을 누르면 최종 이미지 요청문이 복사되고 새 창이 열립니다. 창이 열리면 직접 붙여넣기를 해야 합니다.
              </p>
              {imageToolMessage ? (
                <p className="rounded-md border border-moss/20 bg-white p-3 text-sm leading-6 text-graphite">
                  {imageToolMessage}
                </p>
              ) : null}
              {submitMessage ? (
                <p
                  className={`rounded-md p-3 text-sm leading-6 ${
                    submitState === "success"
                      ? "bg-fog text-moss"
                      : "border border-coral/20 bg-coral/5 text-graphite"
                  }`}
                >
                  {submitMessage}
                </p>
              ) : (
                <p className="rounded-md bg-fog p-3 text-sm leading-6 text-graphite">
                  제출 기능은 Vercel 환경변수에 Google Apps Script Web App URL을 설정하면 작동합니다.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
