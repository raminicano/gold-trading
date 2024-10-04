const fs = require('fs');
const { faker } = require('@faker-js/faker');

// 날짜 범위 지정: 2024년 5월 1일부터 2024년 9월 30일까지
const fromDate = new Date('2024-05-01');
const toDate = new Date('2024-09-30');


function generateOrderId(username, date) {
  const year = date.getFullYear().toString().slice(2, 4);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const userPart = username.substring(0, 2).toLowerCase();
  const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${day}-${userPart}-${randomCode}`;
}
// 더미 주문 데이터 300개 생성
const orders = [];
for (let i = 0; i < 300; i++) {
  const username = 'yunju';  // User 이름 고정
  const orderDate = faker.date.between({ from: fromDate, to: toDate }); // 날짜 범위 내 무작위 날짜 생성
  const orderId = generateOrderId(username, orderDate);  // 주문번호 생성
  const status = faker.helpers.arrayElement(['주문 완료', '입금 완료', '발송 완료']);  // 주문 상태 무작위 선택
  const itemId = faker.helpers.arrayElement([1, 2]);  // itemId는 1 또는 2
  const price = itemId === 1 ? 52500 : 57750;  // itemId에 따른 가격 설정
  const quantity = faker.finance.amount(1, 100, 2);  // 1~100 사이의 랜덤 quantity, 소수점 2자리까지
  const amount = (quantity * price).toFixed(2);  // amount 계산
  const formattedOrderDate = orderDate.toISOString().split('T')[0] + ' ' + faker.date.recent().toTimeString().split(' ')[0];  // 무작위 날짜와 시간 생성
  const deliveryAddress = faker.address.streetAddress();  // 무작위 주소 생성
  const deletedAt = null;  // Soft delete는 null로 설정

  orders.push({
    orderId,
    userId: 3, // userId 고정
    status,
    itemId,
    quantity,
    price,
    amount,
    orderDate,
    deliveryAddress,
  });
}

// SQL 파일로 저장
const sqlInsertStatements = orders.map(order => {
    return `INSERT INTO buy_order (orderId, userId, status, itemId, quantity, price, amount, orderDate, deliveryAddress) VALUES ('${order.orderId}', ${order.userId}, '${order.status}', ${order.itemId}, ${order.quantity}, ${order.price}, ${order.amount}, '${order.orderDate.toISOString().slice(0, 19).replace('T', ' ')}', '${order.deliveryAddress}');`;
  }).join('\n');

// SQL 파일로 저장
fs.writeFileSync('dummy_orders.sql', sqlInsertStatements);
console.log('더미 데이터 생성 완료');
