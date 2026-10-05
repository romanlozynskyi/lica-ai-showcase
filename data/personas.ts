export type PersonaId = "leo" | "max" | "mira" | "sophie";

export type Post =
  | { id: string; kind: "portrait"; ago: string; headline: string; caption: string }
  | { id: string; kind: "list"; ago: string; title: string; items: string[]; caption: string }
  | { id: string; kind: "stats"; ago: string; title: string; stats: { value: string; label: string }[]; caption: string }
  | { id: string; kind: "quote"; ago: string; text: string; caption: string }
  | { id: string; kind: "poll"; ago: string; question: string; options: [string, string]; result: [number, number]; caption: string };

export type Persona = {
  id: PersonaId;
  name: string;
  /** Dative form for CTAs: «Написать Максу» */
  nameDative: string;
  handle: string;
  topic: string;
  tags: string[];
  bio: string;
  stats: { value: string; label: string }[];
  theme: {
    /** Sampled from the portrait's seamless backdrop */
    backdrop: string;
    /** Slightly darker tone for borders, chips, scrims */
    deep: string;
    /** Accent that stays legible on the ink data cards */
    onInk: string;
    fg: string;
    muted: string;
    ctaBg: string;
    ctaFg: string;
  };
  hero: { src: string; alt: string; focal: string };
  posts: Post[];
  chat: {
    greeting: string;
    replies: { chip: string; answer: string[] }[];
    handoff: string;
  };
};

const INK = "#111214";

export const personas: Persona[] = [
  {
    id: "leo",
    name: "Лео",
    nameDative: "Лео",
    handle: "leo.builds",
    topic: "Бизнес и технологии",
    tags: ["AI-инструменты", "Стартапы", "Продуктивность"],
    bio: "Разбираю нейросети и стартапы за 60 секунд. Без хайпа — только то, что реально экономит время.",
    stats: [
      { value: "5", label: "постов в неделю" },
      { value: "60 сек", label: "на один разбор" },
      { value: "24/7", label: "в Telegram" },
    ],
    theme: {
      backdrop: "#0644AC",
      deep: "#03358A",
      onInk: "#8FAEFF",
      fg: "#FFFFFF",
      muted: "rgba(255,255,255,0.72)",
      ctaBg: "#FFFFFF",
      ctaFg: INK,
    },
    hero: {
      src: "/personas/leo/hero.png",
      alt: "Лео — мужчина с волнистыми тёмными волосами с проседью, в круглых черепаховых очках и тёмном свитере на синем фоне",
      focal: "47% 36%",
    },
    posts: [
      {
        id: "leo-1",
        kind: "portrait",
        ago: "2 ч",
        headline: "Что я удалил из рабочего стека за месяц",
        caption: "Новая неделя — новый стек. Рассказываю, что оставил, а что удалил без сожалений.",
      },
      {
        id: "leo-2",
        kind: "list",
        ago: "1 д",
        title: "3 нейросети, которые я открываю каждое утро",
        items: [
          "Расшифровка созвонов — минус час рутины",
          "Черновики писем — в 3 раза быстрее",
          "Ресёрч конкурентов — 10 минут вместо дня",
        ],
        caption: "Сохраните, чтобы не потерять. Ссылки — в Telegram.",
      },
      {
        id: "leo-3",
        kind: "stats",
        ago: "3 д",
        title: "Как команда из трёх человек запустила продукт",
        stats: [
          { value: "3", label: "человека в команде" },
          { value: "6 нед", label: "до первой продажи" },
          { value: "0", label: "бюджет на рекламу" },
        ],
        caption: "Разбор кейса: что сработало и почему это можно повторить.",
      },
      {
        id: "leo-4",
        kind: "poll",
        ago: "5 д",
        question: "Что разобрать в следующем видео?",
        options: ["ИИ-агенты для продаж", "Юнит-экономика"],
        result: [64, 36],
        caption: "Голосуйте — сниму то, что победит.",
      },
    ],
    chat: {
      greeting: "Привет! Я Лео. Коротко и по делу: спросите про нейросети, стартапы или продуктивность.",
      replies: [
        {
          chip: "Какую нейросеть взять для работы?",
          answer: [
            "Начните с одной — для текста. Дайте ей неделю на ваши письма и заметки.",
            "Если через неделю она не экономит хотя бы 30 минут в день — меняйте. Подборку под разные профессии держу в Telegram.",
          ],
        },
        {
          chip: "Как не выгореть в стартапе?",
          answer: [
            "Три правила: один главный фокус на неделю, сон не обсуждается, выходной — без рабочих чатов.",
            "Звучит банально, но работает лучше любых лайфхаков.",
          ],
        },
        {
          chip: "Что вы сейчас читаете?",
          answer: ["«Shape Up» от Basecamp — о том, как делать продукт короткими циклами. Перечитываю раз в год."],
        },
      ],
      handoff: "Здесь я отвечаю по сценарию. В Telegram — по-настоящему и на любые вопросы.",
    },
  },
  {
    id: "max",
    name: "Макс",
    nameDative: "Максу",
    handle: "max.outside",
    topic: "Спорт и путешествия",
    tags: ["Трейлраннинг", "Горы", "Походы"],
    bio: "Бегаю по горам и собираю маршруты выходного дня. Снаряжение, тренировки и честно о том, как не сдаться на подъёме.",
    stats: [
      { value: "4", label: "поста в неделю" },
      { value: "40+", label: "маршрутов" },
      { value: "24/7", label: "в Telegram" },
    ],
    theme: {
      backdrop: "#636339",
      deep: "#4E4E2C",
      onInk: "#D3D69A",
      fg: "#FFFFFF",
      muted: "rgba(255,255,255,0.74)",
      ctaBg: "#FFFFFF",
      ctaFg: INK,
    },
    hero: {
      src: "/personas/max/hero.png",
      alt: "Макс — улыбающийся мужчина с короткими чёрными волосами в оранжевой спортивной куртке на оливковом фоне",
      focal: "54% 36%",
    },
    posts: [
      {
        id: "max-1",
        kind: "portrait",
        ago: "4 ч",
        headline: "Сегодня без рекордов. Просто красиво.",
        caption: "Лёгкая пробежка на рассвете — лучшая тренировка недели.",
      },
      {
        id: "max-2",
        kind: "stats",
        ago: "1 д",
        title: "Маршрут недели: горный траверс",
        stats: [
          { value: "42 км", label: "за 3 дня" },
          { value: "+2100 м", label: "набор высоты" },
          { value: "июль", label: "лучший сезон" },
        ],
        caption: "GPX-трек и места для ночёвки — в Telegram.",
      },
      {
        id: "max-3",
        kind: "list",
        ago: "2 д",
        title: "Что взять в первый поход",
        items: [
          "Треккинговые палки — колени скажут спасибо",
          "Мембрану, даже если обещают солнце",
          "Налобный фонарь и запасные батарейки",
          "Термос. Всегда термос",
        ],
        caption: "Минимальный список, с которым не страшно.",
      },
      {
        id: "max-4",
        kind: "poll",
        ago: "4 д",
        question: "Куда едем в следующий раз?",
        options: ["К морю и скалам", "В снежные горы"],
        result: [58, 42],
        caption: "Решаем вместе — маршрут выложу после голосования.",
      },
    ],
    chat: {
      greeting: "Привет! 🏔 Я Макс. Спрашивай про бег, горы и походы — отвечу как есть.",
      replies: [
        {
          chip: "С чего начать бегать?",
          answer: [
            "Не с 10 км 🙂 Чередуй: минута бега, две минуты шага. 20 минут три раза в неделю.",
            "Через месяц сам захочешь больше. Главное — не геройствовать в первую неделю.",
          ],
        },
        {
          chip: "Как выбрать первый маршрут?",
          answer: [
            "Кольцевой, до 15 км и с понятной тропой. Так всегда можно вернуться, если что-то пошло не так.",
            "Подборку маршрутов по уровню сложности держу в Telegram.",
          ],
        },
        {
          chip: "Что взять в первый поход?",
          answer: ["Разношенную обувь, мембрану, фонарь и термос. Остальное можно взять напрокат."],
        },
      ],
      handoff: "Это демо-диалог. В Telegram скину маршруты с GPX-треками и отвечу лично.",
    },
  },
  {
    id: "mira",
    name: "Мира",
    nameDative: "Мире",
    handle: "mira.archive",
    topic: "Мода и стиль",
    tags: ["Винтаж", "Стайлинг", "Архивная мода"],
    bio: "Собираю образы из винтажа и архивных вещей. Стиль — это не бюджет, а насмотренность.",
    stats: [
      { value: "5", label: "постов в неделю" },
      { value: "1 → 3", label: "образа из вещи" },
      { value: "24/7", label: "в Telegram" },
    ],
    theme: {
      backdrop: "#AB9BDA",
      deep: "#9483C9",
      onInk: "#AB9BDA",
      fg: INK,
      muted: "rgba(17,18,20,0.66)",
      ctaBg: INK,
      ctaFg: "#FFFFFF",
    },
    hero: {
      src: "/personas/mira/hero.png",
      alt: "Мира — девушка с гладким чёрным каре и чёлкой, в серебряных серьгах-кольцах и чёрном пиджаке на сиреневом фоне",
      focal: "53% 36%",
    },
    posts: [
      {
        id: "mira-1",
        kind: "portrait",
        ago: "1 ч",
        headline: "Чёрный пиджак — вещь, которую я не отдам",
        caption: "Купила на барахолке за копейки. Ношу пятый сезон подряд.",
      },
      {
        id: "mira-2",
        kind: "quote",
        ago: "1 д",
        text: "Мода меняется каждый сезон. Силуэт — нет.",
        caption: "Найдите свой — и всё остальное станет проще.",
      },
      {
        id: "mira-3",
        kind: "list",
        ago: "3 д",
        title: "Капсула из пяти вещей",
        items: ["Пиджак оверсайз", "Две белые майки", "Прямые брюки", "Лоферы", "Серебро — всегда"],
        caption: "Семь образов на неделю из пяти вещей. Схема — в Telegram.",
      },
      {
        id: "mira-4",
        kind: "poll",
        ago: "6 д",
        question: "Серебро или золото?",
        options: ["Серебро", "Золото"],
        result: [71, 29],
        caption: "Мой ответ вы знаете.",
      },
    ],
    chat: {
      greeting: "Привет. Я Мира. Соберу образ, подскажу, где искать винтаж, или честно скажу, что не так с гардеробом.",
      replies: [
        {
          chip: "Собери мне образ на неделю",
          answer: [
            "Пиджак оверсайз, две белые майки, прямые брюки, лоферы.",
            "Плюс одно серебряное украшение. Хватит на семь разных образов — проверено.",
          ],
        },
        {
          chip: "Где искать винтаж?",
          answer: [
            "Секонды в день завоза, блошиные рынки по выходным и онлайн-барахолки с фильтром по брендам.",
            "Список проверенных мест держу в Telegram.",
          ],
        },
        {
          chip: "Что сейчас в моде?",
          answer: ["Честно? Неважно. Найди свой силуэт — и будешь выглядеть дорого в любом сезоне."],
        },
      ],
      handoff: "Дальше — в Telegram. Пришли фото гардероба, разберём вместе.",
    },
  },
  {
    id: "sophie",
    name: "Софи",
    nameDative: "Софи",
    handle: "sophie.slow",
    topic: "Лайфстайл",
    tags: ["Slow living", "Рецепты", "Дом"],
    bio: "Медленная жизнь в большом городе: завтраки, утренние ритуалы и дом, в который хочется возвращаться.",
    stats: [
      { value: "4", label: "поста в неделю" },
      { value: "30+", label: "рецептов" },
      { value: "24/7", label: "в Telegram" },
    ],
    theme: {
      backdrop: "#F4CB6F",
      deep: "#E3B556",
      onInk: "#F4CB6F",
      fg: INK,
      muted: "rgba(17,18,20,0.66)",
      ctaBg: INK,
      ctaFg: "#FFFFFF",
    },
    hero: {
      src: "/personas/sophie/hero.png",
      alt: "Софи — улыбающаяся девушка с длинными кудрявыми медными волосами и веснушками, в кремовом вязаном свитере на жёлтом фоне",
      focal: "52% 30%",
    },
    posts: [
      {
        id: "sophie-1",
        kind: "portrait",
        ago: "3 ч",
        headline: "Утро начинается не с телефона",
        caption: "Проверила на себе за 30 дней. Рассказываю, что изменилось.",
      },
      {
        id: "sophie-2",
        kind: "list",
        ago: "1 д",
        title: "Завтрак за 10 минут",
        items: ["Тост на закваске", "Мягкое масло и щепотка соли", "Яйцо пашот", "Горсть ягод"],
        caption: "Простой, тёплый и без спешки. Рецепт пашот — в Telegram.",
      },
      {
        id: "sophie-3",
        kind: "quote",
        ago: "2 д",
        text: "Дом — это не интерьер. Это то, как ты в нём себя чувствуешь.",
        caption: "Мысль, с которой я начала эту неделю.",
      },
      {
        id: "sophie-4",
        kind: "poll",
        ago: "5 д",
        question: "Твоё идеальное утро — это…",
        options: ["Кофе", "Чай"],
        result: [47, 53],
        caption: "Чай пока ведёт. Неожиданно!",
      },
    ],
    chat: {
      greeting: "Привет! Я Софи ☕ Давай про завтраки, утро без спешки и уют дома.",
      replies: [
        {
          chip: "Посоветуй простой завтрак",
          answer: [
            "Тост на закваске, мягкое масло, щепотка соли и яйцо пашот. Десять минут — и утро уже лучше.",
            "Если хочется сладкого — тот же тост с рикоттой и мёдом.",
          ],
        },
        {
          chip: "Как начать утро без телефона?",
          answer: [
            "Положи его вечером в другую комнату и поставь обычный будильник.",
            "Первые полчаса — вода, открытое окно и завтрак. Через неделю не захочешь обратно.",
          ],
        },
        {
          chip: "Твой любимый рецепт хлеба?",
          answer: ["Простая закваска: мука, вода, соль и терпение. Пошаговый рецепт с фото — в Telegram."],
        },
      ],
      handoff: "Остальное — в Telegram. Там рецепты целиком, и я на связи каждый день.",
    },
  },
];

export const personaById = Object.fromEntries(personas.map((p) => [p.id, p])) as Record<PersonaId, Persona>;

export const isPersonaId = (v: string): v is PersonaId => v in personaById;

/** Stories = every post plus the closing "continue in Telegram" slide */
export const storyCount = (p: Persona) => p.posts.length + 1;
