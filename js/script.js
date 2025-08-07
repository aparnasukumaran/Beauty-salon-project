//NAV
document.addEventListener("DOMContentLoaded", function () {
    const navbarCollapse = document.getElementById("collapsibleNavbar");
    const menuIcon = document.getElementById("menu-icon");

    navbarCollapse.addEventListener("show.bs.collapse", function () {
        menuIcon.classList.remove("bi-list");
        menuIcon.classList.add("bi-x");
    });

    navbarCollapse.addEventListener("hide.bs.collapse", function () {
        menuIcon.classList.remove("bi-x");
        menuIcon.classList.add("bi-list");
    });
});

// ________________________________________________________________________________________

//CALENDAR
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const calendarGrid = document.getElementById('calendarGrid');
const monthYear = document.getElementById('monthYear');
const defaultWeekdaySlots = ['10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm', '12:30pm'];


let currentDate = new Date();

function generateCalendar(date) {
    calendarGrid.innerHTML = '';

    // Add day names
    daysOfWeek.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'day-name';
        dayEl.textContent = day;
        calendarGrid.appendChild(dayEl);
    });

    const year = date.getFullYear();
    const month = date.getMonth();

    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill blank days
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        calendarGrid.appendChild(empty);
    }

    // Fill actual days
    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = day;

        // check if this day is in the past
        const ispast =
            year < today.getFullYear() ||
            (year === today.getFullYear() && month < today.getMonth()) ||
            (year === today.getFullYear() && month === today.getMonth() && day < today.getDate());

        if (ispast) {
            dayEl.classList.add('disabled');
        } else {

            // Check if the current day is a weekday (Mon-Fri)
            const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sun, 6 = Sat
            const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

            if (isWeekday) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dayEl.appendChild(dot);
            }

            const MAX_INITIAL_SLOTS = 2;


            dayEl.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                dayEl.classList.add('selected');
                document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));


                // Show availability box
                const availabilityBox = document.getElementById('availabilityBox');
                availabilityBox.style.display = 'block';

                const selectedDateObj = new Date(year, month, day);
                const readable = selectedDateObj.toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                });
                const slotKey = selectedDateObj.toISOString().split('T')[0];

                document.getElementById('availabilityTitle').innerText = `Availability for ${readable}`;


                const selectedDayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 6 = Saturday
                const isWeekday = selectedDayOfWeek >= 1 && selectedDayOfWeek <= 5;

                const slots = isWeekday ? defaultWeekdaySlots : [];
                const timeSlotContainer = document.querySelector('.timeslots');
                timeSlotContainer.innerHTML = ''; // clear previous

                const showLink = document.getElementById('showLink');

                if (slots.length > 0) {
            
                    slots.slice(0, MAX_INITIAL_SLOTS).forEach(time => {
                        const btn = createSlotButton(time);
                        timeSlotContainer.appendChild(btn);
                    });

                    // Show "Show all" only if there's more
                    if (slots.length > MAX_INITIAL_SLOTS) {
                        showLink.style.display = 'inline';

                        showLink.onclick = (e) => {
                            e.preventDefault();
                        
                            slots.slice(MAX_INITIAL_SLOTS).forEach(time => {
                                const btn = createSlotButton(time);
                                timeSlotContainer.appendChild(btn);
                            });
                            showLink.style.display = 'none'; 
                        };
                    } else {
                        showLink.style.display = 'none';
                    }
                } else {
                    timeSlotContainer.innerHTML = `
                    <div id="nodate">No availability for this date.</div>
                    <button id="nextAvailabilityBtn" class="btn">Check Next Availability
                    </button>
                    `;
                    showLink.style.display = 'none';
                }
                const nextBtn = document.getElementById('nextAvailabilityBtn');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        let nextDate = new Date(year, month, day);
                        nextDate.setDate(nextDate.getDate() + 1);

                        // Skip weekends
                        while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
                            nextDate.setDate(nextDate.getDate() + 1);
                        }

                        const nextYear = nextDate.getFullYear();
                        const nextMonth = nextDate.getMonth();
                        const nextDay = nextDate.getDate();

                        // Re-trigger - a new month
                        if (nextMonth !== month) {
                            currentDate.setMonth(nextMonth);
                            currentDate.setFullYear(nextYear);
                            generateCalendar(currentDate); 
                        }

                        // select the next available day
                        setTimeout(() => {
                            const nextDayEl = Array.from(document.querySelectorAll('.day')).find(el => {
                                return el.textContent == nextDay && !el.classList.contains('disabled');
                            });

                            if (nextDayEl) {
                                nextDayEl.click();
                            } else {
                                alert("Next weekday found but not rendered in calendar.");
                            }
                        }, 100); 
                    });
                }

            });

            // create a time slot button
            function createSlotButton(time) {
                const btn = document.createElement('button');
                btn.className = 'slot';
                btn.innerText = time;

                btn.addEventListener('click', () => {
                    // Deselect other slots
                    document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                    btn.classList.add('selected');

                    //  Get selected date from the calendar
                    const selectedDayEl = document.querySelector('.day.selected');
                    if (selectedDayEl) {
                        const selectedDay = parseInt(selectedDayEl.textContent);
                        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);

                        const fullDateString = selectedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        //  Update booking summary
                        const summaryBox = document.getElementById('bookingSummary');
                        const appointmentTime = document.getElementById('appointmentTime');
                        const detailBox = document.getElementById('detailBox');

                        appointmentTime.innerText = `${fullDateString} at ${time}`;
                        summaryBox.style.display = 'block';
                        detailBox.style.display = 'block';
                    }
                });

                return btn;
            }
        }
        calendarGrid.appendChild(dayEl);
    }
}



function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
}

generateCalendar(currentDate);

// ________________________________________________________________________________________

//TIME ZONE
function selectTimeZone(el, label, event) {
    event.preventDefault();

    const btn = document.getElementById('timezoneBtn');
    btn.innerText = 'Time zone: ' + label;

    const menu = document.getElementById('dropdownMenu');
    const items = document.querySelectorAll('.dropdown-item');
    items.forEach(item => item.classList.remove('active'))

    const item = el;
    if (item) item.classList.add('active');
}

// _________________________________________________________________________________________________

// FORM
document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let isValid = true;

  
    document.getElementById('nameError').textContent = '';
    document.getElementById('secondNameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('messageError').textContent = '';

    // first Name validation
    const name = document.getElementById('name').value.trim();
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(name)) {
        document.getElementById('nameError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Enter a first name.';
        isValid = false;
    }

    // second name validation
    const secondName = document.getElementById('secondName').value.trim();
    const secondnamePattern = /^[A-Za-z\s]+$/;
    if (!secondnamePattern.test(secondName)) {
        document.getElementById('secondNameError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Enter a second name';
        isValid = false;
    }

    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address.';
        isValid = false;
    }

    // Msg validation
    const message = document.getElementById('message').value.trim();
    if (message.trim() === '') {
        document.getElementById('messageError');
        isValid = false;
    }

    if (!isValid) return;

//   toast msg
    const toast = document.getElementById("toastMessage");
    const overlay = document.getElementById("overlay_two");

    overlay.style.display = "block";
    toast.classList.add("show");

    this.reset();

    setTimeout(() => {
        toast.classList.remove("show");
        overlay.style.display = "none"
    }, 3000);
});

// ________________________________________________________________________________________

// scroll navbar
window.addEventListener("scroll", function () {
    const navbar = document.getElementById("mainNavbar");
    if (window.scrollY > 10) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// ________________________________________________________________________________________

// CART
document.addEventListener('DOMContentLoaded', function () {
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const body = document.body;
    const cartCount = document.querySelector('#cart-icon .badge');

    cartIcon.addEventListener('click', function (event) {
        event.preventDefault();

        const itemCount = parseInt(cartCount.textContent, 10);

        if (itemCount === 0) {
            overlay.style.display = 'block';
            cartModal.style.display = 'block';


            body.style.overflow = 'hidden';
        } else {

            window.location.href = 'cart.html';
        }
    });
    const closeModal = document.getElementById('close-cart-modal');

    closeModal.addEventListener('click', function () {
        overlay.style.display = 'none';
        cartModal.style.display = 'none';
        body.style.overflow = '';

    });

});

