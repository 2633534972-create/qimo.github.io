// ==================== 数据区 ====================

// 商品数据数组（共 9 个）
const products = [
  // 数码电子 (electronics) - 4 个
  {id:1, name:"iPhone 15 Pro", price:8999, category:"electronics", img:"iphone.jpg"},
  {id:2, name:"MacBook Air M2", price:8999, category:"electronics", img:"mac.jpg"},
  {id:8, name:"AirPods Pro 2", price:1899, category:"electronics", img:"airpods.jpg"},
  {id:9, name:"索尼 WH-1000XM5 降噪耳机", price:2399, category:"electronics", img:"sony.jpg"},

  // 服装鞋包 (clothing) - 2 个
  {id:3, name:"Nike 运动鞋", price:799, category:"clothing", img:"shoe.jpg"},
  {id:4, name:"卫衣 连帽衫", price:299, category:"clothing", img:"nike.jpg"},

  // 食品饮料 (food) - 2 个
  {id:5, name:"澳洲牛排礼盒", price:599, category:"food", img:"beef.jpg"},
  {id:6, name:"进口红酒", price:399, category:"food", img:"wine.jpg"},

  // 图书音像 (books) - 1 个
  {id:7, name:"《JavaScript高级程序设计》", price:89, category:"books", img:"book.jpg"},
];

// 购物车数据（从本地存储读取，或初始化为空数组）
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 获取 DOM 元素
const productList = document.getElementById('productList');     // 商品列表容器
const cartItemsEl = document.getElementById('cartItems');       // 购物车商品列表
const totalPriceEl = document.getElementById('totalPrice');     // 总价显示
const cartCountEl = document.getElementById('cartCount');       // 购物车角标

// ==================== 渲染商品 ====================

// 渲染商品列表（支持分类和搜索过滤）
function renderProducts(filter = 'all', keyword = '') {
  productList.innerHTML = '';  // 清空现有商品

  // 过滤商品：匹配分类 + 关键词
  const filtered = products.filter(p => {
    const matchCategory = filter === 'all' || p.category === filter;           // 是否匹配分类
    const matchKeyword = p.name.toLowerCase().includes(keyword.toLowerCase()); // 是否包含搜索词（不区分大小写）
    return matchCategory && matchKeyword;                                      // 必须都满足
  });

  // 遍历过滤后的商品，生成 HTML 卡片
  filtered.forEach(product => {
    const div = document.createElement('div');  // 创建商品容器
    div.className = 'product';                  // 设置类名

    // 设置商品 HTML 内容
    div.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="info">
        <h3>${product.name}</h3>
        <div class="price">¥${product.price.toFixed(2)}</div>
        <button onclick="addToCart(${product.id})">加入购物车</button>
      </div>
    `;
    productList.appendChild(div);  // 添加到页面
  });
}

// ==================== 搜索功能 ====================

// 点击搜索按钮时触发
function searchProducts() {
  const keyword = document.getElementById('searchInput').value.trim();           // 获取输入框内容并去除空格
  const activeCategory = document.querySelector('.filters button.active').dataset.category; // 获取当前激活分类
  renderProducts(activeCategory, keyword);  // 重新渲染
}

// ==================== 分类筛选 ====================

// 为所有分类按钮添加点击事件
document.getElementById('categoryFilters').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {  // 确保点击的是按钮
    // 移除所有按钮的 active 类
    document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
    // 为当前按钮添加 active 类
    e.target.classList.add('active');

    const category = e.target.dataset.category;  // 获取按钮的 data-category 属性
    const keyword = document.getElementById('searchInput').value.trim(); // 获取当前搜索词
    renderProducts(category, keyword);  // 重新渲染商品
  }
});

// ==================== 购物车操作 ====================

// 加入购物车
function addToCart(id) {
  const product = products.find(p => p.id === id);  // 根据 ID 查找商品
  const exist = cart.find(item => item.id === id);  // 检查是否已存在

  if (exist) {
    exist.qty += 1;  // 已存在则数量 +1
  } else {
    cart.push({ ...product, qty: 1 });  // 不存在则添加新项，数量为1
  }

  saveCart();        // 保存到本地存储
  updateCartUI();    // 更新购物车界面
  alert('已加入购物车！');  // 提示用户
}

// 更新购物车界面
function updateCartUI() {
  cartItemsEl.innerHTML = '';  // 清空现有内容
  let total = 0;               // 初始化总价

  // 遍历购物车每件商品
  cart.forEach(item => {
    total += item.price * item.qty;  // 累计总价

    // 创建购物车商品项
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="details">
        <div>${item.name}</div>
        <div>¥${item.price} × ${item.qty}</div>
      </div>
      <div class="qty">
        <button onclick="changeQty(${item.id}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <button style="margin-left:10px;background:#e74c3c" onclick="removeFromCart(${item.id})">×</button>
    `;
    cartItemsEl.appendChild(div);  // 添加到购物车
  });

  // 更新总价和角标
  totalPriceEl.textContent = `¥${total.toFixed(2)}`;
  cartCountEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0); // 计算总数
}

// 修改商品数量
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);  // 查找商品
  if (item) {
    item.qty += delta;  // 增加或减少数量
    if (item.qty <= 0) {
      removeFromCart(id);  // 数量为0时删除
    } else {
      saveCart();          // 保存
      updateCartUI();      // 更新界面
    }
  }
}

// 从购物车删除商品
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);  // 过滤掉该商品
  saveCart();
  updateCartUI();
}

// 清空购物车
function clearCart() {
  if (confirm('确定清空购物车吗？')) {  // 弹出确认框
    cart = [];           // 清空数组
    saveCart();          // 保存
    updateCartUI();      // 更新界面
  }
}

// 保存购物车到本地存储
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));  // 转为 JSON 字符串保存
}

// 切换购物车显示/隐藏
function toggleCart() {
  const cartEl = document.getElementById('cart');
  // 切换 display 样式
  cartEl.style.display = cartEl.style.display === 'block' ? 'none' : 'block';
  if (cartEl.style.display === 'block') {
    updateCartUI();  // 打开时刷新内容
  }
}

// ==================== 初始化 ====================

// 页面加载完成后执行
renderProducts();   // 首次渲染所有商品
updateCartUI();     // 恢复购物车状态


