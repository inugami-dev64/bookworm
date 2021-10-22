const g_FirebaseConfig = {
    apiKey: "AIzaSyDnplZoRuwQT9IfHgFe6g1wQjUzy2f7eZQ",
    authDomain: "bookworm-333f5.firebaseapp.com",
    projectId: "bookworm-333f5",
    storageBucket: "bookworm-333f5.appspot.com",
    messagingSenderId: "901216127013",
    appId: "1:901216127013:web:29dbcbff530699480297cc"
};


// All kinds of forms that need to be submitted by using some javascript function
const g_SubmitElements = [
    "search",
    "login",
    "signup"
];


// All possible content div ids to manipulate
const g_ContentDivs = [
    "search",
    "user_profile",
];


// Informational data-structure for handling logins
let g_LoginData = {
    "is_logged_in": false,
    "current_section": "login",
    "is_prompt": false,
    "is_account_management": false,
    "pass_length": 0,
    "display_name": "",
    "user_data": null
}


/// Check wheather the user is signed in or not
function UserInfoHandler() {
    if(g_LoginData.user_data == null)
        ToggleLoginPrompt();
    else ToggleAccountManagement();
}


/// Toggle the login prompt
function ToggleLoginPrompt() {
    let pr = document.getElementById("login_prompt");
    if(!g_LoginData.is_prompt) {
        pr.style.display = "block";
        document.getElementById("main").style.filter = "blur(10px)";
        g_LoginData.is_prompt = true;
    } else {
        pr.style.display = "none";
        document.getElementById("main").style.filter = "none";
        g_LoginData.is_prompt = false;
    }
}


function ToggleAccountManagement() {
    let account_man = document.getElementById("account_management");
    if(!g_LoginData.is_account_management) {
        account_man.style.display = "block";
        g_LoginData.is_account_management = true;
    } else {
        account_man.style.display = "none";
        g_LoginData.is_account_management = false;
    }
}


/// Toggle between login and signup sections
function ToggleLoginSections() {
    let login = document.getElementById("login_section");
    let signup = document.getElementById("signup_section");

    if(g_LoginData.current_section == "login") {
        g_LoginData.current_section = "signup";
        signup.style.display = "flex";
        login.style.display = "none";
    } else if(g_LoginData.current_section == "signup") {
        g_LoginData.current_section = "login";
        login.style.display = "flex";
        signup.style.display = "none";
    }
}


/// Prevent any kind of refreshing when performing submits
function PreventRefreshOnSubmit() {
    g_SubmitElements.forEach(elem => {
        let form = document.getElementById(elem);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
        });
    });
}


/*************************************************/
/***** Content visibility handling functions *****/
/*************************************************/

/// Hide all possible content divisors
function HideContent() {
    g_ContentDivs.forEach(elem => {
        document.getElementById(elem).style.display = "none";
    });
    
    // if prompt is shown hide it
    if(g_LoginData.is_prompt)
        ToggleLoginPrompt();
    if(g_LoginData.is_account_management)
        ToggleAccountManagement();
}


function ShowBookSearch() {
    HideContent();
    document.getElementById("search").style.display = "block";
}


function ShowUserProfile() {
    HideContent();
    document.getElementById("user_profile").style.display = "flex";
    
    const names = g_LoginData.user_data.displayName.split("\\");

    // display user information
    document.getElementById("uname").innerHTML = names[0];
    document.getElementById("email").innerHTML = g_LoginData.user_data.email;
    document.getElementById("fname").innerHTML = names[1];
    document.getElementById("lname").innerHTML = names[2];

    document.getElementById("password").innerHTML = "(hidden)";
}


/**************************/
/***** Error checking *****/
/**************************/


/// Check if all signup fields are filled in correctly
function VerifySignUpFields(user_info) {
    if(user_info.email === "")
        return "Please fill in the email address";
    else if(user_info.uname === "")
        return "Please fill in the username";
    else if(user_info.fname === "")
        return "Please fill in the first name";
    else if(user_info.lname === "")
        return "Please fill in the last name";
    else if(user_info.pass === "")
        return "Please fill in the password";
    
    return null;
}


/// Check if two passwords match
function CheckPasswordMatch(pass, cpass) {
    if(pass !== cpass) return false;
    else return true;
}


/*********************************************/
/***** Firebase communication functions ******/
/*********************************************/

/// TODO: Submit login credentials to Firebase and make appropriate action afterwards
function LoginToBookworm() {
    let email = document.getElementById("login_email").value;
    let pass = document.getElementById("login_pass").value;
    console.log("Email: " + email);
    console.log("Password: " + pass);

    // login persistently and save credentials for the current session only
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
            let credentials = firebase.auth().signInWithEmailAndPassword(email, pass);
            credentials.then(() => {
                g_LoginData.pass_length = pass.length;
            })
            .catch((error) => {
                console.log("Login Error");
                document.getElementById("login_err").innerHTML = error.message;
            });

            g_LoginData.user_data = credentials.user;
            console.log(credentials);
            return credentials;
        });
}


/// TODO: Create a new account for Bookworm
function SignUpToBookworm() {
    console.log("Create a new user");
    // general user informational values
    let user_info = {
        // general values
        "email": document.getElementById("signup_email").value,
        "uname": document.getElementById("signup_uname").value,
        "fname": document.getElementById("signup_fname").value,
        "lname": document.getElementById("signup_lname").value,

        // password values
        "pass": document.getElementById("signup_pass").value,
        "cpass": document.getElementById("signup_cpass").value
    }

    // verify that all fields are correctly filled
    let verify_msg = VerifySignUpFields(user_info);
    if(verify_msg != null) {
        console.log(verify_msg);
        document.getElementById("signup_err").innerHTML = verify_msg;
        return;
    }

    // check if passwords match
    if(!CheckPasswordMatch(user_info.pass, user_info.cpass)) {
        console.log("Pass match error");
        document.getElementById("signup_err").innerHTML = "Passwords do not match.";
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(user_info.email, user_info.pass)
    .then((user_credentials) => {
        console.log("created an user");
        g_LoginData.display_name = user_info.uname + "\\" + user_info.fname + "\\" + user_info.lname;
    })
    .catch((error) => {
        document.getElementById("signup_err").innerHTML = error.message;
    });
}


/// TODO: Sign out from the currently logged in account 
function SignOutFromBookworm() {
    firebase.auth().signOut();
    ShowBookSearch();
}


/// Initialiser method for Firebase
function Bootstrap() {
    firebase.initializeApp(g_FirebaseConfig);
    firebase.auth().onAuthStateChanged((user) => {
        g_LoginData.user_data = user;
        if(g_LoginData.user_data !== null) {
            if(g_LoginData.user_data.displayName === null && g_LoginData.displayName !== null) {
                g_LoginData.user_data.updateProfile({
                    displayName: g_LoginData.display_name
                });
            }
            ShowUserProfile();
        }
        else ShowBookSearch();
    }); 
}
