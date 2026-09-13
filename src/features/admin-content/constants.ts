export const blockTypeLabels: Partial<Record<string, string>> = {
  dialog: 'گفت‌وگو',
  image: 'تصویر',
  quiz: 'آزمون',
  story: 'داستان',
  reward: 'جایزه',
  animation: 'انیمیشن',
  video: 'ویدیو',
  drag_drop: 'کشیدن و رها کردن',
  drop_down: 'انتخاب گزینه',
  question_block: 'بلوک سوال',
  film_and_image: 'فیلم و تصویر',
  coin_hunt: 'شکار سکه',
  memory_financial: 'حافظه مالی',
  decision_tree: 'درخت تصمیم',
  basket_game: 'بازی سبد',
};

export const blockPresets: Record<string, unknown> = {
  dialog: {
    character: 'fox',
    text: 'سلام! امروز درباره پول یاد می‌گیریم.',
  },
  image: {
    url: 'lessons/example.png',
    caption: 'توضیح تصویر آموزشی',
  },
  quiz: {
    quizId: 1,
  },
  story: {
    title: 'عنوان داستان',
    text: 'متن داستان را اینجا وارد کنید.',
  },
  reward: {
    xp: 20,
    coins: 5,
    message: 'آفرین! جایزه این مرحله را گرفتی.',
  },
  animation: {
    url: 'animations/example.json',
    caption: 'توضیح انیمیشن',
  },
  video: {
    url: 'videos/example.mp4',
    caption: 'توضیح ویدیو',
  },
  drag_drop: {
    instruction: 'هر گزینه را در جای درست قرار بده.',
    items: [],
    targets: [],
  },
  drop_down: { introduction: '', label: '', options: [] },
  question_block: { introduction: '', label: '', options: [] },
  film_and_image: { introduction: '', videoUrl: '', imageUrl: '' },
  coin_hunt_legacy: {
    title: 'شکار سکه',
    introduction: 'سکه‌های درست را جمع کن!',
    items: [
      { id: 'coin-100', value: 100, collectible: true },
      { id: 'coin-500', value: 500, collectible: true },
    ],
  },
  memory_financial_legacy: {
    title: 'حافظه مالی',
    introduction: 'کارت‌های مرتبط را پیدا کن!',
    pairs: [
      { id: 'saving', cardA: 'پس‌انداز', cardB: 'قرض گرفتن پول' },
      { id: 'loan', cardA: 'وام', cardB: 'قرض گرفتن پول' },
    ],
  },
  coin_hunt: {
    introduction: 'Coin Hunt',
    duration: 60,
    target: { type: 'count', value: 2 },
    scoring: { correct: 10, wrong: -2 },
    items: [
      { id: 'coin-100', value: 100 },
      { id: 'coin-500', value: 500 },
    ],
  },
  memory_financial: {
    introduction: 'Match the pairs',
    pairs: [
      { id: 'saving', first: { type: 'saving' }, second: { type: 'future_goal' } },
      { id: 'loan', first: { type: 'loan' }, second: { type: 'borrowing' } },
    ],
  },
  decision_tree: {
    steps: [
      { id: 'pay-debt', question: 'بدهی داری، اول چی کار می‌کنی؟', choices: ['pay-debt', 'save', 'spend'] },
      { id: 'save', question: 'پول اضافی داری، اولویت بعدی چیه؟', choices: ['pay-debt', 'save', 'spend'] },
      { id: 'spend', question: 'بدهی صاف شد، پس‌انداز هم شد، چی می‌مونه؟', choices: ['pay-debt', 'save', 'spend'] },
    ],
    correctOrder: { steps: ['pay-debt', 'save', 'spend'] },
    lesson: { lesson: 'اول بدهی رو بده، بعد پس‌انداز کن، بعد خرج کن.' },
    scoring: { correct: 10, wrong: -5, maxScore: 30 },
  },
  basket_game: {
    durationSeconds: 60,
    difficulty: {
      spawnIntervalMs: 800,
      fallingSpeed: 180,
      playerSpeed: 300,
      bombChance: 0.25,
    },
    scoring: {
      coinsPerPoint: 3,
      bombTimePenaltySeconds: 5,
    },
  },
};
