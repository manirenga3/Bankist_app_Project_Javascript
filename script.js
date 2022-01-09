'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-12-20T17:01:17.194Z',
    '2021-12-23T23:36:17.929Z',
    '2021-12-25T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-IN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// ------------------------- Elements ----------------------------------
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// ---------------------------- Functions -------------------------------
const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear(0);
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (value, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const formattedMov = formatCurrency(
      Math.abs(mov),
      acc.locale,
      acc.currency
    );

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, inc) => acc + inc, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, out) => acc + out, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (acc.interestRate / 100))
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  //Display summary
  calcDisplaySummary(acc);
};

const hideUI = function () {
  labelWelcome.textContent = `Log in to get started`;
  containerApp.style.opacity = '0';
};

const clearInputFields = function (field1, field2 = '') {
  if (field2 === '') {
    field1.value = '';
    field1.blur();
  } else {
    field1.value = field2.value = '';
    field1.blur();
    field2.blur();
  }
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When time reaches 0, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      hideUI();
    }

    // Decrease 1 sec in ecah call
    time--;
  };

  // Set time to 10 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

// ------------------------ Event Handlers ----------------------------
let currentAccount, timer;

// Fake login
// currentAccount = account1;
// updateUI(account1);
// containerApp.style.opacity = '100';

// -------Login functionality
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  // Finding current accpunt
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  // Checking current account pin and then dispay details
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner
      .split(' ')
      .at(0)}`;
    containerApp.style.opacity = '100';

    // Date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      weekday: 'short',
    };
    const locale = navigator.language;
    // const date = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Update UI
    updateUI(currentAccount);
  } else {
    // Hide UI and message
    hideUI();

    // Alerting
    alert('Wrong Credentials Entered!');
  }

  // Clear input fields
  clearInputFields(inputLoginUsername, inputLoginPin);

  // Timer
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
});

// -------Transfer functionality
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  // Finding receiver account
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Clear input fields
  clearInputFields(inputTransferAmount, inputTransferTo);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add the date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }
});

// ------- Loan functionality
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add loan amount
      currentAccount.movements.push(amount);

      // Add the date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 3000);

    // Reset timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }

  // Clear input field
  clearInputFields(inputLoanAmount);
});

// ------- Close account functionality
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    // Finding index of account
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Deleting account
    accounts.splice(index, 1);

    // Hide UI and message
    hideUI();
  }

  // Clear input fields
  clearInputFields(inputCloseUsername, inputClosePin);
});

// ------- Sorting functionality
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
///////////////////////////////////////////////

/* /////////////////////////////////////////////////////////////////////
// Conerting and checking numbers
console.log(23 === 23.0);

// Base 10 -> 0 to 9
// Binary -> base 2 -> 0 and 1

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

//Conversion
console.log(Number('23'));
console.log(+'23');

// Parsing
console.log('--------Parsing----------');
console.log(Number.parseInt('30px'));
console.log(Number.parseInt('e23'));

console.log(Number.parseInt('  2.5rem  '));
console.log(Number.parseFloat('  2.5rem  '));

// Check if value is Nan
console.log('--------IsNan----------');
console.log(Number.isNaN(23));
console.log(Number.isNaN('23'));
console.log(Number.isNaN(+'23'));
console.log(Number.isNaN(23 / 0));

// Checking if value is number
console.log('--------IsFinite----------');
console.log(Number.isFinite(23));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(+'23'));
console.log(Number.isFinite(23 / 0));

console.log('--------IsInteger----------');
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
*/

/* ////////////////////////////////////////////////////////////////////
// Math and rounding
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(27 ** (1 / 3));

console.log(Math.max(5, 2, 4, 9, 7));
console.log(Math.max(5, 2, 4, '9', 7));

console.log(Math.min(2, 4, 5, 6, 1));

console.log(Math.PI);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(5, 10));

// Rounding Integers
console.log(Math.round(23.3));
console.log(Math.round(23.7));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.7));

console.log(Math.floor(23.3));
console.log(Math.floor(23.7));

console.log(Math.trunc(23.3));

console.log(Math.floor(-23.3));
console.log(Math.trunc(-23.3));

// Rounding decimals
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.745).toFixed(2));
console.log(+(2.745).toFixed(2));
*/

/* //////////////////////////////////////////////////////////////////////
// Remainder operator
console.log(5 % 2);
console.log(5 / 2);

console.log(8 % 3);
console.log(8 % 2);

const isEven = n => n % 2 === 0;
console.log(isEven(4));
console.log(isEven(46));
console.log(isEven(517));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = '#777';
  });
});
*/

/* ////////////////////////////////////////////////////////////////////
// Numeric seperators
const diameter = 287_460_000_000;
console.log(diameter);

const PI = 3.14_15;
console.log(PI);

console.log(Number('230_45'));
console.log(parseInt('230_45'));
*/

/* /////////////////////////////////////////////////////////////////////
// BigInt
// See this in Jonas Udemy video...
*/

/* /////////////////////////////////////////////////////////////////////
// Create a date
const now = new Date();
console.log(now);

console.log(new Date('December 26 2021'));
console.log(new Date(2021, 11, 26, 11, 52, 45));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.getTime());

console.log(future.toISOString());

console.log(Date.now());

future.setFullYear(2040);
console.log(future);
*/

/* ////////////////////////////////////////////////////////////////////
// Operation with dates
const calcDaysPassed = (date1, date2) =>
Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2021, 4, 17), new Date(2021, 11, 26));
console.log(days1);
*/

/* /////////////////////////////////////////////////////////////////////
// Internationalizing Dates
// See this in Jonas Udemy video...
*/

/* /////////////////////////////////////////////////////////////////////
// Internationalizing Dates
// See this in Jonas Udemy video...
*/

/* ////////////////////////////////////////////////////////////////////
// Timers
// Set Timeout
const ingredients = ['olive', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);

console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// Set Interval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/
