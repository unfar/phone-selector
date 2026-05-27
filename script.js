// ============================================
// 📱 智能手机选购助手 — 核心逻辑
// ============================================

let phones = [];
let brandList = [];
let selectedBrands = new Set();
let selectedScreen = null;
let selectedCpu = new Set();
let selectedTags = new Set();
let selectedPriceRanges = new Set();
let selectedScreenSizes = new Set();
let currentSort = 'newest';
let expandedCards = new Set();

// ===== 对比功能变量 =====
let compareMode = false;
let compareList = [];

// ===== 配置 =====
const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","骁龙8 Gen5","天玑9500","天玑9500s","天玑8550","天玑8550 Elite","第四代骁龙7","麒麟9030Pro","麒麟9030","麒麟9020","天玑9400","麒麟9010s","A19","A18"];
const featureTags = ["潜望长焦","6500mAh+","≤200g","防水","NFC","红外","USB3.0","无线充电","散热风扇"];
const tagDisplayNames = {"6500mAh+":"6500mAh+","≤200g":"≤200g"};
const priceRanges = [
    { name: "<1k", min: 0, max: 999 },
    { name: "1-2k", min: 1000, max: 1999 },
    { name: "2-3k", min: 2000, max: 2999 },
    { name: "3-4k", min: 3000, max: 3999 },
    { name: "4-5k", min: 4000, max: 4999 },
    { name: "5-6k", min: 5000, max: 5999 },
    { name: "6-7k", min: 6000, max: 6999 },
    { name: "7-8k", min: 7000, max: 7999 },
    { name: "8-9k", min: 8000, max: 8999 },
    { name: "9-10k", min: 9000, max: 9999 },
    { name: ">1w", min: 10000, max: 999999 }
];
const screenSizeRanges = [
    { name: "6英寸左右", min: 5.7, max: 6.3 },
    { name: "6.5英寸左右", min: 6.2, max: 6.8 },
    { name: "7英寸左右", min: 6.7, max: 7.5 }
];
const screenTypes = ['📱 直屏','🔄 折叠屏'];
const brandEnglishMap = {
    "苹果": "Apple",
    "三星": "Samsung",
    "摩托罗拉": "Motorola"
};
function getEnglishBrand(zh) { return brandEnglishMap[zh] || zh; }


// ===== 数据加载 =====
async function loadData() {
    try {
        showLoading();
        const resp = await fetch('data/phones.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        phones = await resp.json();
        // 初始化品牌列表，确保后续渲染时有数据
        brandList = [...new Set(phones.map(p => p.brand))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        hideLoading();
        restoreStateFromHash();
        init();
    } catch (err) {
        hideLoading();
        document.getElementById('phoneGrid').innerHTML =
            `<div class="error-msg"><div class="emoji">😢</div><p>数据加载失败：${err.message}</p><p style="margin-top:8px;font-size:.85rem">请检查网络连接或刷新页面重试</p></div>`;
    }
}

function showLoading() {
    const grid = document.getElementById('phoneGrid');
    grid.innerHTML = '<div class="loading"><div class="spinner">⏳</div><p>加载数据中...</p></div>';
}

function hideLoading() {
    const grid = document.getElementById('phoneGrid');
    grid.innerHTML = grid.innerHTML.replace('<div class="loading"><div class="spinner">⏳</div><p>加载数据中...</p></div>', '');
}

// ===== URL Hash 状态管理 =====
function updateHash() {
    const params = new URLSearchParams();
    if (selectedBrands.size > 0) params.set('brands', [...selectedBrands].join(','));
    if (selectedScreen) params.set('screen', selectedScreen);
    if (selectedCpu.size > 0) params.set('cpu', [...selectedCpu].join(','));
    if (selectedTags.size > 0) params.set('tags', [...selectedTags].join(','));
    if (selectedPriceRanges.size > 0) params.set('priceRange', [...selectedPriceRanges].join(','));
    if (selectedScreenSizes.size > 0) params.set('screenSize', [...selectedScreenSizes].join(','));
    if (currentSort !== 'newest') params.set('sort', currentSort);
    const hash = params.toString();
    history.replaceState(null, '', `#${hash}`);
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
    const priceRanges = params.get('priceRange');
    if (priceRanges) priceRanges.split(',').forEach(r => selectedPriceRanges.add(r));
    const screenSizes = params.get('screenSize');
    if (screenSizes) screenSizes.split(',').forEach(s => selectedScreenSizes.add(s));
    currentSort = params.get('sort') || 'newest';
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = currentSort;
}

// ===== 筛选逻辑 =====
function matchesFilters(p) {
    if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
    if (selectedScreen) {
        const screenVal = selectedScreen.replace(/^\S+\s*/, '');
        if (p.screen_form !== screenVal) return false;
    }
    if (selectedCpu.size > 0) { let has = false; for (let c of selectedCpu) if (p.tags.includes(c)) { has = true; break; } if (!has) return false; }
    const tagsRequireBoth = new Set(['NFC', '红外', 'USB3.0', '无线充电', '防水', '潜望长焦', '6500mAh+', '≤200g', '散热风扇']);
    for (let t of selectedTags) {
        if (tagsRequireBoth.has(t)) {
            const inTags = p.tags.includes(t);
            const inFeatures = (p.features || []).some(f => f.includes(t));
            if (!inTags && !inFeatures) return false;
        } else {
            if (!p.tags.includes(t)) return false;
        }
    }
    // 价格范围筛选（多选，任一匹配即可）
    if (selectedPriceRanges.size > 0) {
        let inRange = false;
        for (let r of selectedPriceRanges) {
            const range = priceRanges.find(pr => pr.name === r);
            if (range && p.price >= range.min && p.price <= range.max) { inRange = true; break; }
        }
        if (!inRange) return false;
    }
    // 屏幕尺寸筛选（多选，任一匹配即可）
    if (selectedScreenSizes.size > 0) {
        let inSize = false;
        for (let s of selectedScreenSizes) {
            const range = screenSizeRanges.find(sr => sr.name === s);
            if (range && p.screen_size >= range.min && p.screen_size <= range.max) { inSize = true; break; }
        }
        if (!inSize) return false;
    }
    return true;
}

// ===== 排序逻辑 =====
function normDate(d) {
    if (!d) return '';
    if (d.length === 7) return d + '-01';  // YYYY-MM → YYYY-MM-01（月初）
    return d;
}
function sortPhones(list) {
    const s = [...list];
    switch (currentSort) {
        case 'newest': s.sort((a, b) => normDate(b.release_date).localeCompare(normDate(a.release_date)) || a.model.localeCompare(b.model)); break;
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

// ===== 折叠屏屏幕显示 =====
function getFoldableScreenDisplay(phone) {
    // 检查是否是折叠屏
    if (phone.screen_unfolded && phone.screen_folded) {
        const unfolded = phone.screen_unfolded;
        const folded = phone.screen_folded;
        const foldType = phone.fold_type || '折叠屏';
        
        let display = '';
        
        if (foldType === '三折叠') {
            display = `三折叠 ${unfolded.size}英寸/${folded.size}英寸`;
        } else if (foldType === '横向折叠') {
            display = `横折 ${unfolded.size}英寸/${folded.size}英寸`;
        } else if (foldType === '纵向折叠') {
            display = `竖折 ${unfolded.size}英寸/${folded.size}英寸`;
        } else {
            display = `${unfolded.size}英寸/${folded.size}英寸`;
        }
        
        return display;
    }
    
    // 非折叠屏，使用原有逻辑
    return (phone.screen_size ? phone.screen_size + '英寸' : '') + (phone.screen_type ? ' ' + phone.screen_type : '') || '—';
}

// ===== 折叠屏分辨率显示 =====
function getFoldableResolutionDisplay(phone) {
    if (phone.screen_unfolded && phone.screen_folded) {
        const unfolded = phone.screen_unfolded;
        const folded = phone.screen_folded;
        return `${unfolded.resolution || '—'} / ${folded.resolution || '—'}`;
    }
    return phone.resolution || '—';
}

// ===== 折叠屏刷新率显示 =====
function getFoldableRefreshDisplay(phone) {
    if (phone.screen_unfolded && phone.screen_folded) {
        const unfolded = phone.screen_unfolded;
        const folded = phone.screen_folded;
        return `${unfolded.refresh_hz || '—'}Hz / ${folded.refresh_hz || '—'}Hz`;
    }
    return phone.refresh_hz ? phone.refresh_hz + 'Hz' : '—';
}

// ===== 渲染统计 =====
function renderStats() {
    const total = phones.length;
    const brands = new Set(phones.map(p => p.brand)).size;
    document.getElementById('statBrands').textContent = brands;
    document.getElementById('statPhones').textContent = total;
}

// ===== 渲染筛选标签 =====
function brandCount(brand) { return phones.filter(p => p.brand === brand).length; }
function getTagDisplayName(tag) { return tagDisplayNames[tag] || tag; }

function renderBrandTags() {
    const c = document.getElementById('brandTags'); c.innerHTML = '';
    brandList.forEach(b => {
        const count = brandCount(b);
        const el = document.createElement('span');
        el.className = 'tag' + (selectedBrands.has(b) ? ' active brand-active-' + b : '');
        el.textContent = getEnglishBrand(b);
        el.dataset.count = count;
        el.onclick = () => { selectedBrands.has(b) ? selectedBrands.delete(b) : selectedBrands.add(b); updateHash(); refresh(); };
        c.appendChild(el);
    });
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
    const c = document.getElementById('featureTags'); 
    c.innerHTML = '';
    featureTags.forEach(t => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedTags.has(t) ? ' active' : '');
        el.textContent = getTagDisplayName(t);
        el.onclick = () => { 
            selectedTags.has(t) ? selectedTags.delete(t) : selectedTags.add(t); 
            updateHash(); 
            refresh(); 
        };
        c.appendChild(el);
    });
}

function renderPriceRangeTags() {
    const container = document.getElementById('priceRangeTags');
    container.innerHTML = '';
    priceRanges.forEach(range => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedPriceRanges.has(range.name) ? ' active' : '');
        el.textContent = range.name;
        el.onclick = () => {
            selectedPriceRanges.has(range.name) ? selectedPriceRanges.delete(range.name) : selectedPriceRanges.add(range.name);
            updateHash();
            refresh();
        };
        container.appendChild(el);
    });
}

function renderScreenSizeTags() {
    const container = document.getElementById('screenSizeTags');
    container.innerHTML = '';
    screenSizeRanges.forEach(range => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedScreenSizes.has(range.name) ? ' active' : '');
        el.textContent = range.name;
        el.onclick = () => {
            selectedScreenSizes.has(range.name) ? selectedScreenSizes.delete(range.name) : selectedScreenSizes.add(range.name);
            updateHash();
            refresh();
        };
        container.appendChild(el);
    });
}

// ===== 当前筛选栏 =====
function renderActiveBar() {
    const bar = document.getElementById('activeBar'), badges = document.getElementById('activeBadges');
    const total = selectedBrands.size + (selectedScreen ? 1 : 0) + selectedCpu.size + selectedTags.size + selectedPriceRanges.size + selectedScreenSizes.size;
    if (total === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex'; badges.innerHTML = '';
    selectedBrands.forEach(b => addBadge(badges, getEnglishBrand(b), () => { selectedBrands.delete(b); updateHash(); refresh(); }));
    if (selectedScreen) addBadge(badges, selectedScreen, () => { selectedScreen = null; updateHash(); refresh(); });
    selectedCpu.forEach(c => addBadge(badges, c, () => { selectedCpu.delete(c); updateHash(); refresh(); }));
    selectedTags.forEach(t => addBadge(badges, getTagDisplayName(t), () => { selectedTags.delete(t); updateHash(); refresh(); }));
    selectedPriceRanges.forEach(r => addBadge(badges, r, () => { selectedPriceRanges.delete(r); updateHash(); refresh(); }));
    selectedScreenSizes.forEach(s => addBadge(badges, s, () => { selectedScreenSizes.delete(s); updateHash(); refresh(); }));
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
        grid.innerHTML = '<div class="no-results"><div class="emoji">🔍</div><p>没有找到符合条件的手机</p><p style="margin-top:8px;font-size:.85rem;color:var(--text-muted)">试试减少筛选条件、更换品牌或调整价格范围～</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const priceHtml = p.price ? '<span class="price-badge">¥' + p.price + '</span>' : '';
        const isCompareSelected = compareList.includes(p.id);
        const isExpanded = expandedCards.has(p.id);

        const displayName = (() => {
            const m = p.model, b = p.brand;
            // Case-insensitive brand prefix check
            if (m.toLowerCase().startsWith(b.toLowerCase())) return m;
            // Known brand prefixes already in model name
            if (m.startsWith('iPhone') || m.startsWith('Galaxy') || m.startsWith('moto') || m.startsWith('Moto')) return m;
            // Chinese brand name already in model
            if ((b === 'Huawei' || b === 'HONOR' || b === 'OnePlus' || b === 'RedMagic' || b === 'Lenovo') && /^[一荣耀华红拯]/.test(m)) return m;
            if (b === 'OPPO' || b === 'REDMI') return m; // models already include brand
            // Prepend brand for bare model names (e.g. GT8, 13 Pro, S21)
            return b + ' ' + m;
        })();

        const sc = [
            { l: '处理器', v: p.processor || '—' },
            { l: '内存/存储', v: (p.ram && p.storage) ? p.ram + ' + ' + p.storage : (p.ram || p.storage || '—') },
            { l: '屏幕', v: getFoldableScreenDisplay(p) || '—' },
            { l: '电池', v: p.battery_mah ? p.battery_mah + 'mAh' : '—' },
            { l: '有线充电', v: p.charging_w ? p.charging_w + 'W' : '—' },
            { l: '无线充电', v: p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持' },
            { l: 'USB', v: p.usb_version || '—' },
            { l: '重量', v: p.weight_g ? p.weight_g + 'g' : '—' }
        ];

        let detailHtml = '';
        if (p.detailed_camera) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.detailed_camera + '</div></div>';
        if (!p.detailed_camera && p.camera_desc) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.camera_desc + '</div></div>';

        const ft = [];
        const addedTags = new Set();
        if (p.has_tele) { ft.push({ t: '🔭 潜望长焦', c: 'purple' }); addedTags.add('🔭 潜望长焦'); }
        if (p.screen_form === '折叠屏') { ft.push({ t: '📱 折叠屏', c: 'fold' }); addedTags.add('📱 折叠屏'); }
        if (p.tags.includes('无线充电')) { ft.push({ t: '🔋 无线充电', c: 'green' }); addedTags.add('🔋 无线充电'); }
        if (p.tags.includes('散热风扇')) { ft.push({ t: '🌀 散热风扇', c: 'red' }); addedTags.add('🌀 散热风扇'); }
        (p.features || []).forEach(f => {
            let tag = null;
            if (f.includes('IP68') || f.includes('IP69')) tag = { t: '💧 ' + f, c: 'blue' };
            else if (f.includes('NFC')) tag = { t: '📡 NFC', c: '' };
            else if (f.includes('红外')) tag = { t: '🔴 红外', c: 'amber' };
            else if (f === 'USB3.0') tag = { t: '🔌 USB 3.0', c: '' };
            else if (f === '6500mAh+') tag = { t: '🔋 6500mAh+', c: 'green' };
            else if (f === '≤200g') tag = { t: '🪶 ≤200g', c: 'green' };
            else tag = { t: f, c: '' };
            if (tag && !addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); }
        });
        p.tags.forEach(t => {
            if (cpuTags.includes(t)) { const tag = { t: '⚡ ' + t, c: 'cpu' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
            else if (t === '红外') { const tag = { t: '🔴 红外', c: 'amber' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
            else if (t === 'NFC') { const tag = { t: '📡 NFC', c: 'blue' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
            else if (t === 'USB3.0') { const tag = { t: '🔌 USB 3.0', c: 'blue' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
            else if (t === '6500mAh+') { const tag = { t: '🔋 6500mAh+', c: 'green' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
            else if (t === '≤200g') { const tag = { t: '🪶 ≤200g', c: 'green' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
        });
        const fh = ft.length > 0 ? '<div class="card-footer">' + ft.map(f => '<span class="feature-tag ' + f.c + '">' + f.t + '</span>').join('') + '</div>' : '';

        const cardClass = ['phone-card'];
        cardClass.push('brand-border-' + p.brand);
        if (isCompareSelected) cardClass.push('compare-selected');
        if (compareMode) cardClass.push('compare-clickable');

        return '<div class="' + cardClass.join(' ') + '" data-id="' + p.id + '">' +
            '<div class="card-header brand-header-' + p.brand + '">' +
                '<span class="brand-badge brand-' + p.brand + '">' + p.brand + '</span>' +
                priceHtml +
                '<div class="phone-name">' + displayName + '</div>' +
            '</div>' +
            '<div class="card-body">' +
                '<div class="spec-grid">' + sc.map(s => '<div class="spec-cell"><div class="label">' + s.l + '</div><div class="value">' + s.v + '</div></div>').join('') + '</div>' +
                '<div class="card-expand"><button class="expand-btn" data-id="' + p.id + '">' + (isExpanded ? '收起 ▲' : '展开详情 ▼') + '</button></div>' +
                '<div class="card-details ' + (isExpanded ? 'open' : '') + '">' + detailHtml + '</div>' +
            '</div>' + fh +
        '</div>';
    }).join('');

    bindCardEvents();
}

// ===== 卡片事件绑定 =====
function bindCardEvents() {
    // 卡片点击 - 对比模式下选中/取消选中
    document.querySelectorAll('.phone-card').forEach(card => {
        card.onclick = (e) => {
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
function toggleCompareMode() {
    compareMode = !compareMode;
    const btn = document.getElementById('compareModeBtn');

    if (compareMode) {
        btn.classList.add('active');
        btn.textContent = '📊 退出对比';
    } else {
        btn.classList.remove('active');
        btn.textContent = '📊 机型对比';
        compareList = [];
        updateCompareBar();
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

    if (compareList.length > 0) {
        bar.style.display = 'block';
    } else {
        bar.style.display = 'none';
    }

    const selectedPhones = compareList.map(id => phones.find(p => p.id === id)).filter(Boolean);
    selectedEl.innerHTML = selectedPhones.map(p =>
        `<span class="selected-chip">${p.model}<span class="remove" data-id="${p.id}">✕</span></span>`
    ).join('');

    selectedEl.querySelectorAll('.remove').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            toggleCompareSelection(id);
        };
    });

    startBtn.disabled = compareList.length < 2;
}

function startCompare() {
    console.log('开始对比，当前对比列表长度:', compareList.length);
    if (compareList.length < 2) {
        console.log('对比机型数量不足，需要至少2款');
        return;
    }
    console.log('开始渲染对比面板');
    renderComparePanel();
    const panel = document.getElementById('comparePanel');
    if (panel) {
        panel.style.display = 'flex';
        console.log('对比面板已显示');
    } else {
        console.error('未找到对比面板元素');
    }
}

function clearCompareSelection() {
    compareList = [];
    updateCompareBar();
    document.getElementById('comparePanel').style.display = 'none';
    refresh();
}

function renderComparePanel() {
    const selected = phones.filter(p => compareList.includes(p.id));
    if (selected.length < 2) return;

    const fields = [
        { l: '💰 价格', v: p => p.price ? '¥' + p.price : '—', best: 'min' },
        { l: '⚡ 处理器', v: p => p.processor || '—' },
        { l: '🧠 内存', v: p => p.ram || '—' },
        { l: '💾 存储', v: p => p.storage || '—' },
        { l: '📺 屏幕', v: p => getFoldableScreenDisplay(p) || '—' },
        { l: '🎨 分辨率', v: p => getFoldableResolutionDisplay(p) || '—' },
        { l: '🔄 刷新率', v: p => getFoldableRefreshDisplay(p) || '—', best: 'max' },
        { l: '🔋 电池', v: p => p.battery_mah ? p.battery_mah + 'mAh' : '—', best: 'max' },
        { l: '🔌 有线充电', v: p => p.charging_w ? p.charging_w + 'W' : '—', best: 'max' },
        { l: '📶 无线充电', v: p => p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持', best: 'max' },
        { l: '🔗 USB', v: p => p.usb_version || '—' },
        { l: '⚖️ 重量', v: p => p.weight_g ? p.weight_g + 'g' : '—', best: 'min' },
        { l: '📱 系统', v: p => p.os || '—' },
        { l: '📐 屏幕形态', v: p => p.screen_form || '—' },
        { l: '💧 防水', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('防水') || feats.some(f => f.includes('IP68') || f.includes('IP69'))) return '✅ 支持';
            return '—';
        }},
        { l: '📡 NFC', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('NFC') || feats.some(f => f.includes('NFC'))) return '✅ 支持';
            return '—';
        }},
        { l: '🔴 红外', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('红外') || feats.some(f => f.includes('红外'))) return '✅ 支持';
            return '—';
        }},
        { l: '📷 潜望长焦', v: p => p.has_tele ? '✅ 支持' : '—' },
        { l: '📅 发布日期', v: p => p.release_date || '—' },
    ];

    // 找出每个参数的最佳值
    const bestValues = {};
    fields.forEach(f => {
        if (f.best) {
            const values = selected.map(p => {
                const val = f.v(p);
                // 提取数字进行比较
                const numMatch = val.match(/(\d+)/);
                return numMatch ? parseInt(numMatch[1]) : 0;
            });
            
            if (f.best === 'min') {
                bestValues[f.l] = Math.min(...values);
            } else if (f.best === 'max') {
                bestValues[f.l] = Math.max(...values);
            }
        }
    });

    let html = '<table class="compare-table"><thead><tr><th><span class="param-label">参数</span></th>';
    selected.forEach(p => {
        html += '<th><div class="phone-name-badge">' + p.model + '</div><small style="opacity:.8;display:block;margin-top:4px">' + getEnglishBrand(p.brand) + '</small><button class="compare-remove" data-id="' + p.id + '">✕ 移除</button></th>';
    });
    html += '</tr></thead><tbody>';
    fields.forEach(f => {
        html += '<tr><th>' + f.l + '</th>';
        selected.forEach(p => {
            const value = f.v(p);
            let displayValue = value;
            
            // 检查是否是最佳值
            if (f.best && bestValues[f.l]) {
                const numMatch = value.match(/(\d+)/);
                if (numMatch) {
                    const numValue = parseInt(numMatch[1]);
                    if (numValue === bestValues[f.l]) {
                        displayValue = '<span class="best">' + value + '</span> 🏆';
                    }
                }
            }
            
            html += '<td>' + displayValue + '</td>';
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    // 保留雷达图容器
    html += '<div id="radarChartContainer" style="display:none; margin-bottom:20px;"><canvas id="radarChart" width="400" height="400"></canvas><div id="radarLegend" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:12px;padding:0 16px"></div></div>';

    document.getElementById('comparePanelBody').innerHTML = html;

    document.querySelectorAll('.compare-remove').forEach(btn => {
        btn.onclick = () => { toggleCompareSelection(parseInt(btn.dataset.id)); };
    });
    
    // 绘制雷达图
    drawRadarChart(selected);
}

// ===== 刷新 =====
function refresh() {
    renderBrandTags();
    renderScreenTags();
    renderCpuTags();
    renderFeatureTags();
    renderPriceRangeTags();
    renderScreenSizeTags();
    renderActiveBar();
    renderPhones();
}

// ===== 暗色模式切换 =====
function toggleDarkMode() {
    const body = document.body;
    const toggle = document.getElementById('darkModeToggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        toggle.textContent = '☀️';
        localStorage.setItem('darkMode', 'true');
    } else {
        toggle.textContent = '🌙';
        localStorage.setItem('darkMode', 'false');
    }
}

// ===== 雷达图绘制 =====
function drawRadarChart(phones) {
    const canvas = document.getElementById('radarChart');
    const container = document.getElementById('radarChartContainer');
    
    if (!canvas || !container || phones.length < 2) {
        if (container) container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 定义参数维度
    const dimensions = [
        { name: '性能', key: 'performance', max: 100 },
        { name: '屏幕', key: 'screen', max: 100 },
        { name: '拍照', key: 'camera', max: 100 },
        { name: '电池', key: 'battery', max: 100 },
        { name: '充电', key: 'charging', max: 100 },
        { name: '性价比', key: 'value', max: 100 }
    ];
    
    // 计算每款手机的参数分数
    const phoneScores = phones.map(phone => {
        const scores = {};
        
        // 性能分数（基于处理器）
        const processor = phone.processor || '';
        if (processor.includes('Elite') || processor.includes('天玑9500') || processor.includes('麒麟9030')) {
            scores.performance = 95;
        } else if (processor.includes('天玑9400') || processor.includes('麒麟9020') || processor.includes('A19')) {
            scores.performance = 90;
        } else if (processor.includes('8 Gen') || processor.includes('天玑8')) {
            scores.performance = 80;
        } else {
            scores.performance = 70;
        }
        
        // 屏幕分数（基于刷新率和分辨率）
        let refreshRate = phone.refresh_hz || 60;
        let hasHighRes = phone.resolution && (phone.resolution.includes('2K') || phone.resolution.includes('1440'));
        
        // 如果是折叠屏，使用展开时的参数
        if (phone.screen_unfolded) {
            refreshRate = phone.screen_unfolded.refresh_hz || 60;
            hasHighRes = phone.screen_unfolded.resolution && (phone.screen_unfolded.resolution.includes('2K') || phone.screen_unfolded.resolution.includes('1440'));
        }
        
        scores.screen = Math.min(100, (refreshRate / 144) * 60 + (hasHighRes ? 40 : 30));
        
        // 拍照分数（基于摄像头描述）
        const cameraDesc = phone.camera_desc || '';
        if (cameraDesc.includes('潜望') || cameraDesc.includes('长焦')) {
            scores.camera = 90;
        } else if (cameraDesc.includes('主摄') && cameraDesc.includes('超广角')) {
            scores.camera = 80;
        } else {
            scores.camera = 70;
        }
        
        // 电池分数（基于电池容量）
        const battery = phone.battery_mah || 4000;
        scores.battery = Math.min(100, (battery / 6000) * 100);
        
        // 充电分数（基于充电功率）
        const charging = phone.charging_w || 18;
        scores.charging = Math.min(100, (charging / 120) * 100);
        
        // 性价比分数（基于价格和配置）
        const price = phone.price || 5000;
        const overallScore = (scores.performance + scores.screen + scores.camera + scores.battery + scores.charging) / 5;
        scores.value = Math.min(100, overallScore * (5000 / Math.max(price, 1000)));
        
        return {
            name: phone.model,
            brand: phone.brand,
            scores: scores
        };
    });
    
    // 颜色配置
    const colors = [
        'rgba(99, 102, 241, 0.55)',   // indigo
        'rgba(236, 72, 153, 0.55)',   // pink
        'rgba(52, 211, 153, 0.55)',   // emerald
        'rgba(251, 146, 60, 0.55)'    // amber
    ];
    
    const borderColors = [
        'rgba(99, 102, 241, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(52, 211, 153, 1)',
        'rgba(251, 146, 60, 1)'
    ];
    
    // 绘制背景网格
    const numSides = dimensions.length;
    const angleStep = (Math.PI * 2) / numSides;
    
    // 绘制同心多边形
    for (let level = 5; level >= 1; level--) {
        const levelRadius = (radius / 5) * level;
        ctx.beginPath();
        for (let i = 0; i <= numSides; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const x = centerX + levelRadius * Math.cos(angle);
            const y = centerY + levelRadius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.stroke();
    }
    
    // 绘制轴线和标签
    for (let i = 0; i < numSides; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // 轴线
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        ctx.stroke();
        
        // 标签
        const labelX = centerX + (radius + 25) * Math.cos(angle);
        const labelY = centerY + (radius + 25) * Math.sin(angle);
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f1f5f9' : '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dimensions[i].name, labelX, labelY);
    }
    
    // 绘制每款手机的数据区域
    phoneScores.forEach((phoneData, index) => {
        if (index >= colors.length) return;
        
        ctx.beginPath();
        for (let i = 0; i <= numSides; i++) {
            const dimension = dimensions[i % numSides];
            const score = phoneData.scores[dimension.key] || 50;
            const normalizedScore = score / dimension.max;
            const angle = angleStep * (i % numSides) - Math.PI / 2;
            const x = centerX + radius * normalizedScore * Math.cos(angle);
            const y = centerY + radius * normalizedScore * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        ctx.strokeStyle = borderColors[index];
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // 绘制图例（HTML方式，可靠显示机型名称）
    const legendEl = document.getElementById('radarLegend');
    if (legendEl) {
        legendEl.innerHTML = phoneScores.map((pd, i) => {
            const color = colors[i % colors.length];
            const borderColor = borderColors[i % borderColors.length];
            return '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:var(--bg);border-radius:20px;font-size:.8rem;border:1px solid ' + borderColor + '">' +
                '<span style="width:10px;height:10px;border-radius:2px;background:' + color + ';display:inline-block"></span>' +
                '<span style="color:var(--text);font-weight:600">' + pd.name + '</span>' +
                '</span>';
        }).join('');
    }
}

// ===== 初始化 =====
function init() {
    renderStats();
    refresh();
    setupEventListeners();
}

// ===== 事件监听 =====
function setupEventListeners() {
    document.getElementById('sortSelect').addEventListener('change', e => {
        currentSort = e.target.value;
        updateHash();
        refresh();
    });
    // 筛选区折叠
    document.querySelectorAll('.filter-label').forEach(label => {
        label.addEventListener('click', () => {
            const section = label.parentElement;
            section.classList.toggle('collapsed');
        });
    });
    document.getElementById('clearAll').addEventListener('click', () => {
        selectedBrands.clear();
        selectedScreen = null;
        selectedCpu.clear();
        selectedTags.clear();
        selectedPriceRanges.clear();
        selectedScreenSizes.clear();
        compareList = [];
        compareMode = false;
        document.getElementById('compareModeBtn').classList.remove('active');
        document.getElementById('compareModeBtn').textContent = '📊 机型对比';
        updateHash();
        refresh();
    });

    // 对比模式按钮
    document.getElementById('compareModeBtn').addEventListener('click', toggleCompareMode);
    document.getElementById('compareBarStart').addEventListener('click', startCompare);
    document.getElementById('compareBarClear').addEventListener('click', clearCompareSelection);

    // 暗色模式切换
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // 从本地存储加载暗色模式设置
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    // 关闭对比面板
    document.getElementById('comparePanelClose').addEventListener('click', () => {
        document.getElementById('comparePanel').style.display = 'none';
    });
    document.getElementById('comparePanelOverlay').addEventListener('click', () => {
        document.getElementById('comparePanel').style.display = 'none';
    });

    // 对比选择栏关闭按钮
    document.getElementById('compareBarClose').addEventListener('click', () => {
        compareList = [];
        compareMode = false;
        document.getElementById('compareModeBtn').classList.remove('active');
        document.getElementById('compareModeBtn').textContent = '📊 机型对比';
        updateCompareBar();
        document.getElementById('comparePanel').style.display = 'none';
        refresh();
    });

    // 键盘快捷键
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (compareList.length > 0) {
                compareList = [];
                updateCompareBar();
                document.getElementById('comparePanel').style.display = 'none';
                refresh();
            }
        }
    });

    // 回到顶部
    const backTop = document.getElementById('backTop');
    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.style.display = window.scrollY > 500 ? '' : 'none';
        }, { passive: true });
        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// 启动
loadData();
