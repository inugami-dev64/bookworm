/// Check wheather the user is signed in or not
function UserInfoHandler() {
    if(g_LoginData.user_data == null)
        ToggleLoginPrompt();
    else ToggleAccountManagement();
}


/// TODO: Submit login credentials to Firebase and make appropriate action afterwards
function LoginToBookworm() {
    let email = document.getElementById("login_email").value;
    let pass = document.getElementById("login_pass").value;

    // login persistently and save credentials for the current session only
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
            let credentials = firebase.auth().signInWithEmailAndPassword(email, pass);
            credentials.then(() => {
                g_LoginData.pass_length = pass.length;
            })
            .catch((error) => {
                console.error("Login Error");
                document.getElementById("login_err").innerHTML = error.message;
            });

            g_LoginData.user_data = credentials.user;
            HandleURLSearchParams();
            return credentials;
        });
}


/// TODO: Create a new account for Bookworm
function SignUpToBookworm() {
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
        document.getElementById("signup_err").innerHTML = verify_msg;
        return;
    }

    // check if passwords match
    if(!CheckPasswordMatch(user_info.pass, user_info.cpass)) {
        document.getElementById("signup_err").innerHTML = "Passwords do not match.";
        return;
    }
    
    // call Firebase user creation method and set correct local display name
    firebase.auth().createUserWithEmailAndPassword(user_info.email, user_info.pass)
    .then((user_credentials) => {
        console.log("created an user");
        g_LoginData.display_name = user_info.uname + g_DisplayNameSeperator + user_info.fname + "\\" + user_info.lname;
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


/// Create a new book for sale listing
function CreateNewListing() {
    let ext = document.getElementById("img_attachment").value.split(".");

    // create a compact structure for storing book related information
    let book = {
        "pic_file": String(Math.floor(new Date().getTime() / 100)) + "." + ext[ext.length - 1],
        "seller": g_LoginData.user_data.displayName,
        "name": document.getElementById("sale_book_name").value,
        "price": Number(document.getElementById("sale_book_price").value),
        "author": document.getElementById("sale_book_author").value,
        "desc": document.getElementById("sale_book_desc").value
    };

    // Upload book information to Firebase
    let err_msg = VerifySaleData(book);
    let meta = GenerateImageMetadata(ext[ext.length - 1]);
    console.log("meta: " + meta);
    if(err_msg === null && meta !== null) {
        console.log("meta: " + meta);
        firebase.storage().ref().child(book.pic_file).put(g_Attachment, meta)
        .then((snapshot) => {
            console.log("Uploaded file " + book.pic_file + " to Firebase");
        });

        g_LoginData.db.collection("books").add(book)
        .then((doc_ref) => {
            console.log("Added book information to database");
            ShowBookCatalog();
        })
        .catch((error) => {
            console.error(error.message);
        });
    } else if(meta === null) {
        document.getElementById("sale_err").innerHTML = "Supported file formats are jpeg, png and gif!";
        g_Attachment = null;
        return;
    }
        
    document.getElementById("sale_err").innerHTML = err_msg;
    g_Attachment = null;
}


/// Update name related information
function UpdateNameInfo(type, val, info_elem) {
    let names = g_LoginData.user_data.displayName.split(g_DisplayNameSeperator);
    let old_val = new String;
    if(type === "uname") {
        old_val = names[0];
        names[0] = val;
    }

    if(type === "fname") {
        old_val = names[1];
        names[1] = val;
    }

    if(type === "lname") {
        old_val = names[2];
        names[2] = val;
    }

    // update name information
    g_LoginData.display_name = names[0] + g_DisplayNameSeperator + names[1] + g_DisplayNameSeperator + names[2];
    g_LoginData.user_data.updateProfile({
        displayName: g_LoginData.display_name
    })
    .then(() => {
        info_elem.innerHTML = val;
        document.getElementById("user_pr_err").innerHTML = "";
    })
    .catch((error) => {
        info_elem.innerHTML = old_val;
        document.getElementById("user_pr_err").innerHTML = error.message;
    });
}


/// Update user email
function UpdateEmail(email, info_elem) {
    let old_val = g_LoginData.user_data.email;

    g_LoginData.user_data.updateEmail(email)
    .then(() => {
        info_elem.innerHTML = email;
        document.getElementById("user_pr_err").innerHTML = "";
    })
    .catch((error) => {
        info_elem.innerHTML = old_val;
        document.getElementById("user_pr_err").innerHTML = error.message;
    });
}
