// Cloudflare Workers 入口脚本 - 用于 Vue 应用部署

// 静态资源缓存名称
const STATIC_CACHE = "grennn-web-v1";

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request);
    const pathname = url.pathname;

    try {
        // 1. 检查是否是 API 请求
        if (pathname.startsWith('/api')) {
            // 如果是 API 请求，可以转发到后端
            // 注意：需要配置 CORS 和适当的请求处理
            return new Response('API endpoint not configured', { status: 404 });
        }

        // 2. 处理静态资源请求
        // 如果不是根路径且不是明确的文件，返回 index.html（SPA 路由）
        if (pathname !== '/' && !pathname.includes('.') && !pathname.includes('/assets/')) {
            return serveStatic('/index.html');
        }

        // 3. 服务静态资源
        return serveStatic(pathname);
    } catch (error) {
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function serveStatic(path) {
    // 规范化路径
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const filepath = normalizedPath || 'index.html';

    try {
        // 尝试从 dist 目录读取文件
        const response = await fetch(filepath);

        if (!response.ok) {
            // 如果文件不存在，返回 index.html 用于 SPA 路由
            return fetch('index.html');
        }

        // 添加缓存头
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'public, max-age=3600');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
        });
    } catch (error) {
        return new Response('Not Found', { status: 404 });
    }
}
