// 1. SETTINGS
// Your specific Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxQymGskabb69adpMXzfkCscMYElyUEXpcdFwWhjnfQBthofm0fytZibwIirpw49mSN/exec"; 
const UPI_ID = "godwellmahoso01@okaxis";
const PRICE = "1000";

let currentData = {};

// 2. NAV LOGIC
function showSection(name) {
    ['buy', 'ticket', 'verify'].forEach(s => {
        document.getElementById('section-' + s).classList.add('hidden');
        document.getElementById('nav-' + s).classList.remove('active');
    });
    document.getElementById('section-' + name).classList.remove('hidden');
    document.getElementById('nav-' + name).classList.add('active');
}

// 3. PAYMENT FLOW
function handlePaymentTransition() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();

    if(!name || phone.length !== 10 || !email.includes('@')) {
        alert("Please fill all details correctly (10-digit phone required).");
        return;
    }

    currentData = { name, phone, email };
    
    // Switch to payment instructions
    document.getElementById('bookingForm').classList.add('hidden');
    document.getElementById('payInstructions').classList.remove('hidden');
}

function openUPI() {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=LuxcrewTravels&am=${PRICE}&cu=INR&tn=SummerBashTicket`;
    window.location.href = upiLink;
}

function copyUPI() {
    const text = document.getElementById('upiIdText').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("UPI ID Copied! Paste it in GPay, PhonePe, or Paytm.");
    });
}

// 4. GENERATE TICKET
async function processFinalTicket() {
    // Generate Unique Ticket ID
    const ticketId = 'LUX-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    currentData.ticketId = ticketId;

    // Show data on Ticket
    document.getElementById('dispName').innerText = currentData.name;
    document.getElementById('dispId').innerText = ticketId;
    
    try {
        // Send to Google Sheets (Background)
        fetch(API_URL, { 
            method: 'POST', 
            mode: 'no-cors', 
            body: JSON.stringify(currentData) 
        });

        // Create QR
        document.getElementById("qrcode").innerHTML = "";
        new QRCode(document.getElementById("qrcode"), {
            text: ticketId,
            width: 160,
            height: 160,
            colorDark : "#111827",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        showSection('ticket');
        window.scrollTo(0,0);
    } catch (e) {
        alert("Server busy, but your ticket is ready!");
        showSection('ticket');
    }
}

// 5. PDF DOWNLOAD
function downloadTicket() {
    const element = document.getElementById('ticket-capture');
    const opt = {
        margin: 0.5,
        filename: `Luxcrew_SummerBash_${currentData.ticketId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
}

// 6. STAFF VERIFICATION
async function runVerification() {
    const id = document.getElementById('verifyInput').value.trim().toUpperCase();
    const resDiv = document.getElementById('verifyResult');
    const btn = document.getElementById('btnVerify');

    if(!id) return;

    btn.innerText = "CHECKING...";
    btn.disabled = true;

    try {
        const resp = await fetch(`${API_URL}?id=${id}`);
        const data = await resp.json();

        resDiv.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'text-green-800', 'text-red-800', 'border-green-200', 'border-red-200');

        if (data.status === 'found') {
            resDiv.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
            resDiv.innerHTML = `✅ ACCESS GRANTED<br><span class="text-sm font-normal">${data.name}</span>`;
        } else {
            resDiv.classList.add('bg-red-100', 'text-red-800', 'border-red-200');
            resDiv.innerHTML = `❌ INVALID TICKET<br><span class="text-sm font-normal">Not found in database</span>`;
        }
        resDiv.classList.remove('hidden');
    } catch (e) {
        alert("Error connecting to database. Verify API URL.");
    } finally {
        btn.innerText = "VERIFY TICKET";
        btn.disabled = false;
    }
}
