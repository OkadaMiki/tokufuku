// src/constants/categories.ts

// 子カテゴリ側の「その他」を判定するためのラベル（表示テキストそのまま）
export const OTHER_CHILD_LABEL = 'その他' as const;

// とくつみ（徳）カテゴリ
export const TOKU_CATEGORIES = [
  {
    key: 'toku_01',
    label: '思いやり系',
    exp: 30,
    children: [
      { key: 'toku_01_01', label: '困っている人を助けた' },
      { key: 'toku_01_02', label: '人を励ました' },
      { key: 'toku_01_03', label: '愚痴に付き合った' },
      { key: 'toku_01_other', label: 'その他' },
    ],
  },
  {
    key: 'toku_02',
    label: '許し系',
    exp: 30,
    children: [
      { key: 'toku_02_01', label: '遅刻を受け入れた' },
      { key: 'toku_02_02', label: 'ミスを許した' },
      { key: 'toku_02_03', label: '眠る人に肩を貸す' },
      { key: 'toku_02_other', label: 'その他' },
    ],
  },
  {
    key: 'toku_03',
    label: 'マナー系',
    exp: 30,
    children: [
      { key: 'toku_03_01', label: '人のゴミを捨てた' },
      { key: 'toku_03_02', label: '使った所を綺麗に' },
      { key: 'toku_03_03', label: '落とし物を届けた' },
      { key: 'toku_03_other', label: 'その他' },
    ],
  },
  {
    key: 'toku_04',
    label: '金銭系',
    exp: 30,
    children: [
      { key: 'toku_04_01', label: '奢った' },
      { key: 'toku_04_02', label: '立て替えた' },
      { key: 'toku_04_03', label: '募金した' },
      { key: 'toku_04_other', label: 'その他' },
    ],
  },
  {
    key: 'toku_05',
    label: '譲る・あげる系',
    exp: 30,
    children: [
      { key: 'toku_05_01', label: '席や列を譲った' },
      { key: 'toku_05_02', label: 'ものを貸した' },
      { key: 'toku_05_03', label: 'お菓子をあげた' },
      { key: 'toku_05_other', label: 'その他' },
    ],
  },
  {
    key: 'toku_06',
    label: 'サポート系',
    exp: 30,
    children: [
      { key: 'toku_06_01', label: '力仕事を請け負う' },
      { key: 'toku_06_02', label: '代役を請け負う' },
      { key: 'toku_06_03', label: 'お手伝いをした' },
      { key: 'toku_06_other', label: 'その他' },
    ],
  },
] as const;

// いいことカテゴリ
export const GOOD_CATEGORIES = [
  {
    key: 'good_01',
    label: 'ラッキー・流れが良かった系',
    exp: 20,
    children: [
      { key: 'good_01_01', label: '当たりが出た' },
      { key: 'good_01_02', label: '並ばずにすんだ' },
      { key: 'good_01_03', label: '探しものが解決' },
      { key: 'good_01_other', label: 'その他' },
    ],
  },
  {
    key: 'good_02',
    label: '自然・環境のごほうび系',
    exp: 20,
    children: [
      { key: 'good_02_01', label: '景色が綺麗だった' },
      { key: 'good_02_02', label: '空がきれいだった' },
      { key: 'good_02_03', label: '天気がいい感じ' },
      { key: 'good_02_other', label: 'その他' },
    ],
  },
  {
    key: 'good_03',
    label: '人からの優しさ・反応系',
    exp: 20,
    children: [
      { key: 'good_03_01', label: '人から感謝された' },
      { key: 'good_03_02', label: '助けてもらった' },
      { key: 'good_03_03', label: '人から褒められた' },
      { key: 'good_03_other', label: 'その他' },
    ],
  },
  {
    key: 'good_04',
    label: 'プレゼント・得した系',
    exp: 20,
    children: [
      { key: 'good_04_01', label: '好きな物を貰った' },
      { key: 'good_04_02', label: 'お得にゲットした' },
      { key: 'good_04_03', label: 'お菓子をもらった' },
      { key: 'good_04_other', label: 'その他' },
    ],
  },
  {
    key: 'good_05',
    label: '心が軽くなった系',
    exp: 20,
    children: [
      { key: 'good_05_01', label: '悩みが軽くなった' },
      { key: 'good_05_02', label: '前向きになれた' },
      { key: 'good_05_03', label: 'test' },
      { key: 'good_05_other', label: 'その他' },
    ],
  },
  {
    key: 'good_06',
    label: '自己達成・報われた系',
    exp: 20,
    children: [
      { key: 'good_06_01', label: '頑張りが報われたと感じた' },
      { key: 'good_06_02', label: '目標を達成できた' },
      { key: 'good_06_03', label: 'うまくいく流れに乗れた' },
      { key: 'good_06_other', label: 'その他' },
    ],
  },
] as const;


// ===== 型（配列から自動抽出）=====

export type TokuParent = (typeof TOKU_CATEGORIES)[number];
export type GoodParent = (typeof GOOD_CATEGORIES)[number];

export type CategoryParent = TokuParent | GoodParent;
export type ParentKey = CategoryParent['key'];

export type TokuChild = TokuParent['children'][number];
export type GoodChild = GoodParent['children'][number];
export type CategoryChild = TokuChild | GoodChild;
export type ChildKey = CategoryChild['key'];

// ===== 便利ユーティリティ =====

export const TOKU_PARENT_BY_KEY = new Map<string, TokuParent>(TOKU_CATEGORIES.map((p) => [p.key, p]));
export const GOOD_PARENT_BY_KEY = new Map<string, GoodParent>(GOOD_CATEGORIES.map((p) => [p.key, p]));

export function getChildrenFrom(parentKey: ParentKey) {
  return TOKU_PARENT_BY_KEY.get(parentKey)?.children
      ?? GOOD_PARENT_BY_KEY.get(parentKey)?.children
      ?? [];
}

export function isOtherChildLabel(label: string) {
  return label === OTHER_CHILD_LABEL;
}
