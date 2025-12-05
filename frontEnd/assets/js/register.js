// 1. DYNAMIC UI LOGIC (Show/Hide fields based on Role)
        const roleSelect = document.getElementById('role');
        const patientFields = document.getElementById('patientFields');
        const doctorFields = document.getElementById('doctorFields');

        roleSelect.addEventListener('change', function() {
            if (this.value === 'Doctor') {
                doctorFields.classList.remove('hidden');
                patientFields.classList.add('hidden');
            } else {
                doctorFields.classList.add('hidden');
                patientFields.classList.remove('hidden');
            }
        });

        // 2. SUBMIT LOGIC
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const role = document.getElementById('role').value;

            // Base Data (Common)
            const formData = {
                role: role,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };

            // Add Specific Data based on Role
            if (role === 'Patient') {
                formData.dateOfBirth = document.getElementById('dateOfBirth').value;
                formData.address = document.getElementById('address').value;
            } else if (role === 'Doctor') {
                formData.specialization = document.getElementById('specialization').value;
                formData.workingHours = document.getElementById('workingHours').value;
            }

            console.log("Ready to send to Backend:", formData);

            // ============================================================
            // TODO: TEAMMATE - PASTE API CALL HERE
            // 1. Endpoint: POST /api/auth/register
            // 2. Body: JSON.stringify(formData)
            // 3. On Success: alert('Registered!'); window.location.href = 'login.html';
            // ============================================================
            
            alert("Check Console: Data is ready for teammate integration.");
        });