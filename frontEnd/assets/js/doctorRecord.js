 // Set today's date by default
        document.getElementById('recordDate').valueAsDate = new Date();

        // SUBMIT LOGIC
        document.getElementById('recordForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // PREPARE DATA FOR TEAMMATE
            const formData = {
                patientId: document.getElementById('patientId').value,
                diagnosis: document.getElementById('diagnosis').value,
                prescription: document.getElementById('prescription').value,
                recordDate: document.getElementById('recordDate').value
            };

            console.log("Ready to send to Backend:", formData);

            // ============================================================
            // TODO: TEAMMATE - PASTE API CALL HERE
            // Endpoint: POST /api/doctor/medical-records
            // Body: JSON.stringify(formData)
            // Headers: Authorization: Bearer <token>
            // ============================================================

            alert("Medical Record Prepared! Check Console.");
            // Optional: Redirect back to dashboard
            // window.location.href = 'doctor-dashboard.html';
        });