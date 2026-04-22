// CONFIGURATION
// I have extracted the ID from your link: 1KjnbAPVjkhVck5vB8Vid6CDkjjKqs7nZOQVoRlxx7m0
const SHEET_ID = "1KjnbAPVjkhVck5vB8Vid6CDkjjKqs7nZOQVoRlxx7m0";
const SHEET_NAME = "Sheet1";

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    // Check if Sheet1 exists
    if (!sheet) {
       return ContentService.createTextOutput(JSON.stringify({"status": "error", "msg": "Sheet1 not found"}))
      .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      new Date(), 
      data.name, 
      data.phone, 
      data.email, 
      data.ticketId, 
      "Valid"
    ]);

    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "msg": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const ticketId = e.parameter.id;
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === ticketId) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "found",
        name: data[i][1],
        ticketStatus: data[i][5]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({status: "not_found"}))
    .setMimeType(ContentService.MimeType.JSON);
}