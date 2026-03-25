// ========== 数据管理 ==========
// 优先读取 localStorage（本地预览），其次读取 config.js（线上发布），最后使用默认数据
function loadData() {
    // 1. 本地预览：如果刚在 admin.html 保存过，会有 localStorage
    try {
        const raw = localStorage.getItem('siteData');
        if (raw) return JSON.parse(raw);
    } catch (e) {}

    // 2. 线上访问：读取 config.js 导出的 window.SITE_DATA
    if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA !== null) {
        return window.SITE_DATA;
    }
    
    // 3. 兜底数据
    return {
        profile: {
            name: '你的名字',
            bio: '这是一个热爱编程和设计的开发者，欢迎来到我的个人主页！',
            avatar: '',
            links: [
                { label: 'GitHub', url: 'https://github.com/' },
                { label: '我的博客', url: '#' }
            ]
        },
        works: [
            {
                title: '示例作品：个人主页',
                desc: '这是我的第一个个人主页项目，使用了 HTML、CSS 和 JavaScript 构建，包含响应式设计和炫酷的粒子特效。',
                link: '#',
                date: '2026-03-25',
                tags: ['HTML', 'CSS', 'JS']
            },
            {
                title: '示例作品：天气应用',
                desc: '一个调用第三方 API 获取实时天气的 Web 应用。',
                link: '#',
                date: '2026-02-10',
                tags: ['API', '前端']
            }
        ],
        notes: [
            {
                title: '我的第一篇博客',
                desc: '今天我建立了自己的个人主页，非常开心！接下来我会在这里分享我的学习笔记和技术心得。',
                link: '#',
                date: '2026-03-25',
                tags: ['生活', '随笔']
            },
            {
                title: '前端学习路线分享',
                desc: '整理了一些适合新手的 HTML/CSS/JS 学习资源和踩坑记录。',
                link: '#',
                date: '2026-03-20',
                tags: ['前端', '学习']
            }
        ]
    };
}

// ========== 渲染个人信息 ==========
function renderProfile(data) {
    if (!data || !data.profile) return;
    const p = data.profile;

    if (p.name) document.getElementById('myName').textContent = p.name;
    if (p.bio) document.getElementById('myBio').textContent = p.bio;
    
    // 如果没有上传自定义头像，则默认使用本地的高清二次元头像
    const avatarUrl = p.avatar || 'avatar.jpg';
    const el = document.getElementById('avatar');
    if (el) el.innerHTML = '<img src="' + avatarUrl + '" alt="头像" style="width:100%; height:100%; object-fit:cover;">';

    const linksEl = document.getElementById('socialLinks');
    if (linksEl && p.links && p.links.length) {
        linksEl.innerHTML = p.links.map(l =>
            '<a class="social-link" href="' + l.url + '" target="_blank">' + l.label + '</a>'
        ).join('');
    }
}

// ========== 渲染卡片 ==========
function renderCards(items, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid || !items || !items.length) return;

    grid.innerHTML = items.map(item => {
        let html = '<div class="card fade-in">';
        if (item.date) html += '<div class="card-date">' + item.date + '</div>';
        if (item.title) html += '<h3>' + item.title + '</h3>';
        if (item.desc) html += '<p>' + item.desc + '</p>';
        if (item.link) html += '<a class="card-link" href="' + item.link + '" target="_blank">查看 →</a>';
        if (item.tags && item.tags.length) {
            html += '<div class="card-tags">' +
                item.tags.map(t => '<span class="card-tag">' + t + '</span>').join('') +
                '</div>';
        }
        html += '</div>';
        return html;
    }).join('');

    // 滚动渐入
    setTimeout(() => {
        grid.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }, 50);
}

// ========== 粒子背景 ==========
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    // 使用新的主题色（粉、紫、蓝、白）
    const colors = ['#ff758f', '#845ef7', '#3bc9db', '#ffffff'];

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 5 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.cssText =
            'width:' + size + 'px;height:' + size + 'px;' +
            'left:' + (Math.random() * 100) + '%;' +
            'background:' + color + ';' +
            'box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';' +
            'animation-duration:' + (Math.random() * 8 + 6) + 's;' +
            'animation-delay:' + (Math.random() * 10) + 's;';
        container.appendChild(p);
    }
}

// ========== 鼠标粒子拖尾 ==========
function setupCursorParticles() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    // 每次移动生成多个粒子，制造夸张拖尾
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        for (let i = 0; i < 3; i++) {
            particles.push({
                x: mouse.x + (Math.random() - 0.5) * 15, 
                y: mouse.y + (Math.random() - 0.5) * 15,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 + 1, // 轻微下落感
                life: 1,
                size: Math.random() * 6 + 2,
                color: ['#ff758f', '#845ef7', '#3bc9db', '#ffffff'][Math.floor(Math.random() * 4)]
            });
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.015; // 寿命更长，拖尾更远
            p.size *= 0.96; // 逐渐变小
            
            if (p.life <= 0 || p.size <= 0.5) { 
                particles.splice(i, 1); 
                continue; 
            }
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 15; // 发光效果
            ctx.shadowColor = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // 重置发光，避免影响其他绘制
        requestAnimationFrame(animate);
    }
    animate();
}

// ========== 导航 ==========
function setupNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => links.classList.toggle('active'));
    links.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => links.classList.remove('active'))
    );
}

// ========== 滚动渐入 ==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.15 });

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    const data = loadData();
    if (data) {
        renderProfile(data);
        renderCards(data.works, 'worksGrid');
        renderCards(data.notes, 'notesGrid');
    }

    createParticles();
    setupCursorParticles();
    setupNav();

    document.querySelectorAll('.card, .section').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});
