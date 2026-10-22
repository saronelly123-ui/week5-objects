
import { orders } from "../../data.js";
import "./style.css";

const orderTotal = ({ items }) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0);

const delivered = orders.filter(
  (order) => order.status === "delivered"
);

const revenue = delivered.reduce(
  (sum, order) => sum + orderTotal(order), 0
);

const ratings = delivered
  .map((order) => order.rating)
  .filter((rating) => rating !== null);

const averageRating = (
  ratings.reduce((sum, rating) => sum + rating, 0) /
  ratings.length
).toFixed(1);

const districtRevenue = delivered.reduce((result, order) => {
  const district = order.customer.district;
  result[district] = (result[district] || 0) + orderTotal(order);
  return result;
}, {});

const itemSales = orders
  .flatMap((order) => order.items)
  .reduce((result, item) => {
    result[item.name] = (result[item.name] || 0) + item.qty;
    return result;
  }, {});

const bestItem = Object.entries(itemSales)
  .toSorted((a, b) => b[1] - a[1])[0][0];

const money = (amount) => `${amount.toLocaleString("en-US")} RWF`;

const statusClasses = {
  delivered: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700"
};

document.querySelector("#app").innerHTML = `
  <div class="min-h-screen md:grid md:grid-cols-[220px_1fr]">
    <aside class="bg-slate-900 p-6 text-white">
      <h1 class="text-2xl font-bold">🍽️ Kigali Eats</h1>
      <p class="mt-2 text-sm text-slate-400">Admin Dashboard</p>
      <nav class="mt-8 space-y-3">
        <p class="rounded-lg bg-indigo-600 p-3">📊 Overview</p>
        <p class="p-3 text-slate-300">🧾 Orders</p>
        <p class="p-3 text-slate-300">📍 Districts</p>
      </nav>
    </aside>

    <main class="min-w-0 p-5 md:p-8">
      <header class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          WEEKLY REPORT · OCTOBER 2026
        </p>
        <h2 class="mt-2 text-3xl font-bold text-slate-900">
          Dashboard Overview
        </h2>
        <p class="mt-2 text-slate-500">Welcome back! Here is your order summary.</p>
      </header>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Delivered Revenue</p>
          <p class="mt-3 text-2xl font-bold text-slate-900">${money(revenue)}</p>
          <p class="mt-2 text-sm text-emerald-600">From delivered orders</p>
        </article>
        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Delivered Orders</p>
          <p class="mt-3 text-3xl font-bold text-slate-900">${delivered.length}</p>
          <p class="mt-2 text-sm text-slate-500">Out of ${orders.length} total orders</p>
        </article>
        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Average Rating</p>
          <p class="mt-3 text-3xl font-bold text-slate-900">⭐ ${averageRating}</p>
          <p class="mt-2 text-sm text-slate-500">Customer feedback</p>
        </article>
        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Best-Selling Item</p>
          <p class="mt-3 text-2xl font-bold text-slate-900">${bestItem}</p>
          <p class="mt-2 text-sm text-slate-500">By quantity sold</p>
        </article>
      </section>

      <section class="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h3 class="text-xl font-bold text-slate-900">Revenue by District</h3>
        <p class="mt-1 text-sm text-slate-500">Delivered orders only</p>
        <div class="mt-6 space-y-5">
          ${Object.entries(districtRevenue).map(([district, value]) => `
            <div>
              <div class="mb-2 flex justify-between gap-3 text-sm">
                <span class="font-medium text-slate-700">${district}</span>
                <span class="font-semibold text-slate-900">${money(value)}</span>
              </div>
              <div class="h-3 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-indigo-600"
                  style="width: ${(value / Math.max(...Object.values(districtRevenue))) * 100}%">
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Recent Orders</h3>
            <p class="mt-1 text-sm text-slate-500">Manage and filter customer orders</p>
          </div>
          <div id="filters" class="flex flex-wrap gap-2">
            ${["all", "delivered", "pending", "cancelled"].map((status) => `
              <button data-status="${status}"
                class="filter-btn rounded-lg px-3 py-2 text-sm font-medium capitalize">
                ${status === "all" ? "All" : status}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="mt-6 overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="p-3">Order</th>
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
        Kigali Eats · Week 5 JavaScript Workshop
      </footer>
    </main>
  </div>
`;

// The orders are trusted local workshop data, so innerHTML is acceptable here.
const table = document.querySelector("#orders-table");
const count = document.querySelector("#order-count");
let activeStatus = "all";

function renderOrders() {
  const filteredOrders = orders.filter(
    (order) => activeStatus === "all" || order.status === activeStatus
  );

  table.innerHTML = filteredOrders.map((order) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="p-3 font-semibold text-slate-700">#${order.id}</td>
      <td class="p-3">${order.customer.name}</td>
      <td class="p-3">${order.customer.district}</td>
      <td class="whitespace-nowrap p-3 font-medium">${money(orderTotal(order))}</td>
      <td class="p-3">
        <span class="rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses[order.status]}">
          ${order.status}
        </span>
      </td>
    </tr>
  `).join("");

  count.textContent = `Showing ${filteredOrders.length} of ${orders.length} orders`;
}

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    activeStatus = button.dataset.status;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.className =
        "filter-btn rounded-lg px-3 py-2 text-sm font-medium capitalize " +
        (btn.dataset.status === activeStatus
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200");
    });

    renderOrders();
  });
});

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.className =
    "filter-btn rounded-lg px-3 py-2 text-sm font-medium capitalize " +
    (button.dataset.status === "all"
      ? "bg-indigo-600 text-white"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200");
});

renderOrders();
