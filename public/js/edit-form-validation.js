jQuery(function ($) {
    var username = $("#username");
    var password = $("#password");
    var firstName = $("#first-name");
    var lastName = $("#last-name");
    var email = $("#email");
    var birthdate = $("#birthdate");
    var address = $("#address");
    var tips = $(".validateTips");
    var allFields = $([]).add(username).add(password).add(firstName).add(
        lastName).add(email).add(birthdate).add(address);
    var dataToSend;

    function updateTips(t) {
        tips.text(t);
    }

    function checkPresence(element, name) {
        $(".row input").removeClass("form-error");
        $(".row textarea").removeClass("form-error");
        if (element.val().length == 0) {
            element.addClass("form-error");
            $(window).scrollTop(0);
            updateTips("The " + name + " field is mandatory.");
            element.focus();
            return false;
        } else {
            return true;
        }
    }

    function checkLength(element, name, min, max) {
        $(".row input").removeClass("form-error");
        $(".row textarea").removeClass("form-error");
        if (element.val().length < min || element.val().length > max) {
            element.addClass("form-error");
            $(window).scrollTop(0);
            updateTips("The " + name + " field must be between " + min + " and " + max + " characters.");
            element.focus();
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, regexp, n) {
        $(".row input").removeClass("form-error");
        $(".row textarea").removeClass("form-error");
        if (!(regexp.test(o.val()))) {
            o.addClass("form-error");
            $(window).scrollTop(0);
            updateTips(n);
            o.focus();
            return false;
        } else {
            return true;
        }
    }

    $("input#edit-button")
        .on(
            "click",
            function (e) {
                //e.preventDefault();
                allFields.removeClass("form-error");
                var valid = true;
                valid = valid && checkPresence(username, "'Username'");
                valid = valid && checkPresence(password, "'Password'");
                valid = valid && checkPresence(firstName, "'First name'");
                valid = valid && checkPresence(lastName, "'Last name'");
                valid = valid && checkPresence(email, "'Email'");
                valid = valid && checkPresence(birthdate, "'Birthdate'");
                valid = valid && checkPresence(address, "'Address'");

                valid = valid && checkLength(firstName, "'First name'", 2, 50);
                valid = valid && checkLength(lastName, "'Last name'", 2, 50);
                valid = valid && checkLength(username, "'Username'", 5, 50);
                valid = valid && checkLength(password, "'Password'", 5, 50);

                valid = valid && checkRegexp(
                    email,
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i,
                    "eg. example@example.com");
                valid = valid && checkRegexp(
                    birthdate,
                    /^(0[1-9]|[12][0-9]|3[01])[./-](0[1-9]|1[012])[./-](19|20)\d\d$/,
                    "eg. DD/MM/YYYY");

                dataToSend = {
                    'username': username.val(),
                    'password': password.val(),
                    'firstname': firstName.val(),
                    'lastname': lastName.val(),
                    'email': email.val(),
                    'birthdate': birthdate.val(),
                    'address': address.val()
                };

                if (!valid) {
                	e.preventDefault();
                }
            });
});