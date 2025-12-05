 // 1. Logout Logic
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('userToken');
            window.location.href = '../home/index.html';
        });

        // 2. Status Update Logic (Delegation)
        document.getElementById('scheduleTableBody').addEventListener('click', function(e) {
            // Check if clicked button is "Complete" or "Cancel"
            if (e.target.classList.contains('btn-complete') || e.target.classList.contains('btn-cancel')) {
                
                const row = e.target.closest('tr');
                const appointmentId = row.getAttribute('data-id');
                const newStatus = e.target.classList.contains('btn-complete') ? 'Completed' : 'Cancelled';

                // PREPARE DATA FOR TEAMMATE
                const payload = { status: newStatus };

                console.log(`Ready to update Appointment #${appointmentId} to '${newStatus}'`);

                // ============================================================
                // TODO: TEAMMATE - PASTE API CALL HERE
                // Endpoint: PATCH /api/appointments/${appointmentId}/status
                // Body: JSON.stringify(payload)
                // Headers: Authorization: Bearer <token>
                // On Success: Update the badge in the UI
                // ============================================================
                
                alert(`Request sent: Update ID ${appointmentId} to ${newStatus}`);
            }
        });