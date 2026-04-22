// --- CONFIGURATION ---
const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzw4eTIw_zWpgQjfpVJ0WoweGrnQmjMltXPiy-tqtkT1Higswub2jk5YaqF7CBlIej5/exec"; 
const WHATSAPP_NUMBER = "7527099058"; // WhatsApp number without the +

let currentData = {
    name: "",
    phone: "",
    email: "",
    ticketId: ""
};

// 1. Handle Form Submission
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    btn.innerText = "CHECKING AVAILABILITY...";
    btn.disabled = true;

    const inputName = document.getElementById('custName').value;
    const inputPhone = document.getElementById('custPhone').value;
    const inputEmail = document.getElementById('custEmail').value;

    try {
        // Ask the Google Sheet to check for duplicates AND get the next number
        const queryUrl = `${GOOGLE_WEB_APP_URL}?email=${encodeURIComponent(inputEmail)}&phone=${encodeURIComponent(inputPhone)}`;
        const response = await fetch(queryUrl);
        const result = await response.text();

        // Stop if user already bought a ticket
        if (result === "DUPLICATE") {
            alert("A ticket has already been registered with this email or phone number.");
            btn.innerText = "PROCEED TO PAYMENT";
            btn.disabled = false;
            return;
        }

        const nextNumber = parseInt(result) || 1;

        // Check if sold out (Caps at 50)
        if (nextNumber > 50) {
            alert("Sorry, all 50 tickets for the Summer Bash have been completely sold out!");
            btn.innerText = "SOLD OUT";
            return; 
        }

        // Save details to our variable
        currentData.name = inputName;
        currentData.phone = inputPhone;
        currentData.email = inputEmail;
        
        // Generate Sequential Ticket ID (Formats 1 as "LUX-01", 12 as "LUX-12")
        currentData.ticketId = "LUX-" + nextNumber.toString().padStart(2, '0');

        // Update WhatsApp link with details
        updateWhatsAppLink();

        // Hide form button, show payment section
        btn.classList.add('hidden');
        document.getElementById('payInstructions').classList.remove('hidden');

    } catch (error) {
        console.error("Failed to fetch details:", error);
        alert("Could not connect to the server. Please check your internet connection.");
        btn.innerText = "PROCEED TO PAYMENT";
        btn.disabled = false;
    }
});

// 2. Update WhatsApp Message dynamically
function updateWhatsAppLink() {
    const msg = `Hello, I have completed payment for Summer Bash.\n\nName: ${currentData.name}\nTicket ID: ${currentData.ticketId}\n\nPlease confirm my booking.`;
    const wa = document.getElementById("whatsappLink");
    if (wa) {
        wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
}

// 3. Payment Helpers
function openUPI() {
    const upiID = "7696842254@pthdfc";
    window.location.href = `upi://pay?pa=${upiID}&pn=Luxcrew Travels&am=1000&cu=INR`;
}

function copyUPI() {
    navigator.clipboard.writeText("godwellmahoso01@okaxis");
    alert("UPI ID Copied!");
}

// 4. Save to Sheets & Generate Ticket
async function processFinalTicket() {
    const btn = document.getElementById('getTicketBtn');
    btn.innerText = "SAVING DETAILS... PLEASE WAIT";
    btn.disabled = true;

    // Send Data to Google Sheets
    try {
        await fetch(GOOGLE_WEB_APP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8", 
            },
            body: JSON.stringify(currentData)
        });
        console.log("Sent to Google!");
    } catch(error) {
        console.error("Sheet Error:", error);
    }

    // Switch to Ticket View
    document.getElementById('section-buy').classList.add('hidden');
    document.getElementById('section-ticket').classList.remove('hidden');

    // Populate Ticket Data
    document.getElementById('dispName').innerText = currentData.name;
    document.getElementById('dispId').innerText = currentData.ticketId;

    // Generate QR Code
    document.getElementById('qrcode').innerHTML = ""; 
    new QRCode(document.getElementById("qrcode"), {
        text: currentData.ticketId,
        width: 120,
        height: 120
    });
}

// 5. Download Ticket
function downloadTicket() {
    const element = document.getElementById('ticket-capture');
    const opt = {
        margin: 0,
        filename: `${currentData.ticketId}-SummerBash.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
