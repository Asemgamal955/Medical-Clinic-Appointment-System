document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // 1. DATA PREPARATION (Matched to authController.js)
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            console.log("Ready to send to Backend:", formData);

            // ============================================================
            // TODO: TEAMMATE - PASTE API CALL HERE
            // 1. Endpoint: POST /api/auth/login
            // 2. Body: JSON.stringify(formData)
            // 3. On Success: Save token (localStorage.setItem('token', data.data.token))
            // 4. Redirect based on data.data.role ('Patient' -> patient-dashboard.html)
            // if doctor -> doctor-dashboard.html
            // ============================================================
            
            // Temporary alert for you to see it works
            alert("Check Console: Data is ready for teammate integration.");
        });