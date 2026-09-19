const API_URL = "https://script.google.com/macros/s/AKfycbw5_byEvtyzlGE9YxmHtWhpQ0Cvb4o-SfMGdgD1HwoTAnCDBp3EeyRKOcnnHVw8zsOK8g/exec";
const MY_STORE_PHONE = "201009802275";

const fallbackProducts = [
  {
    id: 1,
    title: "عود صيد كربون تليسكوب 5.4 متر",
    price: 480,
    badge: "الأكثر مبيعاً",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80",
    description: "مصنوع من ألياف الكربون X45 عالية الصلابة، خفيف الوزن وتصميم تليسكوبي متين مخصص لصيد الأنهار والبحيرات."
  },
  {
    id: 2,
    title: "عوامة صيد ذكية مضيئة LED (شحن USB)",
    price: 120,
    badge: "جديد",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
    description: "عوامة صيد ذكية بمستشعر حركي يتغير لونها للأسود/الأحمر عند السحب، تأتي مع بطارية قابلة لإعادة الشحن وشاحن USB."
  },
  {
    id: 3,
    title: "ماكينة صيد ريموندا سعة عالية 6000",
    price: 350,
    badge: "خصم خاص",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80",
    description: "ماكينة صيد هاف ديوتي بتروس نحاسية ناعمة وسحّاب خلفي قوي لتسهيل الصيد الثقيل."
  }
];

let allProducts = [];
let cart = [];

// 1. جلب وعرض المنتجات
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Network error");
    const products = await res.json();
    allProducts = (products && products.length > 0) ? products : fallbackProducts;
  } catch (err) {
    allProducts = fallbackProducts;
  }
  displayProducts(allProducts);
}

function displayProducts(products) {
  const container = document.getElementById('products-list');
  container.innerHTML = '';

  products.forEach((p, index) => {
    container.innerHTML += `
      <div class="card">
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
        <img src="${p.image || 'https://via.placeholder.com/300'}" alt="${p.title}">
        <div class="card-body">
          <h3>${p.title}</h3>
          <div class="price-tag">${p.price} <span>ج.م</span></div>

          <!-- التحكم بالكمية من بره -->
          <div class="card-qty-control">
            <label>الكمية:</label>
            <div class="qty-picker">
              <button type="button" onclick="changeCardQty(${index}, -1)">-</button>
              <input type="number" id="qty-input-${index}" value="1" min="1" readonly>
              <button type="button" onclick="changeCardQty(${index}, 1)">+</button>
            </div>
          </div>

          <!-- الأزرار الرئيسية المباشرة من بره -->
          <div class="card-actions">
            <button class="btn btn-add" onclick="addToCartDirect(${index})">➕ إضافة للسلة ومتابعة التسوق</button>
            <button class="btn btn-checkout" onclick="checkoutDirect(${index})">🛒 الذهاب للسلة وإتمام الطلب</button>
            <button class="btn btn-details" onclick="openProductModal(${index})">👁️ عرض التفاصيل</button>
          </div>
        </div>
      </div>
    `;
  });
}

function changeCardQty(index, amount) {
  const input = document.getElementById(`qty-input-${index}`);
  let current = parseInt(input.value) || 1;
  current += amount;
  if (current < 1) current = 1;
  input.value = current;
}

// 2. إضافات المنتجات والتأثيرات
function addToCartDirect(index) {
  const qty = parseInt(document.getElementById(`qty-input-${index}`).value) || 1;
  const prod = allProducts[index];

  const existingIndex = cart.findIndex(item => item.title === prod.title);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ title: prod.title, price: prod.price, qty: qty });
  }

  updateCartBadge();
  triggerCartGlowEffect();
  showToast(`تمت إضافة ${qty} × "${prod.title}" إلى السلة!`);
}

function checkoutDirect(index) {
  addToCartDirect(index);
  openCartModal();
}

function triggerCartGlowEffect() {
  const cartBtn = document.getElementById('cart-header-btn');
  cartBtn.classList.add('glow-effect');
  setTimeout(() => { cartBtn.classList.remove('glow-effect'); }, 1200);
}

// 3. نافذة التفاصيل فقط
function openProductModal(index) {
  const prod = allProducts[index];
  document.getElementById('modalProductImage').src = prod.image || 'https://via.placeholder.com/300';
  document.getElementById('modalProductTitle').innerText = prod.title;
  document.getElementById('modalProductDesc').innerText = prod.description || 'لا يوجد وصف إضافي حالياً.';
  document.getElementById('modalProductPrice').innerText = `${prod.price} ج.م`;
  document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
}

// 4. إدارة السلة وتأثيرات الشحن التفاعلية
function openCartModal() {
  renderCartItems();
  updateCartTotal();
  document.getElementById('cartModal').style.display = 'flex';
}

function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').innerText = totalCount;
}

function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#64748b; padding:15px;">السلة فارغة حالياً</p>';
    return;
  }

  container.innerHTML = '';
  cart.forEach((item, idx) => {
    container.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.title}</strong><br>
          <small>${item.price} ج.م × ${item.qty} = ${item.price * item.qty} ج.م</small>
        </div>
        <button class="remove-item-btn" onclick="removeFromCart(${idx})">🗑️ حذف</button>
      </div>
    `;
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderCartItems();
  updateCartTotal();
}

// تبديل اختيار بطاقة الشحن
function selectShippingType(type) {
  document.querySelectorAll('.shipping-card').forEach(card => card.classList.remove('active'));
  
  if (type === 'door') {
    document.getElementById('card-door').classList.add('active');
    document.querySelector('input[name="shippingType"][value="door"]').checked = true;
  } else {
    document.getElementById('card-post').classList.add('active');
    document.querySelector('input[name="shippingType"][value="post"]').checked = true;
  }
  updateCartTotal();
}

// حساب الشحن والتحديث التفاعلي
function updateCartTotal() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('subtotal-val').innerText = subtotal;

  const freeThreshold = 1000;
  const progressPercent = Math.min((subtotal / freeThreshold) * 100, 100);
  const progressBar = document.getElementById('free-shipping-progress');
  const freeMsg = document.getElementById('free-shipping-msg');

  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  if (subtotal >= freeThreshold) {
    if (freeMsg) freeMsg.innerHTML = "🎉 مبروك! حصلت على شحن مجاني لطلبك!";
  } else {
    const remain = freeThreshold - subtotal;
    if (freeMsg) freeMsg.innerHTML = `💡 أضف منتجات بقيمة <strong>${remain} ج.م</strong> إضافية للحصول على شحن مجاني!`;
  }

  const govSelect = document.getElementById('shippingGov');
  const selectedOption = govSelect.options[govSelect.selectedIndex];
  const shippingType = document.querySelector('input[name="shippingType"]:checked').value;
  const liveInfoBox = document.getElementById('shipping-live-info');
  const liveInfoText = document.getElementById('shipping-live-text');

  let shippingCost = 0;

  if (selectedOption && selectedOption.value !== "") {
    if (subtotal >= freeThreshold) {
      shippingCost = 0;
      if (liveInfoBox) {
        liveInfoBox.style.display = 'flex';
        liveInfoText.innerText = `الشحن مجاني بالكامل إلى محافظة ${selectedOption.value}! 🎁`;
      }
    } else if (shippingType === 'post') {
      shippingCost = 45;
      if (liveInfoBox) {
        liveInfoBox.style.display = 'flex';
        liveInfoText.innerText = `استلام من أقرب مكتب بريد بـ ${selectedOption.value} (رسوم ثابتة: 45 ج.م)`;
      }
    } else {
      shippingCost = parseInt(selectedOption.getAttribute('data-door')) || 0;
      if (liveInfoBox) {
        liveInfoBox.style.display = 'flex';
        liveInfoText.innerText = `توصيل مباشر لباب البيت في ${selectedOption.value} (التكلفة: ${shippingCost} ج.م)`;
      }
    }
  } else {
    if (liveInfoBox) liveInfoBox.style.display = 'none';
  }

  document.getElementById('shipping-val').innerText = shippingCost;
  document.getElementById('grandtotal-val').innerText = subtotal + shippingCost;
}

// 5. إرسال الطلب عبر الواتساب
async function submitOrder(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("⚠️ السلة فارغة!");
    return;
  }

  const govSelect = document.getElementById('shippingGov');
  if (!govSelect.value) {
    alert("⚠️ يرجى اختيار المحافظة.");
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = "جاري إرسال الطلب...";

  const custName = document.getElementById('custName').value;
  const custPhone = document.getElementById('custPhone').value;
  const custGov = govSelect.value;
  const custAddress = document.getElementById('custAddress').value;
  const shippingType = document.querySelector('input[name="shippingType"]:checked').value === 'post' ? 'أقرب مكتب بريد' : 'باب البيت';

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shippingCost = parseInt(document.getElementById('shipping-val').innerText);
  const grandTotal = subtotal + shippingCost;

  let productsSummary = cart.map(i => `• ${i.title} (الكمية: ${i.qty}) - ${i.price * i.qty} ج.م`).join('\n');

  const orderData = {
    name: custName,
    phone: custPhone,
    governorate: custGov,
    address: custAddress,
    orderDetails: productsSummary,
    subtotal: subtotal,
    shippingCost: shippingCost,
    grandTotal: grandTotal,
    shippingType: shippingType
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const whatsappMsg = encodeURIComponent(
      `مرحباً، أود تأكيد طلب الشراء التالي من متجر *مستورد أدوات صيد* 🎣:\n\n` +
      `👤 *الاسم:* ${custName}\n` +
      `📱 *الهاتف:* ${custPhone}\n` +
      `📍 *المحافظة:* ${custGov}\n` +
      `🏠 *العنوان:* ${custAddress}\n` +
      `🚚 *طريقة الشحن:* ${shippingType}\n\n` +
      `📦 *المنتجات المطلوبة:*\n${productsSummary}\n\n` +
      `💵 *إجمالي المنتجات:* ${subtotal} ج.م\n` +
      `🚚 *مصاريف الشحن:* ${shippingCost} ج.م\n` +
      `💰 *الإجمالي النهائي المطلوب:* ${grandTotal} ج.م`
    );

    window.open(`https://wa.me/${MY_STORE_PHONE}?text=${whatsappMsg}`, '_blank');

    cart = [];
    updateCartBadge();
    closeCartModal();
    document.getElementById('orderForm').reset();

  } catch (err) {
    alert('⚠️ حدث خطأ أثناء الإرسال.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "📲 تأكيد وإرسال الطلب عبر الواتساب";
  }
}

// 🕒 العداد التنازلي
function startTimer() {
  let duration = 5 * 3600;
  const timerDisplay = document.getElementById('timer');
  setInterval(() => {
    let hours = parseInt(duration / 3600, 10);
    let minutes = parseInt((duration % 3600) / 60, 10);
    let seconds = parseInt(duration % 60, 10);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (timerDisplay) timerDisplay.textContent = hours + ":" + minutes + ":" + seconds;

    if (--duration < 0) duration = 5 * 3600;
  }, 1000);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').innerText = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

loadProducts();
startTimer();