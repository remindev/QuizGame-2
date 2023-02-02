var AuthJs = {
    /**
     * @param {Element} emailInput 
     * @param {Element} passwordInput 
     * @param {Node} errorDisp 
     */
    login: function (emailInput, passwordInput, errorDisp) {

        /**
         * @type {String}
         */
        let email = emailInput.value.trim();
        /**
         * @type {String}
         */
        let password = passwordInput.value.trim();

        function dispState(message, isGood) {
            errorDisp.innerText = message;
            errorDisp.style.display = 'flex';
            errorDisp.style.backgroundColor = 'rgba(255, 78, 78, 0.489)';

            if (isGood == true) {
                errorDisp.style.backgroundColor = 'rgba(157, 240, 68, 0.489)';
            }
        }

        let bothGood = true;

        if (password.length > 5) {

            // good

        } else {
            dispState("Enter a valid password");
            bothGood = false;
        }

        if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            // good
        } else {
            dispState("Enter a valid email");
            bothGood = false;
        }

        if (bothGood == true) {
            dispState('Loading...', true);

            fetch(`${base_url}/login`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer abcdxyz',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }).then(res => res.json())
                .then((res) => {

                    if (res.status == 'error') {

                        if (res.code == 403771) {
                            let logbox = document.getElementById('content_container');
                            let already = document.getElementById('already_exists');
                            let userType = document.getElementById('type_of_user');


                            logbox.style.display = 'none';
                            already.style.display = 'flex';

                            if(res.type==true){
                                userType.innerText = "Guest";
                            }else{
                                userType.innerText = res.email;
                            }
                            
                        }

                        dispState(res.message);

                    } else {
                        dispState(res.message, true);
                        window.location.href = `${base_url}/`;
                    }

                })
                .catch(err => console.error(err));

        }

    },
    /**
     * @param {Element} email 
     * @param {Element} password 
     * @param {Element} conform 
     * @param {Element} errorDisp 
     */
    signup: function (emailInput, passwordInput, conformInput, errorDisp) {
        /**
         * @type {String}
         */
        let email = emailInput.value.trim();
        /**
         * @type {String}
         */
        let password = passwordInput.value.trim();
        /**
         * @type {String}
         */
        let conform = conformInput.value.trim();

        function dispState(message, isGood) {
            errorDisp.innerText = message;
            errorDisp.style.display = 'flex';
            errorDisp.style.backgroundColor = 'rgba(255, 78, 78, 0.489)';

            if (isGood == true) {
                errorDisp.style.backgroundColor = 'rgba(157, 240, 68, 0.489)';
            }
        }

        let bothGood = true;

        if (password.length > 5) {

            if (conform == password) {

                // good

            } else {
                dispState("Conform password dosn't match");
                bothGood = false;
            }


        } else {
            dispState("Enter a valid password");
            bothGood = false;
        }

        if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

            // good

        } else {

            dispState("Enter a valid email");
            bothGood = false;

        }

        if (bothGood == true) {

            dispState('Loading...', true);

            fetch(`${base_url}/signup`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer abcdxyz',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }).then(res => res.json())
                .then((res) => {

                    if (res.status == 'error') {

                        if (res.code == 403771) {
                            let logbox = document.getElementById('content_container');
                            let already = document.getElementById('already_exists');
                            let userType = document.getElementById('type_of_user');


                            logbox.style.display = 'none';
                            already.style.display = 'flex';

                            if(res.type==true){
                                userType.innerText = "Guest";
                            }else{
                                userType.innerText = res.email;
                            }

                        }

                        dispState(res.message);

                    } else {
                        dispState(res.message, true);
                        window.location.href = `${base_url}/`;
                    }

                })
                .catch(err => console.error(err));

        }
    }, guest: function (errorDisp) {

        function dispState(message, isGood) {
            errorDisp.innerText = message;
            errorDisp.style.display = 'flex';
            errorDisp.style.backgroundColor = 'rgba(255, 78, 78, 0.489)';

            if (isGood == true) {
                errorDisp.style.backgroundColor = 'rgba(157, 240, 68, 0.489)';
            }
        }

        fetch(`${base_url}/guestLogin`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer abcdxyz',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                guest: true
            })
        }).then(res => res.json())
            .then((res) => {

                if (res.status == 'error') {

                    if (res.code == 403771) {
                        let logbox = document.getElementById('content_container');
                        let already = document.getElementById('already_exists');
                        let userType = document.getElementById('type_of_user');

                        logbox.style.display = 'none';
                        already.style.display = 'flex';

                        if(res.type==true){
                            userType.innerText = "Guest";
                        }else{
                            userType.innerText = res.email;
                        }

                    }

                    dispState(res.message);

                } else {
                    dispState(res.message, true);
                    window.location.href = `${base_url}/`;
                }

            })
            .catch(err => console.error(err));
    },
    logout: async function () {
        let logbox = document.getElementById('content_container');
        let already = document.getElementById('already_exists');

        try {

            var data = await fetch(`${base_url}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logout: true,
                    message: 'in'
                })
            });

            data = await data.json();

            if (data.status == 'sucess') {
                logbox.style.display = 'inline';
                already.style.display = 'none';
            }

            window.location.href = `${base_url}/login`;

        } catch (error) {
            console.log(error);
        }

    }
}