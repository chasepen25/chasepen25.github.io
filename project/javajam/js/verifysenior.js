var age = prompt("Please enter your age:", "");
var verifyMessage = document.getElementById("verify");

if (age !== null && Number(age) >= 65) {
    verifyMessage.innerHTML = "Free Friday Coffee Night for Seniors!";
} else {
    verifyMessage.innerHTML = "Enjoy Music and Make Memories!";
}
