jQuery(function($) {
	var username = $("#username");
	var password = $("#password");
	var tips = $(".validateTips");
	var dataToSend;

	function updateTips(t) {
		tips.text(t);
	}
	
	function checkPresenceWithoutError(element, name) {
		if (element.val().length == 0) {
			return false;
		} else {
			return true;
		}
	}

	function checkLengthWithoutError(element, name, min, max) {
		if (element.val().length < min || element.val().length > max) {
			return false;
		} else {
			return true;
		}
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
			updateTips("The " + name + " field must be between " + min
					+ " and " + max + " characters.");
			element.focus();
			return false;
		} else {
			return true;
		}
	}

	$("input#log-in").on(
			"click",
			function(e) {
				e.preventDefault();
				var valid = true;
				valid = valid
						&& checkPresenceWithoutError(username, "'Username'");
				valid = valid
						&& checkPresenceWithoutError(password, "'Password'");

				valid = valid
						&& checkLengthWithoutError(username, "'Username'", 5,
								50);
				valid = valid
						&& checkLengthWithoutError(password, "'Password'", 5,
								50);

				dataToSend = {
					'username' : username.val(),
					'password' : password.val()
				};

				if (!valid) {
					window.location.href = "/login?error=invalid-credentials";
				} else {
					$.ajax({
						url : "/login",
						type : "post",
						data : dataToSend,

						success : function(data, textStatus, jqXHR) {
							window.location.href = "/home";
						},
						error : function(jqXHR, textStatus, errorThrown) {
							if (jqXHR.responseText === "user-not-found" || jqXHR.responseText === "invalid-password") {
								window.location.href = "/login" + "?error=wrong-user";
							} else {
								window.location.href = "/login" + "?error=other";
							}
						}
					});
				}
			});
	$("button#log-in").on("click", function(e) {
		e.preventDefault();
		var valid = true;
		valid = valid && checkPresence(username, "'Username'");
		valid = valid && checkPresence(password, "'Password'");

		valid = valid && checkLength(username, "'Username'", 5, 50);
		valid = valid && checkLength(password, "'Password'", 5, 50);

		dataToSend = {
			'username' : username.val(),
			'password' : password.val()
		};

		if (valid) {
			$.ajax({
				url : "/login",
				type : "post",
				data : dataToSend,

				success : function(data, textStatus, jqXHR) {
					window.location.href = "/home"
				},
				error : function(jqXHR, textStatus, errorThrown) {
					if (jqXHR.responseText === "user-not-found" || jqXHR.responseText === "invalid-password") {
						updateTips("Wrong username and/or password!");
					} else {
						updateTips("There was an error logging in!");
					}
				}
			});
		}
	});
});
