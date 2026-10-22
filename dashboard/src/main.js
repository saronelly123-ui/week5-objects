
import { orders } from "../../data.js";
import "./style.css";

// Calculate the total price of an order
const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0);

// Dashboard statistics
const delivered = orders.filter(
  ({ status }) => status === "delivered"
);

const revenue = delivered.reduce(
  (sum, order) => sum + orderTotal(order),
  0
);

const ratings = delivered
  .map(({ rating }) => rating)
  .filter((rating) => rating !== null);

const averageRating = ratings.length
  ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
  : "0.0";

// Revenue by district
const districtRevenue = delivered.reduce((result, order) => {
  const district = order.customer.district;

  return {
    ...result,
    [district]: (result[district] || 0) + orderTotal(order)
  };
}, {});

const maxRevenue = Math.max(...Object.values(districtRevenue), 1);

// Best-selling item by quantity
const itemSales = orders
  .flatMap(({ items }) => items)
  .reduce((result, { name, qty }) => ({
    ...result,
    [name]: (result[name] || 0) + qty
  }), {});

const bestItem = Object.entries(itemSales)
  .toSorted((a, b) => b[1] - a[1])[0];

const money = (amount) =>
  `${amount.toLocaleString("en-US")} RWF`;

const statusClasses = {
  delivered: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700"
};

// Render dashboard
document.querySelector("#app").innerHTML = `
  <div class="min-h-screen md:grid md:grid-cols-[220px_minmax(0,1fr)]">

    <aside class="bg-slate-900 p-6 text-white">
      <h1 class="text-2xl font-extrabold">🍽️ Kigali Eats</h1>
      <p class="mt-2 text-sm text-slate-400">Admin Dashboard</p>

      <nav class="mt-8 space-y-3">
        <a href="#overview"
          class="block rounded-lg bg-indigo-600 p-3 font-medium">
          📊 Overview
        </a>
        <a href="#orders"
          class="block rounded-lg p-3 text-slate-300 hover:bg-slate-800">
          🧾 Orders
        </a>
        <a href="#districts"
          class="block rounded-lg p-3 text-slate-300 hover:bg-slate-800">
          📍 Districts
        </a>
      </nav>

      <div class="mt-10 rounded-xl bg-slate-800 p-4">
        <p class="font-semibold">Kigali, Rwanda</p>
        <p class="mt-1 text-sm text-slate-400">Food delivery overview</p>
      </div>
    </aside>

    <main id="overview" class="min-w-0 p-5 md:p-8">

      <header class="mb-8">
        <p class="text-sm font-bold uppercase tracking-widest text-indigo-600">
          WEEK 5 · OCTOBER 2026
        </p>
        <h2 class="mt-2 text-3xl font-extrabold text-slate-900">
          Dashboard Overview
        </h2>
        <p class="mt-2 text-slate-500">
          Welcome back! Here is your order summary.
        </p>
      </header>

      <!-- Statistics cards -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Delivered Revenue</p>
          <p class="mt-3 text-2xl font-extrabold text-slate-900">
            ${money(revenue)}
          </p>
          <p class="mt-2 text-sm text-emerald-600">✓ Completed orders</p>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Delivered Orders</p>
          <p class="mt-3 text-3xl font-extrabold text-slate-900">
            ${delivered.length}
          </p>
          <p class="mt-2 text-sm text-slate-500">
            Out of ${orders.length} orders
          </p>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Average Rating</p>
          <p class="mt-3 text-3xl font-extrabold text-slate-900">
            ⭐ ${averageRating}
          </p>
          <p class="mt-2 text-sm text-slate-500">Customer feedback</p>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Best-Selling Item</p>
          <p class="mt-3 text-2xl font-extrabold text-slate-900">
            ${bestItem ? bestItem[0] : "N/A"}
          </p>
          <p class="mt-2 text-sm text-slate-500">
            ${bestItem ? `${bestItem[1]} items sold` : "No sales yet"}
          </p>
        </article>

      </section>

      <!-- District revenue chart -->
      <section id="districts" class="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h3 class="text-xl font-bold text-slate-900">Revenue by District</h3>
        <p class="mt-1 text-sm text-slate-500">
          Revenue from delivered orders only
        </p>

        <div class="mt-6 space-y-6">
          ${Object.entries(districtRevenue).map(([district, value]) => `
            <div>
              <div class="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                <span class="font-semibold text-slate-700">${district}</span>
                <span class="font-bold text-slate-900">${money(value)}</span>
              </div>

              <div class="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-indigo-600"
                  style="width: ${(value / maxRevenue) * 100}%">
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <!-- Orders table and filters -->
      <section id="orders" class="mt-8 rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Recent Orders</h3>
            <p class="mt-1 text-sm text-slate-500">
              View orders by status
            </p>
          </div>

          <div id="filters" class="flex flex-wrap gap-2">
            ${["all", "delivered", "pending", "cancelled"].map((status) => `
              <button
                type="button"
                data-status="${status}"
                class="filter-btn rounded-lg px-3 py-2 text-sm font-semibold capitalize">
                ${status === "all" ? "All" : status}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[650px] text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="p-3">Order ID</th>
                <th class="p-3">Customer</th>
                <th class="p-3">District</th>
                <th class="p-3">Total</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody id="orders-table"></tbody>
          </table>
        </div>

        <p id="order-count" class="mt-4 text-sm text-slate-500"></p>
      </section>

      <footer class="py-8 text-center text-sm text-slate-400">
        Kigali Eats Dashboard · Week 5 JavaScript Workshop
      </footer>
    </main>
  </div>
`;

// innerHTML is acceptable here because this workshop uses trusted local data.
const table = document.querySelector("#orders-table");
const count = document.querySelector("#order-count");
const filterButtons = document.querySelectorAll(".filter-btn");

let activeStatus = "all";

function renderOrders() {
  const filteredOrders = orders.filter(
    ({ status }) => activeStatus === "all" || status === activeStatus
  );

  table.innerHTML = filteredOrders.map((order) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="p-3 font-bold text-slate-700">#${order.id}</td>
      <td class="p-3 text-slate-700">${order.customer.name}</td>
      <td class="p-3 text-slate-600">${order.customer.district}</td>
      <td class="whitespace-nowrap p-3 font-semibold text-slate-800">
        ${money(orderTotal(order))}
      </td>
      <td class="p-3">
        <span class="rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClasses[order.status]}">
          ${order.status}
        </span>
      </td>
    </tr>
  `).join("");

  count.textContent =
    `Showing ${filteredOrders.length} of ${orders.length} orders`;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.status === activeStatus;

    button.className =
      "filter-btn rounded-lg px-3 py-2 text-sm font-semibold capitalize " +
      (isActive
        ? "bg-indigo-600 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200");
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeStatus = button.dataset.status;
    updateFilterButtons();
    renderOrders();
  });
});

updateFilterButtons();
renderOrders();
