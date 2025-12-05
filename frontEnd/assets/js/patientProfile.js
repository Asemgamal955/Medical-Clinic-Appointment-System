document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadUserProfile();
    loadMedicalRecords();

    // Attach Event Listeners
    document.getElementById('updateProfileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

// ==========================================
// 1. GET PROFILE DATA (Placeholder)
// ==========================================
async function loadUserProfile() {
    console.log("Fetching user profile data...");

    // ------------------------------------------------------------------
    // TODO FOR TEAMMATE: Uncomment this block to connect to backend
    // ------------------------------------------------------------------
    /*
    try {
        const token = localStorage.getItem('token'); // Assuming JWT is stored here
        const response = await fetch('/api/auth/me', { // Adjust endpoint URL
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if(data.success) {
            populateProfileForm(data.user);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    */

    // MOCK DATA (Remove this when API is connected)
    const mockUser = {
        name: "Ahmed Refaat",
        phone: "01012345678",
        dateOfBirth: "2005-10-07",
        address: "Alexandria, Egypt",
        medicalHistory: "No known allergies."
    };
    populateProfileForm(mockUser);
}

function populateProfileForm(user) {
    document.getElementById('displayUserName').textContent = user.name || 'User';
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('phone').value = user.phone || '';
    
    // Formatting date to YYYY-MM-DD for input field
    if(user.dateOfBirth) {
        document.getElementById('dob').value = user.dateOfBirth.split('T')[0];
    }
    
    document.getElementById('address').value = user.address || '';
    document.getElementById('medicalHistory').value = user.medicalHistory || '';
}

// ==========================================
// 2. GET MEDICAL RECORDS (Placeholder)
// ==========================================
async function loadMedicalRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>';

    console.log("Fetching medical records...");

    // ------------------------------------------------------------------
    // TODO FOR TEAMMATE: Uncomment this block to connect to backend
    // ------------------------------------------------------------------
    /*
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/medical-records/my-records', { // URL matches your controller
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            renderRecordsTable(data.data);
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No records found.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>';
    }
    */

    // MOCK DATA (Remove when API is connected)
    setTimeout(() => {
        const mockRecords = [
            {
                record_date: "2025-11-20T10:00:00.000Z",
                doctor_name: "Dr. Sarah Ahmed",
                specialization: "Cardiology",
                diagnosis: "Hypertension Stage 1",
                prescription: "Amlodipine 5mg daily"
            },
            {
                record_date: "2025-08-15T14:30:00.000Z",
                doctor_name: "Dr. Mohamed Ali",
                specialization: "Dermatology",
                diagnosis: "Eczema",
                prescription: "Hydrocortisone Cream"
            }
        ];
        renderRecordsTable(mockRecords);
    }, 500); // Simulated delay
}

function renderRecordsTable(records) {
    const tableBody = document.getElementById('recordsTableBody');
    
    if (!records || records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No medical records found.</td></tr>';
        return;
    }

    tableBody.innerHTML = records.map(record => {
        const date = new Date(record.record_date).toLocaleDateString('en-GB');
        return `
            <tr>
                <td class="ps-4 fw-bold text-muted">${date}</td>
                <td>
                    <div class="fw-bold text-dark">${record.doctor_name}</div>
                    <small class="text-primary">${record.specialization}</small>
                </td>
                <td>${record.diagnosis}</td>
                <td><span class="badge bg-light text-dark border">${record.prescription}</span></td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// 3. UPDATE PROFILE (Placeholder)
// ==========================================
async function handleProfileUpdate(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    // Gather form data
    const formData = {
        name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dob').value,
        address: document.getElementById('address').value,
        medicalHistory: document.getElementById('medicalHistory').value
    };

    console.log("Sending Update Data:", formData);

    // ------------------------------------------------------------------
    // TODO FOR TEAMMATE: Uncomment this block to connect to backend
    // ------------------------------------------------------------------
    /*
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/update-profile', { // URL matches your controller
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Profile updated successfully!');
            // Update the display name in the sidebar immediately
            document.getElementById('displayUserName').textContent = formData.name;
        } else {
            alert('Update failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error occurred.');
    }
    */

    // SIMULATED SUCCESS (Remove when API is connected)
    setTimeout(() => {
        alert("Simulated: Profile Updated Successfully!");
        document.getElementById('displayUserName').textContent = formData.name;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1000);
}

function handleLogout(e) {
    e.preventDefault();
    // Clear token
    // localStorage.removeItem('token');
    window.location.href = 'index.html';
}