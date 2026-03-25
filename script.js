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
    if (p.bio) {
        // 将换行符 \n 替换为 HTML 的 <br> 标签，从而支持多行显示
        document.getElementById('myBio').innerHTML = p.bio.replace(/\n/g, '<br>');
    }
    
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

    grid.innerHTML = items.map((item, index) => {
        let html = '<div class="card fade-in">';
        if (item.date) html += '<div class="card-date">' + item.date + '</div>';
        if (item.title) html += '<h3>' + item.title + '</h3>';
        if (item.desc) html += '<p>' + item.desc + '</p>';
        
        // 判断如果是笔记，则跳转到新的 note.html 并带上 id 参数；如果是作品则按原样处理
        if (containerId === 'notesGrid') {
            html += '<a class="card-link" href="note.html?id=' + index + '">阅读全文 →</a>';
        } else if (item.link) {
            html += '<a class="card-link" href="' + item.link + '" target="_blank">查看 →</a>';
        }

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

// ========== 弹幕留言逻辑 ==========
let danmakuList = [
    "前排占座！",
    "博主太强了吧！",
    "膜拜大佬~",
    "这界面太好看了",
    "哈基米哈基米",
    "学习了！",
    "二次元浓度过高警告"
];

function initDanmaku() {
    const container = document.getElementById('danmaku-container');
    if (!container) return;
    container.innerHTML = ''; // 清空提示
    
    // 从 localStorage 加载历史留言（真实场景需后端数据库，这里仅做纯前端模拟）
    try {
        const saved = localStorage.getItem('site_danmaku');
        if (saved) {
            danmakuList = danmakuList.concat(JSON.parse(saved));
        }
    } catch(e){}

    // 随机发射初始弹幕
    danmakuList.forEach((text, i) => {
        setTimeout(() => createDanmaku(text), Math.random() * 5000 + i * 800);
    });
}

function createDanmaku(text, isNew = false) {
    const container = document.getElementById('danmaku-container');
    if (!container) return;

    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = (Math.random() * 8 + 14) + 'px';
    el.style.fontWeight = 'bold';
    el.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    
    // 如果是新发送的弹幕，加上方框高亮
    if (isNew) {
        el.style.border = '2px solid var(--accent)';
        el.style.padding = '4px 10px';
        el.style.borderRadius = '8px';
        el.style.backgroundColor = 'rgba(255, 117, 143, 0.2)';
        el.style.zIndex = '10'; // 保证新弹幕在最上层
    }
    
    // 随机好看的颜色
    const colors = ['#ff758f', '#845ef7', '#3bc9db', '#fcc419', '#51cf66', '#ff922b', '#ffffff'];
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    // 随机高度 (10% 到 85%)
    el.style.top = (Math.random() * 75 + 10) + '%';
    // 初始位置在最右侧外面
    el.style.left = '100%';
    
    container.appendChild(el);

    // 降低动画速度，让弹幕更平滑、更慢
    const speed = Math.random() * 0.8 + 0.5; // 之前是 3~5，现在调慢到 0.5~1.3
    let pos = 100;
    
    function move() {
        pos -= speed / 5; // 之前除以10，现在微调移动步长
        el.style.left = pos + '%';
        if (pos < -50) { // 移出屏幕左侧后销毁
            el.remove();
            // 循环发射（新发的弹幕不需要循环发射，避免满屏都是框框）
            if (!isNew) {
                setTimeout(() => createDanmaku(text), Math.random() * 8000 + 3000);
            }
        } else {
            requestAnimationFrame(move);
        }
    }
    move();
}

// 确保函数暴露在全局作用域，以便 HTML 中的 onclick="sendDanmaku()" 能够调用
window.sendDanmaku = function() {
    const input = document.getElementById('danmakuInput');
    const text = input.value.trim();
    if (!text) return;
    
    // 发射当前这条弹幕，并标记为 isNew = true
    createDanmaku(text, true);
    
    // 保存到列表和本地
    danmakuList.push(text);
    try {
        const saved = JSON.parse(localStorage.getItem('site_danmaku') || '[]');
        saved.push(text);
        localStorage.setItem('site_danmaku', JSON.stringify(saved));
    } catch(e){}
    
    input.value = '';
};

// 监听回车发送
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('danmakuInput');
    if(input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendDanmaku();
        });
    }
});


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
    initDanmaku();

    document.querySelectorAll('.card, .section').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});
