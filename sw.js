/* 极巨大冒险计数器 · Service Worker
 * 策略：
 *   - 页面导航：网络优先，失败回退缓存（离线可开）
 *   - 静态资源：缓存优先 + 后台更新（stale-while-revalidate）
 *   - 宝可梦图标（raw.githubusercontent.com）：缓存优先，最多缓存一次
 * 改版时把 CACHE 版本号 +1 即可让旧缓存自动清理。
 */

const CACHE = 'dynamax-counter-v5';
const IMG_CACHE = 'dynamax-counter-img-v5';

/* 预缓存清单：存在才缓存，缺文件也不会导致安装失败 */
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(CORE.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () { /* 忽略缺失文件 */ });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE && k !== IMG_CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* 判断是否为本站导航请求 */
function isNavigation(req) {
  return req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept') &&
      req.headers.get('accept').indexOf('text/html') !== -1);
}

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* 1. 宝可梦图标：缓存优先 + 后台更新 */
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(
      caches.open(IMG_CACHE).then(function (cache) {
        return cache.match(req).then(function (hit) {
          const net = fetch(req).then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) {
              cache.put(req, res.clone());
            }
            return res;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  /* 2. 页面导航：网络优先，离线回退缓存 */
  if (isNavigation(req)) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html') || caches.match('./');
        });
      })
    );
    return;
  }

  /* 3. 其它静态资源：缓存优先 + 后台更新 */
  event.respondWith(
    caches.match(req).then(function (hit) {
      const net = fetch(req).then(function (res) {
        if (res && res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});

/* 允许页面主动触发更新 */
self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
