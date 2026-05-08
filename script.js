// ============================================
// 📱 智能手机选购助手 — 核心逻辑
// ============================================

let phones = [];
let selectedBrands = new Set();
let selectedScreen = null;
let selectedCpu = new Set();
let selectedTags = new Set();
let currentSort = 'newest';
let searchQuery = '';
let expandedCards = new Set();

// ===== 配置 =====
const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","天玑9500","麒麟9030","麒麟9020","天玑9400","麒麟9010s","A19","A18"];
const featureTags = ["潜望长焦","6500mAh+","≤200g","防水","NFC","红外","USB3.0","无线充电","散热风扇"];
const tagDisplayNames = {"6500mAh+":"6500mAh+","≤200g":"≤200g"};
const screenTypes = ['直屏','折叠屏'];
const brandList = ["苹果","华为","小米","OPPO","vivo","三星","HONOR","REDMI","iQOO","一加","真我","红魔"];

// ===== 数据加载 =====
async function loadData() {
    try {
        const resp = await fetch('data/phones.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        phones = await resp.json();
        // 从 URL hash 恢复筛选状态
        restoreStateFromHash();
        init();
    } catch (err) {
        document.getElementById('phoneGrid').innerHTML =
            `<div class="error-msg"><div class="emoji">😢</div><p>数据加载失败：${err.message}</p><p style="margin-top:8px;font-size:.85rem">请检查网络连接或刷新页面重试</p></div>`;
    }
}

// ===== URL Hash 状态管理 =====
function updateHash() {
    const params = new URLSearchParams();
    if (selectedBrands.size > 0) params.set('brands', [...selectedBrands].join(','));
    if (selectedScreen) params.set('screen', selectedScreen);
    if (selectedCpu.size > 0) params.set('cpu', [...selectedCpu].join(','));
    if (selectedTags.size > 0) params.set('tags', [...selectedTags].join(','));
    if (currentSort !== 'newest') params.set('sort', currentSort);
    if (searchQuery) params.set('q', searchQuery);
    const hash = params.toString();
    history.replaceState(null, '', hash ? `#${hash}` : location.pathname);
}

function restoreStateFromHash() {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const brands = params.get('brands');
    if (brands) brands.split(',').forEach(b => selectedBrands.add(b));
    selectedScreen = params.get('screen') || null;
    const cpu = params.get('cpu');
    if (cpu) cpu.split(',').forEach(c => selectedCpu.add(c));
    const tags = params.get('tags');
    if (tags) tags.split(',').forEach(t => selectedTags.add(t));
    currentSort = params.get('sort') || 'newest';
    searchQuery = params.get('q') || '';
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = currentSort;
}

// ===== 筛选逻辑 =====
function matchesFilters(p) {
    if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
    if (selectedScreen && p.screen_form !== selectedScreen) return false;
    if (selectedCpu.size > 0) { let has = false; for (let c of selectedCpu) if (p.tags.includes(c)) { has = true; break; } if (!has) return false; }
    // 特性标签匹配：同时检查 tags 和 features
    const tagsRequireBoth = new Set(['NFC', '红外', 'USB3.0', '无线充电', '防水', '潜望长焦', '6500mAh+', '≤200g', '散热风扇']);
    for (let t of selectedTags) {
        if (tagsRequireBoth.has(t)) {
            // 特殊标签：tags 或 features 中有即可
            const inTags = p.tags.includes(t);
            const inFeatures = (p.features || []).some(f => f.includes(t));
            if (!inTags && !inFeatures) return false;
        } else {
            // 其他标签：只匹配 tags
            if (!p.tags.includes(t)) return false;
        }
    }
    // 搜索匹配
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = `${p.brand} ${p.model} ${p.processor}`.toLowerCase();
        if (!haystack.includes(q)) return false;
    }
    return true;
}

// ===== 排序逻辑 =====
function sortPhones(list) {
    const s = [...list];
    switch (currentSort) {
        case 'newest': s.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || '')); break;
        case 'price_asc': s.sort((a, b) => (a.price || 99999) - (b.price || 99999)); break;
        case 'price_desc': s.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
        case 'battery_desc': s.sort((a, b) => b.battery_mah - a.battery_mah); break;
        case 'weight_asc': s.sort((a, b) => (a.weight_g || 9999) - (b.weight_g || 9999)); break;
        case 'screen_desc': s.sort((a, b) => b.screen_size - a.screen_size); break;
        case 'charging_desc': s.sort((a, b) => b.charging_w - a.charging_w); break;
        case 'brand_asc': s.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)); break;
    }
    return s;
}

// ===== 渲染统计 =====
function renderStats() {
    const total = phones.length;
    const withPrice = phones.filter(p => p.price).length;
    const brands = new Set(phones.map(p => p.brand)).size;
    document.getElementById('statsBar').innerHTML =
        `覆盖 <span>${brands}</span> 个品牌 · 共 <span>${total}</span> 款机型 · 已收录 <span>${withPrice}</span> 款价格`;
}

// ===== 渲染筛选标签（带计数） =====
function brandCount(brand) { return phones.filter(p => p.brand === brand).length; }
function getTagDisplayName(tag) { return tagDisplayNames[tag] || tag; }

function renderBrandTags() {
    const c = document.getElementById('brandTags');
    c.innerHTML = '';
    brandList.forEach(b => {
        const count = brandCount(b);
        const el = document.createElement('span');
        el.className = 'tag' + (selectedBrands.has(b) ? ' active' : '');
        el.textContent = b;
        el.dataset.count = count;
        el.onclick = () => { selectedBrands.has(b) ? selectedBrands.delete(b) : selectedBrands.add(b); updateHash(); refresh(); };
        c.appendChild(el);
    });
    // 更新计数显示
    const filtered = phones.filter(p => matchesFilters(p));
    document.getElementById('brandCount').textContent = `(${filtered.length} 款)`;
}
function renderScreenTags() {
    const c = document.getElementById('screenTags'); c.innerHTML = '';
    screenTypes.forEach(s => {
        const el = document.createElement('span');
        el.className = 'tag screen' + (selectedScreen === s ? ' active' : '');
        el.textContent = s;
        el.onclick = () => { selectedScreen = selectedScreen === s ? null : s; updateHash(); refresh(); };
        c.appendChild(el);
    });
}
function renderCpuTags() {
    const c = document.getElementById('cpuTags'); c.innerHTML = '';
    cpuTags.forEach(t => {
        const el = document.createElement('span');
        el.className = 'tag cpu' + (selectedCpu.has(t) ? ' active' : '');
        el.textContent = t;
        el.onclick = () => { selectedCpu.has(t) ? selectedCpu.delete(t) : selectedCpu.add(t); updateHash(); refresh(); };
        c.appendChild(el);
    });
}
function renderFeatureTags() {
    const c = document.getElementById('featureTags'); c.innerHTML = '';
    featureTags.forEach(t => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedTags.has(t) ? ' active' : '');
        el.textContent = getTagDisplayName(t);
        el.onclick = () => { selectedTags.has(t) ? selectedTags.delete(t) : selectedTags.add(t); updateHash(); refresh(); };
        c.appendChild(el);
    });
}

// ===== 当前筛选栏 =====
function renderActiveBar() {
    const bar = document.getElementById('activeBar'), badges = document.getElementById('activeBadges');
    const total = selectedBrands.size + (selectedScreen ? 1 : 0) + selectedCpu.size + selectedTags.size + (searchQuery ? 1 : 0);
    if (total === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex'; badges.innerHTML = '';
    if (searchQuery) addBadge(badges, '🔍 ' + searchQuery, () => { searchQuery = ''; document.getElementById('searchInput').value = ''; document.getElementById('searchClear').style.display = 'none'; updateHash(); refresh(); });
    selectedBrands.forEach(b => addBadge(badges, b, () => { selectedBrands.delete(b); updateHash(); refresh(); }));
    if (selectedScreen) addBadge(badges, selectedScreen, () => { selectedScreen = null; updateHash(); refresh(); });
    selectedCpu.forEach(c => addBadge(badges, c, () => { selectedCpu.delete(c); updateHash(); refresh(); }));
    selectedTags.forEach(t => addBadge(badges, getTagDisplayName(t), () => { selectedTags.delete(t); updateHash(); refresh(); }));
}
function addBadge(c, t, r) {
    const el = document.createElement('span');
    el.className = 'active-badge';
    el.innerHTML = t + ' <span class="x">✕</span>';
    el.querySelector('.x').onclick = r;
    c.appendChild(el);
}

// ===== 渲染手机卡片 =====
function renderPhones() {
    const filtered = sortPhones(phones.filter(matchesFilters));
    const grid = document.getElementById('phoneGrid');
    document.getElementById('resultCount').textContent = filtered.length;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results"><div class="emoji">😢</div><p>没有找到符合条件的手机，试试调整筛选条件吧～</p></div>';
        return;
    }

    const searchLower = searchQuery.toLowerCase();

    grid.innerHTML = filtered.map(p => {
        const priceHtml = p.price ? '<span class="price-badge">¥' + p.price + '</span>' : '';
        const isHighlighted = searchQuery && (p.model.toLowerCase().includes(searchLower) || p.brand.toLowerCase().includes(searchLower));
        const isCompareSelected = compareList.includes(p.id);
        const isExpanded = expandedCards.has(p.id);

        // 搜索高亮
        let displayName = p.model;
        if (searchQuery) {
            const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            displayName = p.model.replace(regex, '<mark>$1</mark>');
        }

        const sc = [
            { l: '处理器', v: p.processor || '—' },
            { l: '内存/存储', v: (p.ram && p.storage) ? p.ram + ' + ' + p.storage : (p.ram || p.storage || '—') },
            { l: '屏幕', v: (p.screen_size ? p.screen_size + '英寸' : '') + (p.screen_type ? ' ' + p.screen_type : '') || '—' },
            { l: '电池', v: p.battery_mah ? p.battery_mah + 'mAh' : '—' },
            { l: '有线充电', v: p.charging_w ? p.charging_w + 'W' : '—' },
            { l: '无线充电', v: p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持' },
            { l: 'USB', v: p.usb_version || '—' },
            { l: '重量', v: p.weight_g ? p.weight_g + 'g' : '—' }
        ];

        // 详细信息（可折叠）
        let detailHtml = '';
        if (p.detailed_camera) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.detailed_camera + '</div></div>';
        if (!p.detailed_camera && p.camera_desc) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.camera_desc + '</div></div>';

        const ft = [];
        if (p.has_tele) ft.push({ t: '🔭 潜望长焦', c: 'purple' });
        if (p.screen_form === '折叠屏') ft.push({ t: '📱 折叠屏', c: 'fold' });
        if (p.tags.includes('无线充电')) ft.push({ t: '🔋 无线充电', c: 'green' });
        if (p.tags.includes('散热风扇')) ft.push({ t: '🌀 散热风扇', c: 'red' });
        (p.features || []).forEach(f => { if (f.includes('IP68') || f.includes('IP69')) ft.push({ t: '💧 ' + f, c: 'blue' }); else if (f.includes('NFC')) ft.push({ t: '📡 NFC', c: '' }); else if (f.includes('红外')) ft.push({ t: '🔴 红外', c: 'amber' }); else ft.push({ t: f, c: '' }); });
        p.tags.forEach(t => { if (cpuTags.includes(t)) ft.push({ t: '⚡ ' + t, c: 'cpu' }); });
        const fh = ft.length > 0 ? '<div class="card-footer">' + ft.map(f => '<span class="feature-tag ' + f.c + '">' + f.t + '</span>').join('') + '</div>' : '';

        const cardClass = [
            'phone-card',
            isHighlighted ? 'highlighted' : '',
            isCompareSelected ? 'compare-selected' : ''
        ].filter(Boolean).join(' ');

        return '<div class="' + cardClass + '" data-id="' + p.id + '">' +
            '<div class="card-header">' +
                '<div class="phone-name">' + displayName + '</div>' +
                '<div class="card-header-right">' +
                    priceHtml +
                    '<span class="brand-badge">' + p.brand + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="card-body">' +
                '<div class="spec-grid">' + sc.map(s => '<div class="spec-cell"><div class="label">' + s.l + '</div><div class="value">' + s.v + '</div></div>').join('') + '</div>' +
                '<div class="card-expand">' +
                    '<button class="expand-btn" data-id="' + p.id + '">' + (isExpanded ? '收起 ▲' : '展开详情 ▼') + '</button>' +
                '</div>' +
                '<div class="card-details ' + (isExpanded ? 'open' : '') + '">' + detailHtml + '</div>' +
            '</div>' +
            fh +
        '</div>';
    }).join('');

    // 绑定事件
    bindCardEvents();
}

// ===== 卡片事件绑定 =====
function bindCardEvents() {
    // 卡片点击 - 对比模式下选中/取消选中
    document.querySelectorAll('.phone-card').forEach(card => {
        card.onclick = (e) => {
            // 如果点击的是展开按钮，不触发对比选择
            if (e.target.closest('.expand-btn')) return;
            
            if (compareMode) {
                const id = parseInt(card.dataset.id);
                toggleCompareSelection(id);
            }
        };
    });
    
    // 展开/收起
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (expandedCards.has(id)) {
                expandedCards.delete(id);
            } else {
                expandedCards.add(id);
            }
            refresh();
        };
    });
}

// ===== 对比功能 =====
let compareMode = false;  // 是否处于对比模式
let compareList = [];     // 选中的机型 ID

function toggleCompareMode() {
    compareMode = !compareMode;
    const btn = document.getElementById('compareModeBtn');
    const actions = document.getElementById('compareActions');
    
    if (compareMode) {
        btn.classList.add('active');
        btn.textContent = '📊 退出对比';
        actions.style.display = 'flex';
    } else {
        btn.classList.remove('active');
        btn.textContent = '📊 对比模式';
        actions.style.display = 'none';
        compareList = [];
        document.getElementById('compareSelectedCount').textContent = '0';
        document.getElementById('compareStartBtn').disabled = true;
        document.getElementById('comparePanel').style.display = 'none';
    }
    refresh();
}

function toggleCompareSelection(id) {
    if (!compareMode) return;
    
    const idx = compareList.indexOf(id);
    if (idx >= 0) {
        compareList.splice(idx, 1);
    } else {
        if (compareList.length >= 4) {
            alert('最多只能对比 4 款机型哦～');
            return;
        }
        compareList.push(id);
    }
    
    updateCompareBar();
    refresh();
}

function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    const countEl = document.getElementById('compareBarCount');
    const selectedEl = document.getElementById('compareBarSelected');
    const startBtn = document.getElementById('compareBarStart');
    
    countEl.textContent = compareList.length;
    
    // 显示/隐藏选择栏
    if (compareList.length > 0) {
        bar.style.display = 'block';
    } else {
        bar.style.display = 'none';
    }
    
    // 显示已选中的机型
    const selectedPhones = compareList.map(id => phones.find(p => p.id === id)).filter(Boolean);
    selectedEl.innerHTML = selectedPhones.map(p => 
        `<span class="selected-chip">${p.model}<span class="remove" data-id="${p.id}">✕</span></span>`
    ).join('');
    
    // 绑定移除事件
    selectedEl.querySelectorAll('.remove').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            toggleCompareSelection(id);
        };
    });
    
    // 启用/禁用开始对比按钮
    startBtn.disabled = compareList.length < 2;
}

function startCompare() {
    if (compareList.length < 2) return;
    renderComparePanel();
    document.getElementById('comparePanel').style.display = 'block';
}

function toggleCompareMode() {
    compareMode = !compareMode;
    const btn = document.getElementById('compareModeBtn');
    
    if (compareMode) {
        btn.classList.add('active');
        btn.textContent = '📊 退出对比';
    } else {
        btn.classList.remove('active');
        btn.textContent = '📊 对比模式';
        compareList = [];
        updateCompareBar();
        document.getElementById('comparePanel').style.display = 'none';
    }
    refresh();
}

function renderComparePanel() {
    const selected = phones.filter(p => compareList.includes(p.id));
    if (selected.length < 2) return;

    const fields = [
        { l: '价格', v: p => p.price ? '¥' + p.price : '—' },
        { l: '处理器', v: p => p.processor || '—' },
        { l: '内存', v: p => p.ram || '—' },
        { l: '存储', v: p => p.storage || '—' },
        { l: '屏幕', v: p => (p.screen_size ? p.screen_size + '英寸' : '') + (p.screen_type ? ' ' + p.screen_type : '') || '—' },
        { l: '分辨率', v: p => p.resolution || '—' },
        { l: '刷新率', v: p => p.refresh_hz ? p.refresh_hz + 'Hz' : '—' },
        { l: 'NFC', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('NFC') || feats.some(f => f.includes('NFC'))) return '✅';
            return '—';
        }},
        { l: '红外', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('红外') || feats.some(f => f.includes('红外'))) return '✅';
            return '—';
        }},
        { l: '潜望长焦', v: p => p.has_tele ? '✅' : '—' },
        { l: '发布日期', v: p => p.release_date || '—' },
    ];

    let html = '<table class="compare-table"><thead><tr><th>参数</th>';
    selected.forEach(p => {
        html += '<th>' + p.model + '<br><small>' + p.brand + '</small><br><button class="compare-remove" data-id="' + p.id + '">✕</button></th>';
    });
    html += '</tr></thead><tbody>';
    fields.forEach(f => {
        html += '<tr><th>' + f.l + '</th>';
        selected.forEach(p => html += '<td>' + f.v(p) + '</td>');
        html += '</tr>';
    });
    html += '</tbody></table>';

    document.getElementById('comparePanelBody').innerHTML = html;

    // 绑定删除按钮
    document.querySelectorAll('.compare-remove').forEach(btn => {
        btn.onclick = () => { toggleCompareSelection(parseInt(btn.dataset.id)); };
    });
}

// ===== 搜索 =====
function handleSearch() {
    searchQuery = document.getElementById('searchInput').value.trim();
    document.getElementById('searchClear').style.display = searchQuery ? '' : 'none';
    updateHash();
    refresh();
}

// ===== 刷新 =====
function refresh() {
    renderBrandTags();
    renderScreenTags();
    renderCpuTags();
    renderFeatureTags();
    renderActiveBar();
    renderPhones();
}

// ===== 初始化 =====
function init() {
    renderStats();
    refresh();
    setupEventListeners();
}

// ===== 事件监听 =====
function setupEventListeners() {
    // 排序
    document.getElementById('sortSelect').addEventListener('change', e => {
        currentSort = e.target.value;
        updateHash();
        refresh();
    });

    // 清空全部
    document.getElementById('clearAll').addEventListener('click', () => {
        selectedBrands.clear();
        selectedScreen = null;
        selectedCpu.clear();
        selectedTags.clear();
        compareList = [];
        compareMode = false;
        document.getElementById('compareModeBtn').classList.remove('active');
        document.getElementById('compareModeBtn').textContent = '📊 对比模式';
        document.getElementById('comparePanel').style.display = 'none';
        updateHash();
        refresh();
    });

    // 对比模式按钮
    document.getElementById('compareModeBtn').addEventListener('click', toggleCompareMode);
    
    // 开始对比按钮
    document.getElementById('compareBarStart').addEventListener('click', startCompare);
    
    // 清空对比选择按钮
    document.getElementById('compareBarClear').addEventListener('click', clearCompareSelection);

    // 搜索
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchClear').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        searchQuery = '';
        document.getElementById('searchClear').style.display = 'none';
        updateHash();
        refresh();
    });

    // 关闭对比面板
    document.getElementById('compareClose').addEventListener('click', () => {
        compareList = [];
        document.getElementById('comparePanel').style.display = 'none';
        refresh();
    });

    // 键盘快捷键
    document.addEventListener('keydown', e => {
        // Cmd+K / Ctrl+K 聚焦搜索
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        // Esc 清空搜索 / 关闭对比
        if (e.key === 'Escape') {
            if (document.getElementById('searchInput') === document.activeElement) {
                document.getElementById('searchInput').value = '';
                searchQuery = '';
                document.getElementById('searchClear').style.display = 'none';
                updateHash();
                refresh();
            } else if (compareList.length > 0) {
                compareList = [];
                updateCompareBar();
                document.getElementById('comparePanel').style.display = 'none';
                refresh();
            }
        }
    });

    // 关闭对比面板
    document.getElementById('comparePanelClose').addEventListener('click', () => {
        document.getElementById('comparePanel').style.display = 'none';
    });
    
    // 点击遮罩关闭对比面板
    document.getElementById('comparePanelOverlay').addEventListener('click', () => {
        document.getElementById('comparePanel').style.display = 'none';
    });

    // 对比选择栏关闭按钮
    document.getElementById('compareBarClose').addEventListener('click', () => {
        compareList = [];
        compareMode = false;
        document.getElementById('compareModeBtn').classList.remove('active');
        document.getElementById('compareModeBtn').textContent = '📊 对比模式';
        updateCompareBar();
        document.getElementById('comparePanel').style.display = 'none';
        refresh();
    });

    // 回到顶部
    const backTop = document.getElementById('backTop');
    window.addEventListener('scroll', () => {
        backTop.style.display = window.scrollY > 500 ? '' : 'none';
    }, { passive: true });
    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 恢复搜索框值
    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery;
        document.getElementById('searchClear').style.display = '';
    }
}

// ===== 启动 =====
loadData();
