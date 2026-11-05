import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type View = "home" | "learn" | "coach" | "neighbors" | "progress";
type Persona = "학습자" | "이웃 도우미" | "모임 운영자";
type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  icon: string;
  color: string;
  steps: string[];
  guide: string;
};
type Reply = { author: string; text: string };
type Post = {
  id: string;
  kind: "질문" | "도움 요청";
  title: string;
  body: string;
  author: string;
  time: string;
  resolved: boolean;
  hidden: boolean;
  reported: boolean;
  replies: Reply[];
};
type SavedState = {
  started: string[];
  completed: string[];
  steps: Record<string, number>;
  posts: Post[];
  persona: Persona;
  progressVisible: boolean;
};

const tasks: Task[] = [
  {
    id: "photo",
    title: "사진 보내기",
    description: "가족에게 사진 한 장을 보내 봐요.",
    category: "연락하기",
    duration: "약 5분",
    icon: "▧",
    color: "peach",
    guide: "사진 보내기 안내",
    steps: [
      "사진을 보내고 싶은 사람과의 대화방을 열어요.",
      "화면 아래쪽의 사진 모양 또는 + 버튼을 눌러요.",
      "보내고 싶은 사진을 한 장 골라요.",
      "사진이 맞는지 확인한 뒤 보내기 버튼을 눌러요.",
    ],
  },
  {
    id: "bus",
    title: "버스 정보 찾기",
    description: "청도 버스 시간과 가는 길을 찾아봐요.",
    category: "외출 준비",
    duration: "약 4분",
    icon: "↗",
    color: "sage",
    guide: "버스 정보 찾기 안내",
    steps: [
      "인터넷 검색 앱을 열어요.",
      "찾고 싶은 곳과 ‘버스’를 함께 입력해요.",
      "검색 결과에서 공식 교통 안내를 찾아 눌러요.",
      "날짜와 방향을 확인해요. 출발 전 최신 시간을 다시 살펴봐요.",
    ],
  },
  {
    id: "map",
    title: "길 찾기",
    description: "목적지를 검색하고 길 안내를 살펴봐요.",
    category: "외출 준비",
    duration: "약 5분",
    icon: "⌖",
    color: "blue",
    guide: "지도에서 길 찾기 안내",
    steps: [
      "지도 앱을 열고 검색 칸을 눌러요.",
      "가려는 장소의 이름을 입력해요.",
      "검색 결과에서 맞는 장소를 골라요.",
      "길 찾기를 눌러 이동 방법을 확인해요. 현재 위치 공유는 선택이에요.",
    ],
  },
  {
    id: "font",
    title: "글자 크게 보기",
    description: "휴대폰 화면의 글자를 편하게 키워봐요.",
    category: "휴대폰 설정",
    duration: "약 3분",
    icon: "Aa",
    color: "lavender",
    guide: "휴대폰 글자 크게 보기 안내",
    steps: [
      "휴대폰의 설정 앱을 열어요.",
      "화면 또는 디스플레이 메뉴를 찾아요.",
      "글자 크기 메뉴를 눌러요.",
      "동그란 조절 막대를 움직여 편한 크기로 맞춰요.",
    ],
  },
];

const initialPosts: Post[] = [
  {
    id: "p1",
    kind: "도움 요청",
    title: "사진을 보내려는데 사진 고르는 곳이 안 보여요",
    body: "대화방까지는 열었어요. 다음에 어디를 눌러야 할까요?",
    author: "배움마루 모임",
    time: "오늘 오전",
    resolved: false,
    hidden: false,
    reported: false,
    replies: [
      {
        author: "이웃 도우미",
        text: "화면 아래쪽에 + 표시가 있는지 천천히 찾아보세요. 눌러도 괜찮은지 함께 확인해 드릴게요.",
      },
    ],
  },
  {
    id: "p2",
    kind: "질문",
    title: "버스 시간은 어디에서 확인하면 좋을까요?",
    body: "청도에서 다른 읍으로 갈 때 공식 시간표를 보고 싶어요.",
    author: "배움마루 모임",
    time: "어제",
    resolved: false,
    hidden: false,
    reported: false,
    replies: [],
  },
  {
    id: "p3",
    kind: "도움 요청",
    title: "휴대폰 글자를 조금 더 크게 바꿨어요",
    body: "설정에서 글자 크기를 찾았습니다. 이제 잘 보여요.",
    author: "배움마루 모임",
    time: "어제",
    resolved: true,
    hidden: false,
    reported: false,
    replies: [
      { author: "이웃 도우미", text: "잘하셨어요. 화면을 보며 편한 크기로 조절하면 돼요." },
    ],
  },
];

const storageKey = "cheongdo-demo-v1";

function readSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SavedState>;
      return {
        started: Array.isArray(saved.started) ? saved.started : [],
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        steps: saved.steps && typeof saved.steps === "object" ? saved.steps : {},
        posts: Array.isArray(saved.posts) ? saved.posts : initialPosts,
        persona: saved.persona ?? "학습자",
        progressVisible: saved.progressVisible ?? true,
      };
    }
  } catch {
    // A damaged or unavailable demo save should not prevent the app from opening.
  }
  return {
    started: [],
    completed: [],
    steps: {},
    posts: initialPosts,
    persona: "학습자",
    progressVisible: true,
  };
}

function App() {
  const [saved, setSaved] = useState<SavedState>(readSavedState);
  const [view, setView] = useState<View>("home");
  const [selectedTask, setSelectedTask] = useState<Task>(tasks[0]);
  const [step, setStep] = useState(0);
  const [largeText, setLargeText] = useState(false);
  const [postKind, setPostKind] = useState<"도움 요청" | "질문">("도움 요청");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "coach",
      text: "안녕하세요. 어떤 일을 하다가 막히셨나요? 한 가지씩 같이 살펴볼게요.",
      source: "",
    },
  ]);
  const chatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
    } catch {
      setNotice("이 브라우저에는 기록을 저장할 수 없어요. 새로고침하면 기록이 사라질 수 있어요.");
    }
  }, [saved]);

  useEffect(
    () => () => {
      if (chatTimer.current) clearTimeout(chatTimer.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const visiblePosts = useMemo(
    () => saved.posts.filter((post) => !post.hidden),
    [saved.posts],
  );
  const openCount = visiblePosts.filter((post) => !post.resolved).length;
  const completionRate = saved.started.length
    ? Math.round((saved.completed.length / saved.started.length) * 100)
    : 0;

  function updateSaved(change: Partial<SavedState>) {
    setSaved((current) => ({ ...current, ...change }));
  }

  function startTask(task: Task) {
    setSelectedTask(task);
    const savedStep = saved.steps[task.id];
    setStep(Number.isInteger(savedStep) ? Math.min(Math.max(savedStep, 0), task.steps.length - 1) : 0);
    updateSaved({ started: [...new Set([...saved.started, task.id])] });
    setView("learn");
  }

  function updateStep(nextStep: number) {
    setStep(nextStep);
    updateSaved({ steps: { ...saved.steps, [selectedTask.id]: nextStep } });
  }

  function completeTask() {
    updateSaved({ completed: [...new Set([...saved.completed, selectedTask.id])] });
    setNotice("잘하셨어요! 배운 내용을 저장했어요.");
  }

  function resetDemo() {
    if (chatTimer.current) clearTimeout(chatTimer.current);
    setChatBusy(false);
    setChatMessages([
      {
        role: "coach",
        text: "안녕하세요. 어떤 일을 하다가 막히셨나요? 한 가지씩 같이 살펴볼게요.",
        source: "",
      },
    ]);
    setSaved({
      started: [],
      completed: [],
      steps: {},
      posts: initialPosts,
      persona: "학습자",
      progressVisible: true,
    });
    setView("home");
    setNotice("데모 기록을 처음 상태로 돌렸어요.");
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setNotice("이 브라우저에서는 음성 읽기를 사용할 수 없어요. 화면의 글을 그대로 읽어 주세요.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    window.speechSynthesis.speak(utterance);
  }

  function sendCoachMessage(event: FormEvent) {
    event.preventDefault();
    const question = chatText.trim();
    if (!question || chatBusy) return;
    const sensitive = /(비밀번호|인증번호|주민등록번호|카드번호|계좌번호|전화번호)/i.test(question);
    if (sensitive) {
      setNotice("개인 정보는 보내지 말아 주세요. 질문에서 지우고 다시 적어 주세요.");
      return;
    }

    setChatText("");
    setChatMessages((current) => [...current, { role: "user", text: question, source: "" }]);
    setChatBusy(true);
    const lower = question.toLowerCase();
    const keywords: Record<string, string[]> = {
      photo: ["사진"],
      bus: ["버스", "시간표"],
      map: ["지도", "길 찾기"],
      font: ["글자", "글씨", "글자 크기"],
    };
    const matched = tasks.find(
      (task) =>
        lower.includes(task.title) ||
        lower.includes(task.guide.replace(" 안내", "")) ||
        keywords[task.id]?.some((keyword) => lower.includes(keyword)),
    );
    const answer = matched
      ? `${matched.title}는 한 단계씩 해 볼 수 있어요.\n\n${matched.steps[0]}\n\n먼저 이 단계만 해 보시고, 화면이 다르면 어떤 글자가 보이는지 알려주세요.`
      : "지금 준비된 안내 예시만으로는 정확히 말씀드리기 어려워요. 잘못 누르지 않도록 동네 모임에 질문을 남기면 이웃이 함께 살펴볼 수 있어요.";
    const source = matched ? matched.guide : "";
    chatTimer.current = setTimeout(() => {
      setChatMessages((current) => [...current, { role: "coach", text: answer, source }]);
      setChatBusy(false);
    }, 650);
  }

  function createPost(event: FormEvent) {
    event.preventDefault();
    const title = postTitle.trim();
    const body = postBody.trim();
    if (!title || !body) {
      setNotice("제목과 내용을 모두 적어 주세요.");
      return;
    }
    const post: Post = {
      id: crypto.randomUUID(),
      kind: postKind,
      title,
      body,
      author: saved.persona,
      time: "방금",
      resolved: false,
      hidden: false,
      reported: false,
      replies: [],
    };
    updateSaved({ posts: [post, ...saved.posts] });
    setPostTitle("");
    setPostBody("");
    setNotice("모임에 글을 올렸어요. 이 데모의 글은 다른 방문자에게도 보여요.");
  }

  function addReply(event: FormEvent, post: Post) {
    event.preventDefault();
    const text = (replyDrafts[post.id] ?? "").trim();
    if (!text) return;
    updateSaved({
      posts: saved.posts.map((item) =>
        item.id === post.id
          ? {
              ...item,
              replies: [...item.replies, { author: saved.persona, text }],
            }
          : item,
      ),
    });
    setReplyDrafts((current) => ({ ...current, [post.id]: "" }));
  }

  function updatePost(postId: string, changes: Partial<Post>) {
    updateSaved({
      posts: saved.posts.map((post) =>
        post.id === postId ? { ...post, ...changes } : post,
      ),
    });
  }

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "home", label: "처음", icon: "⌂" },
    { id: "learn", label: "배우기", icon: "▣" },
    { id: "coach", label: "안내 코치", icon: "✳" },
    { id: "neighbors", label: "이웃에게 묻기", icon: "♡" },
    { id: "progress", label: "내 배움", icon: "↗" },
  ];

  return (
    <div className={`app-shell${largeText ? " large-text" : ""}`}>
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
      <header className="topbar">
        <button className="brand" onClick={() => setView("home")} aria-label="처음 화면으로">
          <span className="brand-mark" aria-hidden="true">청</span>
          <span className="brand-copy"><strong>청도 디지털 생활도우미</strong><small>천천히 배워도 괜찮아요</small></span>
        </button>
        <div className="top-actions">
          <label className="persona-select">
            <span className="sr-only">화면 역할 선택</span>
            <select
              value={saved.persona}
              onChange={(event) => updateSaved({ persona: event.target.value as Persona })}
              aria-label="화면 역할 선택"
            >
              <option>학습자</option>
              <option>이웃 도우미</option>
              <option>모임 운영자</option>
            </select>
          </label>
          <button className="text-button text-size-button" onClick={() => setLargeText((value) => !value)}>
            <span aria-hidden="true">A</span> {largeText ? "글자 보통" : "글자 크게"}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="주요 메뉴">
          <div className="side-label">무엇을 도와드릴까요?</div>
          <nav className="side-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item${view === item.id ? " active" : ""}`}
                onClick={() => setView(item.id)}
                aria-current={view === item.id ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "neighbors" && openCount > 0 && <span className="nav-count">{openCount}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-help">
            <div className="help-dot" aria-hidden="true">?</div>
            <strong>혼자 하기 어려우신가요?</strong>
            <p>동네 이웃에게 편하게 물어보세요.</p>
            <button className="sidebar-link" onClick={() => setView("neighbors")}>이웃 도움 받기 <span aria-hidden="true">→</span></button>
          </div>
          <div className="sidebar-bottom">
            <span className="local-dot" aria-hidden="true" />
            청도 배움마루 모임
          </div>
        </aside>

        <main id="main-content" className="main-content">
          <div className="demo-banner">
            <span className="demo-icon" aria-hidden="true">i</span>
            <p><strong>체험용 데모예요.</strong> 이름·전화번호·비밀번호 같은 개인 정보는 적지 마세요.</p>
            <button onClick={resetDemo}>처음부터 보기</button>
          </div>

          {view === "home" && (
            <HomeView
              started={saved.started}
              completed={saved.completed}
              persona={saved.persona}
              onStart={startTask}
              onNavigate={setView}
              openCount={openCount}
            />
          )}
          {view === "learn" && (
            <LearnView
              task={selectedTask}
              step={step}
              completed={saved.completed.includes(selectedTask.id)}
              onStep={updateStep}
              onComplete={completeTask}
              onSpeak={speak}
              onCoach={() => setView("coach")}
            />
          )}
          {view === "coach" && (
            <CoachView
              messages={chatMessages}
              text={chatText}
              busy={chatBusy}
              onText={setChatText}
              onSend={sendCoachMessage}
              onSuggestion={setChatText}
              onStop={() => {
                if (chatTimer.current) clearTimeout(chatTimer.current);
                setChatBusy(false);
              }}
              onHelp={() => setView("neighbors")}
            />
          )}
          {view === "neighbors" && (
            <NeighborsView
              posts={visiblePosts}
              kind={postKind}
              title={postTitle}
              body={postBody}
              replyDrafts={replyDrafts}
              persona={saved.persona}
              onKind={setPostKind}
              onTitle={setPostTitle}
              onBody={setPostBody}
              onCreate={createPost}
              onReplyDraft={(id, text) => setReplyDrafts((current) => ({ ...current, [id]: text }))}
              onReply={addReply}
              onUpdate={updatePost}
            />
          )}
          {view === "progress" && (
            <ProgressView
              started={saved.started}
              completed={saved.completed}
              completionRate={completionRate}
              posts={visiblePosts}
              visible={saved.progressVisible}
              onToggle={() => updateSaved({ progressVisible: !saved.progressVisible })}
              onStart={startTask}
            />
          )}
          {notice && (
            <div className="toast" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="알림 닫기">×</button>
            </div>
          )}
          <footer className="page-footer">
            <span>천천히, 한 걸음씩. 오늘의 배움이 내일의 자신감이 돼요.</span>
            <span>데모 기록은 이 브라우저에만 저장됩니다.</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? "selected" : ""}
            onClick={() => setView(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function HomeView({
  started,
  completed,
  persona,
  onStart,
  onNavigate,
  openCount,
}: {
  started: string[];
  completed: string[];
  persona: Persona;
  onStart: (task: Task) => void;
  onNavigate: (view: View) => void;
  openCount: number;
}) {
  const nextTask = tasks.find((task) => started.includes(task.id) && !completed.includes(task.id));
  return (
    <>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <div className="eyebrow">청도 배움마루 · {persona}로 체험 중</div>
          <h1>오늘은 무엇을<br /><span>배워볼까요?</span></h1>
          <p>서두르지 않아도 괜찮아요.<br />쉬운 안내를 보며 한 단계씩 해봐요.</p>
          <button className="primary-button" onClick={() => onStart(nextTask ?? tasks[0])}>
            {nextTask ? "이어서 배우기" : "첫 과제 시작하기"} <span aria-hidden="true">→</span>
          </button>
          <div className="welcome-meta"><span className="tiny-check">✓</span> 언제든 다시 보고 연습할 수 있어요</div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="sun-shape" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="phone-art"><div className="phone-speaker" /><div className="phone-screen"><span>안녕하세요!</span><div className="screen-photo">▧</div><i /></div><div className="phone-home" /></div>
          <div className="flower flower-one">✿</div><div className="flower flower-two">✿</div>
          <div className="art-note">천천히<br />함께 배워요</div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title-row">
          <div><div className="eyebrow">LIFE SKILLS</div><h2>생활 과제 배우기</h2></div>
          <button className="subtle-link" onClick={() => onNavigate("learn")}>과제 모두 보기 <span>→</span></button>
        </div>
        <div className="task-grid">
          {tasks.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} done={completed.includes(task.id)} onClick={() => onStart(task)} />
          ))}
        </div>
      </section>

      <section className="home-bottom-grid">
        <button className="feature-card coach-feature" onClick={() => onNavigate("coach")}>
          <span className="feature-icon">✳</span>
          <span className="feature-copy"><small>막히면 언제든 물어보세요</small><strong>생활 안내 코치</strong><span>준비된 안내 예시를 쉬운 말로 살펴봐요.</span></span>
          <span className="feature-arrow">→</span>
        </button>
        <button className="feature-card neighbor-feature" onClick={() => onNavigate("neighbors")}>
          <span className="feature-icon">♡</span>
          <span className="feature-copy"><small>우리 동네가 함께 도와요</small><strong>이웃에게 물어보기 <i>{openCount}</i></strong><span>배움마루 모임에서 질문하고 답을 나눠요.</span></span>
          <span className="feature-arrow">→</span>
        </button>
      </section>
    </>
  );
}

function TaskCard({ task, done, onClick }: { task: Task; done: boolean; onClick: () => void }) {
  return (
    <button className="task-card" onClick={onClick}>
      <span className={`task-art ${task.color}`} aria-hidden="true">{task.icon}</span>
      <span className="task-card-info">
        <span className="task-category">{task.category}</span>
        <strong>{task.title}</strong>
        <span className="task-description">{task.description}</span>
        <span className="task-card-bottom"><span>◷ {task.duration}</span>{done ? <span className="done-tag">완료했어요 ✓</span> : <span className="card-arrow">배우기 →</span>}</span>
      </span>
    </button>
  );
}

function LearnView({
  task,
  step,
  completed,
  onStep,
  onComplete,
  onSpeak,
  onCoach,
}: {
  task: Task;
  step: number;
  completed: boolean;
  onStep: (step: number) => void;
  onComplete: () => void;
  onSpeak: (text: string) => void;
  onCoach: () => void;
}) {
  return (
    <>
      <PageHeading eyebrow={`${task.category} · ${task.duration}`} title={task.title} description={task.description} />
      <div className="learning-layout">
        <section className="learning-main card-surface">
          <div className="learning-topline"><span>따라 해보기</span><button className="text-button" onClick={() => onSpeak(task.steps[step])}>◖ 음성으로 듣기</button></div>
          <div className="step-progress"><span style={{ width: `${((step + 1) / task.steps.length) * 100}%` }} /></div>
          <div className="step-count">단계 <strong>{step + 1}</strong> / {task.steps.length}</div>
          <div className="instruction-card">
            <span className={`instruction-icon ${task.color}`} aria-hidden="true">{step + 1}</span>
            <div><div className="instruction-kicker">지금 할 일</div><h2>{task.steps[step]}</h2><p>천천히 읽고, 직접 해보세요. 잘못 누를까 걱정하지 않아도 괜찮아요.</p></div>
          </div>
          <div className="practice-hint"><span aria-hidden="true">✦</span><p><strong>기억해 주세요</strong><br />이 연습은 안내만 도와드려요. 실제 휴대폰에서 직접 확인하고 진행하세요.</p></div>
          <div className="step-actions">
            <button className="secondary-button" onClick={() => onStep(Math.max(0, step - 1))} disabled={step === 0}>← 이전 단계</button>
            {step < task.steps.length - 1 ? (
              <button className="primary-button" onClick={() => onStep(step + 1)}>다음 단계 <span>→</span></button>
            ) : (
              <button className="primary-button" onClick={onComplete}>{completed ? "완료했어요 ✓" : "배움 마치기 ✓"}</button>
            )}
          </div>
        </section>
        <aside className="learning-aside">
          <div className="aside-card">
            <div className="aside-card-heading"><span className="small-round-icon">☰</span><strong>전체 순서</strong></div>
            <ol className="step-list">
              {task.steps.map((item, index) => (
                <li key={item} className={index === step ? "current" : index < step ? "passed" : ""}>
                  <button onClick={() => onStep(index)} aria-current={index === step ? "step" : undefined}><span className="step-bullet">{index < step ? "✓" : index + 1}</span><span>{item}</span></button>
                </li>
              ))}
            </ol>
          </div>
          <button className="ask-card" onClick={onCoach}><span className="ask-icon">✳</span><strong>잘 안 되나요?</strong><span>안내 코치에게 물어보거나<br />이웃에게 도움을 요청해요.</span><b>도움받기 →</b></button>
        </aside>
      </div>
    </>
  );
}

function CoachView({
  messages,
  text,
  busy,
  onText,
  onSuggestion,
  onSend,
  onStop,
  onHelp,
}: {
  messages: { role: string; text: string; source: string }[];
  text: string;
  busy: boolean;
  onText: (text: string) => void;
  onSuggestion: (text: string) => void;
  onSend: (event: FormEvent) => void;
  onStop: () => void;
  onHelp: () => void;
}) {
  return (
    <>
      <PageHeading eyebrow="LIFE COACH · 체험 화면" title="무엇이 궁금하세요?" description="준비된 생활 안내 예시로 쉬운 설명을 살펴보세요." />
      <div className="coach-layout">
        <section className="coach-panel card-surface">
          <div className="coach-panel-header"><span className="coach-avatar">✳</span><div><strong>생활 안내 코치 데모</strong><small><span className="online-dot" /> 예시 안내 자료를 바탕으로 답해요</small></div><span className="ai-label">체험용</span></div>
          <div className="chat-log" aria-live="polite" aria-relevant="additions">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-row ${message.role === "user" ? "from-user" : ""}`}>
                {message.role === "coach" && <span className="chat-avatar">✳</span>}
                <div className="chat-bubble">
                  {message.role === "coach" && <span className="bubble-label">안내 코치 데모</span>}
                  <p>{message.text}</p>
                  {message.source && <div className="citation"><span aria-hidden="true">▤</span><span><small>참고한 데모 자료</small><strong>{message.source}</strong></span></div>}
                </div>
              </div>
            ))}
            {busy && <div className="chat-row"><span className="chat-avatar">✳</span><div className="chat-bubble typing"><span className="bubble-label">안내를 살펴보고 있어요</span><span className="typing-dots"><i /><i /><i /></span><button onClick={onStop}>답변 멈추기</button></div></div>}
          </div>
          <form className="chat-form" onSubmit={onSend}>
            <label htmlFor="coach-question" className="sr-only">궁금한 점 입력</label>
            <textarea id="coach-question" rows={2} maxLength={500} placeholder="예: 사진은 어떻게 보내나요?" value={text} onChange={(event) => onText(event.target.value)} />
            <div className="chat-form-bottom"><span>개인 정보는 쓰지 마세요 · {text.length}/500</span><button type="submit" className="primary-button" disabled={!text.trim() || busy}>물어보기 <span>↑</span></button></div>
          </form>
          <div className="privacy-note"><span>ⓘ</span> 이 화면은 준비된 예시 답변을 보여주는 데모이며, 실제 AI 서비스와 연결되어 있지 않아요. 중요한 내용은 공식 안내를 확인해 주세요.</div>
        </section>
        <aside className="coach-aside">
          <div className="coach-aside-card"><span className="sparkle">✦</span><h2>이렇게 물어보세요</h2><div className="suggestion-list">{["사진 보내는 법을 알려주세요", "글씨를 크게 하고 싶어요", "버스 시간을 어디서 보나요?"].map((suggestion) => <button type="button" key={suggestion} onClick={() => onSuggestion(suggestion)}>“{suggestion}”</button>)}</div><p>예시를 누르면 질문 칸에 담겨요.</p></div>
          <button className="human-help-card" onClick={onHelp}><span>사람의 도움이 필요하신가요?</span><strong>이웃에게 물어보기 <b>→</b></strong></button>
        </aside>
      </div>
    </>
  );
}

function NeighborsView({
  posts,
  kind,
  title,
  body,
  replyDrafts,
  persona,
  onKind,
  onTitle,
  onBody,
  onCreate,
  onReplyDraft,
  onReply,
  onUpdate,
}: {
  posts: Post[];
  kind: "도움 요청" | "질문";
  title: string;
  body: string;
  replyDrafts: Record<string, string>;
  persona: Persona;
  onKind: (kind: "도움 요청" | "질문") => void;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onCreate: (event: FormEvent) => void;
  onReplyDraft: (id: string, value: string) => void;
  onReply: (event: FormEvent, post: Post) => void;
  onUpdate: (id: string, changes: Partial<Post>) => void;
}) {
  const [filter, setFilter] = useState<"전체" | "도움 요청" | "질문" | "신고된 글">("전체");
  const shown = posts.filter((post) =>
    filter === "신고된 글" ? post.reported : filter === "전체" || post.kind === filter,
  );
  return (
    <>
      <PageHeading eyebrow="배움마루 모임 · 청도" title="이웃과 함께 배워요" description="막히는 일이 있으면 편하게 물어보세요. 서로 천천히 도와요." />
      <div className="community-layout">
        <section className="community-main">
          <div className="community-summary"><div className="group-avatar">청</div><div><strong>청도 배움마루</strong><span>우리 동네 디지털 배움 모임</span></div><span className="synthetic-tag">체험용 모임</span></div>
          <div className="community-toolbar"><div className="filter-tabs" role="group" aria-label="글 종류 필터">{(["전체", "도움 요청", "질문", ...(persona === "모임 운영자" ? ["신고된 글" as const] : [])] as const).map((value) => <button key={value} className={filter === value ? "selected" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div><span>{shown.length}개의 글</span></div>
          <div className="post-list">
            {shown.length === 0 && <div className="empty-state"><span>♡</span><strong>아직 글이 없어요</strong><p>첫 질문을 남겨 함께 배워봐요.</p></div>}
            {shown.map((post) => (
              <article className={`post-card${post.resolved ? " is-resolved" : ""}`} key={post.id}>
                <div className="post-card-top"><span className={`post-type ${post.kind === "도움 요청" ? "help-type" : ""}`}>{post.kind}</span><span className={`status-tag ${post.resolved ? "resolved" : ""}`}>{post.resolved ? "해결했어요" : post.kind === "질문" ? "답변을 기다려요" : "도움이 필요해요"}</span><span className="post-time">{post.time}</span></div>
                <h2>{post.title}</h2><p className="post-body">{post.body}</p>
                <div className="post-meta"><span className="author-avatar">{post.author === "이웃 도우미" ? "이" : "배"}</span>{post.author}<span className="post-meta-sep">·</span><span>{post.replies.length}개의 답변</span></div>
                {post.replies.map((reply, index) => <div className="reply-card" key={`${post.id}-${index}`}><span className="reply-avatar">↳</span><div><strong>{reply.author}</strong><p>{reply.text}</p></div></div>)}
                <form className="reply-form" onSubmit={(event) => onReply(event, post)}><label className="sr-only" htmlFor={`reply-${post.id}`}>이 글에 답변하기</label><input id={`reply-${post.id}`} value={replyDrafts[post.id] ?? ""} onChange={(event) => onReplyDraft(post.id, event.target.value)} placeholder="따뜻한 답변을 남겨주세요" maxLength={300} /><button type="submit">답변</button></form>
                <div className="post-actions">
                  {post.kind === "도움 요청" && <button onClick={() => onUpdate(post.id, { resolved: !post.resolved })}>{post.resolved ? "다시 도움이 필요해요" : "해결했어요 ✓"}</button>}
                  <button onClick={() => onUpdate(post.id, { reported: true })} disabled={post.reported}>{post.reported ? "운영자가 확인해요" : "신고하기"}</button>
                  {persona === "모임 운영자" && <button className="moderator-action" onClick={() => onUpdate(post.id, { hidden: true })}>숨김 처리</button>}
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="community-aside">
          <form className="write-post-card" onSubmit={onCreate}>
            <div className="write-post-heading"><span className="write-icon">✎</span><div><strong>새 글 남기기</strong><small>함께 배우는 모임에 질문해요</small></div></div>
            <label className="field-label">어떤 도움이 필요하세요?</label>
            <div className="kind-selector">{(["도움 요청", "질문"] as const).map((value) => <button type="button" className={kind === value ? "active" : ""} onClick={() => onKind(value)} key={value}>{value}</button>)}</div>
            <label className="field-label" htmlFor="post-title">제목</label><input id="post-title" value={title} onChange={(event) => onTitle(event.target.value)} placeholder="무엇이 궁금하신가요?" maxLength={80} />
            <label className="field-label" htmlFor="post-body">내용</label><textarea id="post-body" rows={4} value={body} onChange={(event) => onBody(event.target.value)} placeholder="어디까지 해보셨는지 적어주세요." maxLength={500} />
            <div className="post-privacy">ⓘ 데모 글은 다른 방문자에게도 보일 수 있어요.<br />이름이나 전화번호는 적지 마세요.</div>
            <button type="submit" className="primary-button full-button">글 올리기 <span>→</span></button>
          </form>
          <div className="community-values"><strong>우리 모임 약속</strong><p>천천히 설명하기</p><p>서로 존중하며 묻고 답하기</p><p>개인 정보는 나누지 않기</p></div>
        </aside>
      </div>
    </>
  );
}

function ProgressView({
  started,
  completed,
  completionRate,
  posts,
  visible,
  onToggle,
  onStart,
}: {
  started: string[];
  completed: string[];
  completionRate: number;
  posts: Post[];
  visible: boolean;
  onToggle: () => void;
  onStart: (task: Task) => void;
}) {
  const resolved = posts.filter((post) => post.kind === "도움 요청" && post.resolved).length;
  const helpRequestCount = posts.filter((post) => post.kind === "도움 요청").length;
  const helpResolutionRate = helpRequestCount
    ? Math.round((resolved / helpRequestCount) * 100)
    : 0;
  const badges = [
    { title: "첫걸음", description: "첫 과제를 마쳤어요", icon: "✦", earned: completed.length >= 1 },
    { title: "배움 이어가기", description: "서로 다른 과제 3개를 마쳤어요", icon: "✿", earned: new Set(completed).size >= 3 },
  ];
  return (
    <>
      <PageHeading eyebrow="MY LEARNING · 데모 기록" title="나의 배움" description="배운 내용을 돌아보고, 다음에 해볼 과제를 골라요." />
      <div className="progress-controls"><span>진척 배지는 나에게만 보여요</span><button className={`toggle ${visible ? "on" : ""}`} role="switch" aria-checked={visible} onClick={onToggle}><span />{visible ? "배지 보이기" : "배지 숨기기"}</button></div>
      <div className="stats-grid">
        <article className="stat-card"><span className="stat-icon peach">▣</span><small>시작한 과제</small><strong>{started.length}<i>개</i></strong><span className="stat-note">배워보기 시작한 과제</span></article>
        <article className="stat-card"><span className="stat-icon sage">✓</span><small>마친 과제</small><strong>{completed.length}<i>개</i></strong><span className="stat-note">다시 연습해도 기록은 한 번</span></article>
        <article className="stat-card"><span className="stat-icon blue">◷</span><small>과제 완료율</small><strong>{completionRate}<i>%</i></strong><span className="stat-note">마친 과제 ÷ 시작한 과제</span></article>
        <article className="stat-card"><span className="stat-icon lavender">♡</span><small>도움 요청 해결률</small><strong>{helpResolutionRate}<i>%</i></strong><span className="stat-note">{resolved}건 해결 ÷ {helpRequestCount}건 전체</span></article>
      </div>
      <section className="section-block progress-section">
        <div className="section-title-row"><div><div className="eyebrow">MY BADGES</div><h2>나의 작은 성취</h2></div><span className="private-tag">나에게만 보여요</span></div>
        {!visible ? <div className="hidden-badges">배지를 숨겼어요. 과제와 학습 기록은 그대로예요.</div> : <div className="badge-grid">{badges.map((badge) => <article className={`badge-card${badge.earned ? " earned" : ""}`} key={badge.title}><span className="badge-illustration">{badge.earned ? badge.icon : "· · ·"}</span><strong>{badge.title}</strong><p>{badge.description}</p><small>{badge.earned ? "참 잘했어요!" : "과제를 마치면 받을 수 있어요"}</small></article>)}</div>}
      </section>
      <section className="section-block">
        <div className="section-title-row"><div><div className="eyebrow">NEXT STEP</div><h2>다음에 배워볼 과제</h2></div></div>
        <div className="task-grid">{tasks.filter((task) => !completed.includes(task.id)).slice(0, 2).map((task) => <TaskCard key={task.id} task={task} done={false} onClick={() => onStart(task)} />)}</div>
      </section>
      <div className="demo-metrics-note"><span>ⓘ</span> 여기에 보이는 수치는 이 브라우저에서 만든 체험 기록이에요. 실제 청도 주민의 활동이나 성과를 나타내지 않아요.</div>
      <div className="demo-metrics-note group-progress-note"><span>ⓘ</span> 모임 공동 진척은 서로 다른 참여자 3명 이상이 확인될 때만 보여요. 이 체험 화면은 참여자를 구분하지 않아 모임 진척을 표시하지 않아요.</div>
    </>
  );
}

export default App;
