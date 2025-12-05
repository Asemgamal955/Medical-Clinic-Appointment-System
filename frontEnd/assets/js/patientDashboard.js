 // 1. Logout Logic
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('userToken');
            window.location.href = '../home/index.html'; // Goes back to landing page
        });

        document.getElementById('profileBtn').addEventListener('click', () => {
            window.location.href = 'patient-profile.html'; // Navigate to profile page
        });

        // 2. Handle Booking (Matched to appointmentController.js)
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // PREPARE DATA FOR TEAMMATE
            const formData = {
                doctorId: document.getElementById('doctorId').value,
                appointmentDate: document.getElementById('appointmentDate').value,
                appointmentTime: document.getElementById('appointmentTime').value,
                notes: document.getElementById('notes').value
            };

            console.log("Ready to send to POST /api/appointments:", formData);
            
            // ============================================================
            // TODO: TEAMMATE - PASTE API CALL HERE
            // Endpoint: POST /api/appointments
            // Headers: Authorization: Bearer <token>
            // Body: JSON.stringify(formData)
            // ============================================================

            alert("Booking Data Prepared! Check Console.");
            
            // Close modal manually
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            modal.hide();
        });

        // 3. TODO for Teammate:
        // You need to fetch data from GET /api/appointments and populate #appointmentTableBody
        // You need to fetch data from GET /api/patient/medical-records and populate #medicalRecordsList