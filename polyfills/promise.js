/**
 * Refs:
 * @see {@link http://www.ituring.com.cn/article/66566}
 * @see {@link https://mp.weixin.qq.com/s/Yrwe2x6HukfqJZM6HkmRcw}
 */

/**
 * 等待态（Pending）
 * 可以迁移至执行态或拒绝态
 */
/** @typedef {'pending'} Pending*/
const PENDING = "pending";

/**
 * 执行态（Fulfilled）
 * 不能迁移至其他任何状态，必须拥有一个不可变的终值
 */
/** @typedef {'fulfilled'} Fulfilled*/
const FULFILLED = "fulfilled";

/**
 * 拒绝态（Rejected）
 * 不能迁移至其他任何状态，必须拥有一个不可变的据因
 */
/** @typedef {'rejected'} Rejected*/
const REJECTED = "rejected";

/**
 * @typedef {Pending|Fulfilled|Rejected} PromiseStatus
 * @typedef {(value: any) => any} PromiseResolve
 * @typedef {(reason: string|Error) => any} PromiseReject
 * @typedef {{onFulfilled: PromiseResolve, onRejected: PromiseReject, resolve: PromiseResolve, reject: PromiseReject}} PromiseCallback
 */
class FPromise {
  // Promise.all 和 Promise.race
  /**
   * @param {FPromise[]} promises
   */
  static all = function(promises) {};

  /**
   * @param {FPromise[]} promises
   */
  static race = function(promises) {};

  static resolve = function(value) {
    // 返回一个已决议状态 onFulfilled 的 Promise: { status: 'fulfilled', value }
    return new FPromise(resolve => resolve(value));
  };

  static reject = function(reason) {
    // 返回一个已拒绝状态 onRejected 的 Promise: { status: 'rejected', value: reason }
    return new FPromise((_, reject) => reject(reason));
  };

  /**
   * promise 是通过 then 方法去注册 callbacks，其中 onFulfilled callback 处理 value，而 onRejected callback 处理 reason。
   * @constructor
   * @param {(PromiseResolve, PromiseReject) => any} fn
   * @example
   * ```js
   *  p = new FPromise(function handler(resolve, reject) {
   *    setTimeout(() => {
   *      const random = Math.random()
   *      if (random > 0.5) resolve(random)
   *      else reject(0.5)
   *    }, 2000)
   *  })
   *  p.then(console.log)
   *  p.catch(console.error)
   *  p.finally(console.log)
   * ```
   */
  constructor(fn) {
    if (!isFunction(fn)) {
      throw new TypeError(`Promise resolver ${fn} is not a function`);
    }

    this.status = PENDING;
    this.value = undefined;
    this._callbacks = [];

    // 构造 onFulfilled 去切换到 fulfilled 状态
    const onFulfilled = value => _transition(this, FULFILLED, value);
    // 构造 onRejected 去切换到 rejected 状态
    const onRejected = reason => _transition(this, REJECTED, reason);

    // 构造 resolve 和 reject 函数，在 resolve 函数里，通过 resolvePromise 对 value 进行验证
    // 配合 ignore 这个 flag，保证 resolve/reject 只有一次调用作用
    let ignore = false;

    const resolve = value => {
      if (ignore) return;
      ignore = true;
      resolvePromise(this, value, onFulfilled, onRejected);
    };
    const reject = reason => {
      if (ignore) return;
      ignore = true;
      onRejected(reason);
    };

    try {
      fn(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * thenable
   * promise.then(onFulfilled, onRejected)
   * 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：[[Resolve]](promise2, x)
   * 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
   * 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
   * 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因
   * @param {(value: any) => any} onFulfilled
   * @param {(reason: string|Error) => Error} [onRejected]
   * @returns {FPromise} then 方法必须返回一个 promise 对象 注3
   */
  then(onFulfilled, onRejected) {
    return new FPromise((resolve, reject) => {
      let callback = { onFulfilled, onRejected, resolve, reject };

      if (this.status === PENDING) {
        this._callbacks.push(callback);
      } else {
        // @ts-ignore
        setTimeout(() => handleCallback(callback, this.status, this.value), 0);
      }
    });
  }

  /**
   * catch
   * @param {PromiseReject} onRejected
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(function() {
      isFunction(callback) && callback();
    }).catch(function() {
      isFunction(callback) && callback();
    });
  }
}

/**
 * 对单个 promise 进行状态迁移，它只会在 state 为 pending 时，进行状态迁移。
 * 当状态变更时，异步清空所有 callbacks
 * @param {FPromise} promise
 * @param {PromiseStatus} status
 * @param {*} result
 */
function _transition(promise, status, result) {
  if (promise.status !== PENDING) return;
  promise.status = status;
  promise.value = result;
  setTimeout(() => handleCallbacks(promise._callbacks, status, result), 0);
}

/**
 * 处理所有回调
 * @param {PromiseCallback[]} callbacks
 * @param {PromiseStatus} status
 * @param {*} result
 */
function handleCallbacks(callbacks, status, result) {
  while (callbacks.length) {
    handleCallback(callbacks.shift(), status, result);
  }
}

/**
 * 在当前 promise 和下一个 promise 之间进行状态传递
 * @param {PromiseCallback} callback
 * @param {PromiseStatus} status
 * @param {*} result
 */
function handleCallback(callback, status, result) {
  let { onFulfilled, onRejected, resolve, reject } = callback;

  try {
    if (status === FULFILLED) {
      isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result);
    } else if (status === REJECTED) {
      isFunction(onRejected) ? resolve(onRejected(result)) : reject(result);
    }
  } catch (error) {
    reject(error);
  }
}

/**
 * @description 对特殊的 result 进行特殊处理
 *  + 第一个判断 result 是不是 promise 本身，是就抛 TypeError 错误。
 *  + 第二个判断 result 是不是 promise 类型，是就调用 then(resolve, reject) 取它的 value 或 reason。
 *  + 第三个判断 result 是不是 thenable 对象，是就先取出 then，再用 new Promise 去进入 The Promise Resolution Procedure 过程。
 *  + 若都不是，则直接 resolve result。
 * @param {FPromise} promise
 * @param {*} result
 * @param {PromiseResolve} resolve
 * @param {PromiseReject} reject
 */
function resolvePromise(promise, result, resolve, reject) {
  if (result === promise) {
    return reject(new TypeError("Can not fulfill promise with itself"));
  }

  if (isPromise(result)) {
    return result.then(resolve, reject);
  }

  if (isThenable(result)) {
    try {
      return new Promise(result.then.bind(result)).then(resolve, reject);
    } catch (error) {
      return reject(error);
    }
  }

  resolve(result);
}

function isFunction(fn) {
  return typeof fn === "function";
}

function isThenable(p) {
  return p.then && isFunction(p.then);
}

function isPromise(p) {
  return p.constructor === FPromise;
}
