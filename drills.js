
import { orders } from "./data.js";

const ORIGINAL = JSON.stringify(orders);

// 1. Get all order IDs
const orderIds = orders.map(({ id }) => id);
console.log("1. Order IDs:", orderIds);

// 2. Get all customer names
const customerNames = orders.map(
  ({ customer }) => customer.name
);
console.log("2. Customer names:", customerNames);

// 3. Get all delivered orders
const deliveredOrders = orders.filter(
  ({ status }) => status === "delivered"
);
console.log("3. Delivered orders:", deliveredOrders);

// 4. Get all orders from Gasabo
const gasaboOrders = orders.filter(
  ({ customer }) => customer.district === "Gasabo"
);
console.log("4. Gasabo orders:", gasaboOrders);

// Check that the original data has not changed
console.log(
  "Original data unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

 // 5. Find the order with ID 106
const order106 = orders.find(({ id }) => id === 106);
console.log("5. Order 106:", order106);

// 6. Does any order have a rating of 3 or lower?
const hasLowRating = orders.some(
  ({ rating }) => rating !== null && rating <= 3
);
console.log("6. Has rating <= 3:", hasLowRating);

// 7. Are all pending orders unrated?
const pendingOrders = orders.filter(
  ({ status }) => status === "pending"
);
const allPendingUnrated = pendingOrders.every(
  ({ rating }) => rating === null
);
console.log("7. All pending orders unrated:", allPendingUnrated);

// 8. Get unique customer names
const uniqueNames = [
  ...new Set(orders.map(({ customer }) => customer.name))
];
console.log("8. Unique customer names:", uniqueNames);

// Check original data
console.log(
  "Original data unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

 // STATION 2 — Calculations with reduce

// Helper: calculate the total price of one order
const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0);

// 9. Add total to every order without changing original data
const ordersWithTotal = orders.map((order) => ({
  ...order,
  total: orderTotal(order)
}));
console.log("9. Orders with total:", ordersWithTotal);

// 10. Total revenue from delivered orders
const totalRevenue = orders
  .filter(({ status }) => status === "delivered")
  .reduce((sum, order) => sum + orderTotal(order), 0);
console.log("10. Delivered revenue:", totalRevenue);

// 11. Average rating, ignoring null values
const ratedOrders = orders.filter(({ rating }) => rating !== null);
const averageRating = Number(
  (
    ratedOrders.reduce((sum, { rating }) => sum + rating, 0) /
    ratedOrders.length
  ).toFixed(1)
);
console.log("11. Average rating:", averageRating);

// 12. Total quantity of Brochettes sold
const brochettesSold = orders
  .flatMap(({ items }) => items)
  .filter(({ name }) => name === "Brochette")
  .reduce((sum, { qty }) => sum + qty, 0);
console.log("12. Brochettes sold:", brochettesSold);

// 13. The most expensive order
const mostExpensiveOrder = ordersWithTotal.reduce(
  (highest, order) =>
    order.total > highest.total ? order : highest
);
console.log("13. Most expensive order:", mostExpensiveOrder);

// 14. Count orders by status
const ordersByStatus = orders.reduce((counts, { status }) => ({
  ...counts,
  [status]: (counts[status] || 0) + 1
}), {});
console.log("14. Orders by status:", ordersByStatus);

// Verify original data remains unchanged
console.log(
  "Original data unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

 // STATION 3 — Grouping & Ranking

// 15. Revenue per district from delivered orders
const revenueByDistrict = orders
  .filter(({ status }) => status === "delivered")
  .reduce((result, order) => {
    const { district } = order.customer;
    return {
      ...result,
      [district]: (result[district] || 0) + orderTotal(order)
    };
  }, {});
console.log("15. Revenue by district:", revenueByDistrict);

// 16. Group orders by date
const groupedByDate = Object.groupBy(
  orders,
  ({ date }) => date
);

const dailySummary = Object.entries(groupedByDate).map(
  ([date, dailyOrders]) => ({
    date,
    count: dailyOrders.length,
    revenue: dailyOrders
      .filter(({ status }) => status === "delivered")
      .reduce((sum, order) => sum + orderTotal(order), 0)
  })
);
console.log("16. Daily summary:", dailySummary);

// 17. Top 3 best-selling items by quantity
const topItems = orders
  .flatMap(({ items }) => items)
  .reduce((result, { name, qty }) => ({
    ...result,
    [name]: (result[name] || 0) + qty
  }), {});

const topThreeItems = Object.entries(topItems)
  .map(([name, qty]) => ({ name, qty }))
  .toSorted((a, b) => b.qty - a.qty)
  .slice(0, 3);

console.log("17. Top 3 items:", topThreeItems);

// 18. Each customer's order count and total spent
const customerSummary = Object.values(
  orders.reduce((result, order) => {
    const name = order.customer.name;
    const previous = result[name] || {
      name,
      orders: 0,
      spent: 0
    };

    return {
      ...result,
      [name]: {
        name,
        orders: previous.orders + 1,
        spent: previous.spent + orderTotal(order)
      }
    };
  }, {})
)
  .toSorted((a, b) => b.spent - a.spent);

console.log("18. Customer summary:", customerSummary);

// 19. Menu price list
const menuPrices = Object.fromEntries(
  orders
    .flatMap(({ items }) => items)
    .map(({ name, price }) => [name, price])
);

console.log("19. Menu prices:", menuPrices);

// Verify original data
console.log(
  "Original data unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

 // STATION 4 — Immutable Updates

// 20. Mark a pending order as delivered
const markDelivered = (orders, id) =>
  orders.map((order) =>
    order.id === id && order.status === "pending"
      ? { ...order, status: "delivered" }
      : order
  );

console.log("20. Mark delivered:", markDelivered(orders, 105));

// 21. Rate only delivered orders
const rateOrder = (orders, id, rating) =>
  orders.map((order) =>
    order.id === id && order.status === "delivered"
      ? { ...order, rating }
      : order
  );

console.log("21. Rate order:", rateOrder(orders, 101, 4));

// 22. Change customer's district
const changeDistrict = (orders, id, district) =>
  orders.map((order) =>
    order.id === id
      ? {
          ...order,
          customer: { ...order.customer, district }
        }
      : order
  );

console.log(
  "22. Change district:",
  changeDistrict(orders, 101, "Kicukiro")
);

// 23. Add an item to an order
const addItem = (orders, id, item) =>
  orders.map((order) =>
    order.id === id
      ? { ...order, items: [...order.items, item] }
      : order
  );

console.log(
  "23. Add item:",
  addItem(orders, 101, { name: "Water", price: 500, qty: 1 })
);

// 24. Remove cancelled orders
const removeCancelled = (orders) =>
  orders.filter(({ status }) => status !== "cancelled");

console.log("24. Without cancelled:", removeCancelled(orders));

// 25. Apply discount to every item price
const applyDiscount = (orders, percent) =>
  orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      price: Math.round(item.price * (1 - percent / 100))
    }))
  }));

console.log("25. 10% discount:", applyDiscount(orders, 10));

// Final immutability check
console.log(
  "Original data unchanged:",
  JSON.stringify(orders) === ORIGINAL
);
