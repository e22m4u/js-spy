/**
 * Тип любой функции.
 */
export type AnyCallable = (...args: any[]) => any;

/**
 * Конструктор любой ошибки.
 */
export type AnyErrorCtor = (new (...args: any[]) => Error);

/**
 * Ключ любого метода в объекте.
 * Должен быть ключом `TObj`, значение
 * которого является функцией.
 */
export type MethodKey<TObj extends object> = {
  [P in keyof TObj]: TObj[P] extends AnyCallable ? P : never
}[keyof TObj];
