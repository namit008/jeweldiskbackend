function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/);
    return pattern.test(emailAddress);
}

//Mobile No. Validation
function isValidPhone(number) {
    var phoneno = /^\d{10}$/;
    if ((number.match(phoneno))) {
        return true;
    } else {

        return false;
    }
}