# ff/utils

提供常用的 `utils` 工具方法，欢迎`PR`。

## Type Checker

```JavaScript
/**
 * @utils
 * @desc types check
 */
export const isString: boolean = str: any => typeof str === 'string';
export const isNumber: boolean = str: any => typeof str === 'number';
export const isBoolean: boolean = str: any => typeof str === 'boolean'
export const isFunction: boolean = fn: any => typeof fn === 'function';
export const isObject: boolean = obj: any => obj && typeof obj === 'object';  // if be passed object is an array, It will return `true`.
export const isUndefined: boolean = any: any => typeof any === undefined || any === undefined;
export const isArray: boolean = arr: any* => Array.isArray(arr) || Object.prototype.toString.call(arr) === '[object Array]';
// new features
export const isPlainObject: boolean = any: any => ();
export const isUrl: boolean = any: any => ();
export const isPhoneNumber: boolean = any: any => ();
```

## Helpers
```JavaScript
/**
 * @utils
 * @desc helpers
 */

/**
 * hasProp
 * @desc 检测对象是否存在改属性
 * @param {Object} obj
 * @param {String} key
 * @param {Boolean} own
 * @returns {Boolean}
 */
export const hasProp = function (obj, key, own) {
  return isObject(obj) && own ? obj.hasOwnProperty(key) : !isUndefined(obj[key])
}

/**
 * when
 * @desc when `fulfilled` so do the next by `then`
 * @param {any*} value
 * @param {Function} fulfilled
 * @param {Function} rejected
 */
export const when = function (value, fulfilled, rejected) {
  var promise = Promise.resolve(value);

  if (arguments.length < 2) {
    return promise;
  }

  return promise.then(fulfilled, rejected);
}

/**
 * inArray
 * @desc To check one `item` in an `array` or not
 * @param {Array} array
 * @param {any*} item
 */
export const inArray = function (array, item) {
  return isArray(array) ? array.includes && array.includes(item) || ~array.indexOf(item) : null
}

/**
 * toArray
 * @desc Make the `arguments` to be an real array
 */
export const toArray = function () {
  return [].slice.call(arguments)
}

/**
 * capitalize
 * @param {String} str
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * before 将函数合并执行，beforeFn先执行，originalFn后执行
 * @author VuChan
 * @param {*} beforeFn 先执行执行的函数
 * @param {*} originalFn 原函数
 * @param {*} context 上下文this
 * @return any*
 */
export const before = function (originalFn, beforeFn, context) {
  return function () {
    if (beforeFn.apply(context, arguments) === false) return false
    return originalFn.apply(context, arguments)
  }
}

/**
 * after 将函数合并执行，originalFn先执行，afterFn后执行
 * @author VuChan
 * @param {*} originalFn 原函数
 * @param {*} afterFn 之后执行的函数
 * @param {*} context 上下文this
 * @return any*
 */
export const after = function(originalFn, afterFn, context) {
  return function () {
    let ret = originalFn.apply(context, arguments)
    if (ret === false) return false
    return afterFn.apply(context, arguments)
  }
}

/**
 * @desc 生成指定范围内随机数 int/float [start, end]
 * @author VuChan
 * @param {Number}  start
 * @param {Number}  end
 * @param {Boolean} int
 * @return {Number}
 */
export const geneRandomRange = (start, end, int = true) => {
  if (start !== undefined && typeof +start === 'number') {
    let val = end !== undefined && typeof +end === 'number'
      ? Math.random() * (end - start + 1) + start
      : Math.random() * start + 1;

    return int ? parseInt(val, 10) : val;
  }
}

/**
 * delay 基于Promise的延时调用
 * @author VuChan
 * @param  {Function|Object|Number} fnOrObj
 * @param  {Number} ms=1000
 * @return {Promise}
 */
export function delay(fnOrObj = 1000, ms = 1000) {
  if (typeof fnOrObj === 'number') {
    ms = fnOrObj;
    fnOrObj = null;
  }

  return new Promise((resolve) => {
    const timerId = setTimeout(() => {
      clearTimeout(timerId);
      return resolve(typeof fnOrObj === 'function' ? fnOrObj() : fnOrObj);
    }, ms);
  });
}

/**
 * 返回所有数中绝对值最大的数（忽略符号）
 * @author VuChan
 * @param  {Number} args
 * @return {Number}
 * @example
 *  getMaxAbsOriVal(-10, 11, -12, 9) // -12
 *  getMaxAbsOriVal(-10.13, 10.12) // -10.13
 */
export const getMaxValIgnoreSign = (...args) => {
  return args.find(t => Math.abs(t) === args.map(t => Math.abs(+t) || 0).sort((a, b) => b - a)[ 0 ] && t);
}

/**
 * @author Vuchan
 * @desc Combine all arguments to be a className String.
 * @param {Object} any*
 * @example
 *  classNames({ a: 1, b: 0, c: 'c' })
 *  // "a c"
 *  classNames('a', 'b', 'c', { d: 1, e: 0 })
 *  // "a b c d"
 *  classNames('a', 'b', 'c', { d: 1, e: 0 }, {f: 'e'})
 *  // "a b c d f"
 *  classNames('a', 'b', 'c', { d: 1, e: 0 }, {f: 'e'}, ['g', 'h', {'i': '1', 'j': false }])
 *  // "a b c d f g h i"
 *
 * @return {String} classnames string
 */
export const classNames = (...args) => {
  return args.map(t => {
    if (Array.isArray(t)) {
      return t.map(i => classNames(i)).join(' ')
    } else if (typeof t === 'object') {
      return Object.keys(t).filter(k => t[k]).join(' ')
    } else {
      return typeof t !== 'string' ? t.toString() : t
    }
  }).join(' ')
}

/**
 * loadScript
 * @desc lazy load script form a url
 * @param {String} url
 * @return {Promise}
 */
export const loadScript = function(url) {
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	document.body.appendChild(script);

  return new Promise((resolve) => {
    if (script.readyState) { // IE
      script.onreadystatechange = function change() {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          resolve();
        }
      };
    } else { // Others
      script.onload = function load() {
        resolve();
      };
    }
  });
}

/**
 * checkPropsValue
 * @param {Object} obj
 * @param {String} msg
 * @throws Error
 * @return {Boolean}
 */
export const checkPropsValue = (obj, msg) => {
  return Object.keys(obj).reduce((status, key) => {
    if (!obj[key] && obj[key] !== 0) {
      const error = new Error(msg || `${key}'s value is required but it's ${obj[key]}!`);
      error.errorKey = key;

      throw error;
    } else {
      status = true;
      return status;
    }
  }, true);
};

/**
 * getQueryString
 * @author VuChan
 * @desc  生成链接后面选项参数
 * @param   {String}  url
 * @param   {Object}  Options
 * @return  {Object | null}
 * @design 穷举法:
 *  0. a.com? | a.com?& | a.com?&=&1=2&&
 *  1. a.com?a=1&b=2&c=&d=3
 *  2. a.com?a=1&b=2&c=&d=3/#/hash
 *  3. a.com/#/hash?a=1&b=2&c=&d=3
 *  4. http://mcar.ff.cn/uploading.html/#/?shopId=5&orderId=231&loanOrderId=59&orderAmount=64900.00&period=36&downPayRate=0.1
 *  5. http://mcar.ff.cn/uploading.html?shopId=5&orderId=231&loanOrderId=59&orderAmount=64900.00&period=36&downPayRate=0.1/#/
 *  6. http://devwc.ff.cn/BindingMobileNumber.html?redirect_url=http%3A%2F%2Fdevwc.ff.cn%2Factivity%2Fshake.html%3FmktId%3D201805070000008%26subType%3D103
 * @requires
 *  1. 减去 hash 符号提取正常的 url
 *  2. 仅提取正确queryString
 *  3. 如果是 number 则需要转化成 number
 * @example
    getQueryString = (
      url = window.location.href,
      options = {
        cutHash: true, // replace hash `/#/{path}` to be ''
        decoder: decodeURIComponent, // self decoder or browser's
        decodeEach: false,  // decode each one of url component
        all: true, // need all value whatever it is valid or not
        encode: false, // if u need? `false | encodeURLComponent | function`
        placeholder: '', // if value is invalid, so puts the `placeholder`
      },
    )
 */

```


## Helper classes


### Observer

提供观察订阅者模式 `Observer` 的实现。

```JavaScript
import Observer from 'ff/utils/helpers/Obersver'
const EventStore = new Observer()

function logs(...args) {
  console.log('loaded', args)
}

EventStore.on('loaded', logs) // {loaded: [logs: func]}
EventStore.trigger('loaded', 1, 2, 3, 4, 5) // 'loaded', [1, 2, 3, 4, 5]
EventStore.off('loaded', logs) // true
```


### Cookie

提供操作 `Cookie` 的单例实现。

> PS：对于 Server `setCookie`后的 Cookie 如果带有 **`HttpOnly;`** 属性，前端是无法通过 `document.cookie` 获取和操作的。

```JavaScript
import Cookie, { getCookie, setCookie } from 'ff/utils/helpers/Cookie'

console.log(Cookie.all),;
console.log(Cookie.get('ff'), getCookie('ff'))
console.log(Cookie.get('ff', 'woooo~~'), setCookit('ff', 'woooo~~'))
```


### Queue

提供常用数据结构 `Queue` 的实现。

```JavaScript
import Queue from 'ff/utils/helpers/Queue';

Queue.debug = true; // open debug model, log Queue `in` & `out` item.

const queue = new Queue([1, 2, 3])  // Initialize queue

queue.out(1); // Deletes specially one
queue.out();  // Queue out
```
