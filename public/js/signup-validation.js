jQuery(function ($) {
    var username = $("#sign-up-username");
    var password = $("#sign-up-password");
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

    $("button#sign-up")
        .on(
            "click",
            function (e) {
                e.preventDefault();
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

                if (valid) {
                    $.ajax({
                        url: "/signup",
                        type: "post",
                        data: dataToSend,

                        success: function (data, textStatus,
                            jqXHR) {
                            window.location.href = "/login?success=true";
                        },
                        error: function (jqXHR, textStatus,
                            errorThrown) {
                            if (jqXHR.responseText == "username-not-defined") {
                                updateTips("Username field is mandatory!");
                            } else if (jqXHR.responseText == "password-not-defined") {
                                updateTips("Password field is mandatory!");
                            } else if (jqXHR.responseText == "firstname-not-defined") {
                                updateTips("First Name field is mandatory!");
                            } else if (jqXHR.responseText == "lastname-not-defined") {
                                updateTips("Last Name field is mandatory!");
                            } else if (jqXHR.responseText == "email-not-defined") {
                                updateTips("Email field is mandatory!");
                            } else if (jqXHR.responseText == "birthdate-not-defined") {
                                updateTips("Birthdate field is mandatory!");
                            } else if (jqXHR.responseText == "address-not-defined") {
                                updateTips("Address field is mandatory!");
                            } else if (jqXHR.responseText == "username-exists") {
                                updateTips("User with such username already exists!");
                            } else if (jqXHR.responseText == "email-exists") {
                                updateTips("User with such email already exists!");
                            } else {
                                updateTips("There was an error processing your request. Try again later!");
                            }
                        }
                    });
                }
            });
});