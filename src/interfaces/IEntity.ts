/**
 * TODO: このファイルの正しい置き場所はどこだろう？
 */

/**
 * Entity を表すクラスに実装されるべき機能
 */
export interface IEntity {
  readonly _id: number;
  readonly uuid: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  hasPerpetuated(): boolean;

  /** 論理削除 */
  trash(): void;
  /** 論理削除から復元 */
  untrash(): void;
  /** 論理削除状態か否か */
  hasTrashed(): boolean;
}
