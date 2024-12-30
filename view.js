// API Endpoint for Google Apps Script
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzc6nmFF9kCfp-g7c8A5-pPMLc5N_pOzEPp4DE--v359-WMIlsxEnH762FsQ1UgTBGTjA/exec';

// Fetch all members and display them as buttons
async function fetchMembers() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=getAllMembers`);
    const members = await response.json();
    const memberList = document.getElementById('memberList');
    members.forEach(member => {
      const button = document.createElement('button');
      button.textContent = member.name;
      button.className = 'member-button';
      button.onclick = () => fetchMemberDetails(member.aadhar);
      memberList.appendChild(button);
    });
  } catch (error) {
    console.error('Error fetching members:', error);
  }
}

// Fetch and display details for a specific member
async function fetchMemberDetails(aadhar) {
  try {
    const response = await fetch(`${API_BASE_URL}?action=getMemberDetails&aadhar=${aadhar}`);
    const data = await response.json();

    const basicInfo = document.getElementById('basicInfo');
    basicInfo.innerHTML = `
      <strong>Name:</strong> ${data.name}<br>
      <strong>Phone:</strong> ${data.phone}<br>
      <strong>Email:</strong> ${data.gmail}<br>
      <strong>Aadhar (Last 3 Digits):</strong> ${data.aadhar.slice(-3)}<br>
      <strong>Total Deposit:</strong> ₹${data.totalDeposit}
    `;

    const paymentHistory = document.getElementById('paymentHistory');
    paymentHistory.innerHTML = '';
    data.details.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.amount}</td>
        <td>${entry.status}</td>
        <td>${entry.month}</td>
      `;
      paymentHistory.appendChild(row);
    });

    document.getElementById('memberDetails').style.display = 'block';
  } catch (error) {
    console.error('Error fetching member details:', error);
  }
}

// Initialize the page by fetching the member list
fetchMembers();