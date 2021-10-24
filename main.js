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
    "search_page",
    "user_profile",
    "catalog",
    "sale_form",
    "book_info"
];


// Seperator to use in Firebase displayName for username, first name and last name 
const g_DisplayNameSeperator = "\\";


// Collection to read from and write into
const g_BooksCollection = [ "books", "ZC9wHORgElJ3IPXTcWEs" ];


const g_ImgURL = "gs://bookworm-333f5.appspot.com/";


// Informational data-structure for handling logins
let g_LoginData = {
    "is_logged_in": false,
    "current_section": "login",
    "is_prompt": false,
    "is_account_management": false,
    "pass_length": 0,
    "display_name": "",
    "db": null,
    "user_data": null
};


let g_Attachment = null;


// User info management status
// true value represents saved and false represents value on change
let g_UserInfoManagementStatus = {
    "uname": true,
    "email": true,
    "fname": true,
    "lname": true
};


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


/// Either change user information or save it 
function ToggleUserInfoChange(type) {
    let info_elem = document.getElementById(type);
    let btn = document.getElementById(type + "_ch");
    let val = document.getElementById(type).innerHTML;

    // current informational element is saved and thus make it changeable 
    if(g_UserInfoManagementStatus[type]) {
        info_elem.innerHTML = "<input type='text' id='" + type + "_in' value='" + val + "'>"
        btn.innerHTML = "Save";
        g_UserInfoManagementStatus[type] = false;
    } else {
        let new_val = document.getElementById(type + "_in").value;
        if(type === "uname" || type === "fname" || type === "lname")
            UpdateNameInfo(type, new_val, info_elem);
        else if(type === "email")
            UpdateEmail(new_val, info_elem);

        g_UserInfoManagementStatus[type] = true;
        btn.innerHTML = "Change";
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


function ChangeURLQuery(query) {
    if(history.pushState) {
        let new_url = window.location.protocol + "//" + window.location.host + window.location.pathname + query;
        window.history.pushState({path: new_url}, '', new_url);
    }
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
    ChangeURLQuery("");
    window.location.hash = "";
    document.getElementById("search_page").style.display = "block";
}


function ShowAboutUs() {
    ShowBookSearch();
    ChangeURLQuery("");
    window.location.hash = "#about_us";
}


function ShowBookCatalog() {
    HideContent();
    ChangeURLQuery("?catalog");
    document.getElementById("catalog").style.display = "flex";

    // query the list of books for sale and put them to popular list
    let popular = document.getElementById("popular_list");
    g_LoginData.db.collection("books").orderBy("price").onSnapshot((query) => {
        console.log("Updating book query");
        popular.innerHTML = "";
        console.log("Query length: " + query.docs.length);
        for(let i = 0; i < query.docs.length; i++) {
            let name = query.docs[i].data().name;
            let price = query.docs[i].data().price.toFixed(2);

            // Set the divs and image urls
            GetImgURL(query.docs[i].data().pic_file, (url) => {
                console.log("URL: " + url);
                popular.innerHTML += 
                    "<div class='book' onclick='ShowBookInfo(" + String(i) + ")'>" +
                    "    <img src='" + url + "'>" +
                    "    <p id='book_name'>" + name + "</p>" +
                    "    <p id='book_price'>" + price + "€</p>" +
                    "</div>";
            });
        }
    });
}


function ShowBookInfo(index) {
    // input error checking
    if(typeof index !== "number")
        return;

    HideContent();
    ChangeURLQuery("?book=" + String(index));
    
    // make book_info div visible
    let book_info = document.getElementById("book_info");
    book_info.style.display = "flex";

    // query the correct book whose information to display
    let ref = g_LoginData.db.collection("books").orderBy("price")
    ref.get().then((query) => {
        document.getElementById("book_info_name").innerHTML = query.docs[index].data().name;
        document.getElementById("book_info_price").innerHTML = query.docs[index].data().price.toFixed(2) + "€";
        document.getElementById("book_info_author").innerHTML = query.docs[index].data().author;

        // split the display name into uname, fname and lname
        let seller_name = query.docs[index].data().seller.split(g_DisplayNameSeperator);
        document.getElementById("book_info_seller").innerHTML = seller_name[0];
        document.getElementById("book_info_desc").innerHTML = query.docs[index].data().desc;

        // set appropriate image attachment
        console.log(query.docs[index].data().pic_file);
        GetImgURL(query.docs[index].data().pic_file, (url) => {
            console.log("book showing url: " + url);
            document.getElementById("book_info_attach").src = url;
        });
    })
}


function ShowUserProfile() {
    ChangeURLQuery("?user_profile");
    if(g_LoginData.user_data === null) {
        ToggleLoginPrompt();
        return;
    }

    HideContent();
    window.location.hash = "";
    document.getElementById("user_pr_err").innerHTML = "";
    document.getElementById("user_profile").style.display = "flex";
    
    const names = g_LoginData.user_data.displayName.split(g_DisplayNameSeperator);

    // display user information
    document.getElementById("uname").innerHTML = names[0];
    document.getElementById("email").innerHTML = g_LoginData.user_data.email;
    document.getElementById("fname").innerHTML = names[1];
    document.getElementById("lname").innerHTML = names[2];
}


function ShowSellPage() {
    ChangeURLQuery("?sell");
    if(g_LoginData.user_data === null) {
        ToggleLoginPrompt();
        return;
    }

    HideContent();
    document.getElementById("sale_form").style.display = "block";
    document.getElementById("attachment_msg").innerHTML = "Click to add image";
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


/// Helper to retrieve image URL and do something with it
function GetImgURL(file, callback) {
    firebase.storage().ref().child(file).getDownloadURL()
    .then(callback)
    .catch((error) => {
        console.log(error.message);
    });
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


/// Verify that all provided sale information is correct
function VerifySaleData(book) {
    if(g_Attachment === null)
        return "Image attachment is mandatory!";
    if(book.name === "")
        return "Book name cannot be empty!";
    if(book.price === 0) 
        return "Book price cannot be zero!";
    if(book.author === "") 
        return "Book author cannot be empty!";

    return null;
}


/// Generate image attachment metadata from file extension
function GenerateImageMetadata(ext) {
    if(ext === "jpg" || ext === "jpeg") 
        return { contentType: "image/jpeg" };
    else if(ext === "png") 
        return { contentType: "image/png" };
    else if(ext === "gif") 
        return { contentType: "image/gif" }; 
    return null;
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


/// TODO: Sign out from the currently logged in account 
function SignOutFromBookworm() {
    firebase.auth().signOut();
    ShowBookSearch();
}


/// Check URL search parameters and show correct page accordingly
function HandleURLSearchParams() {
    page_type = window.location.search;
    if(page_type === "?user_profile") ShowUserProfile();
    else if(page_type === "?catalog") ShowBookCatalog();
    else if(page_type === "?about_us") ShowAboutUs();
    else if(page_type === "?sell") ShowSellPage();
    else if(page_type.includes("book")) {
        let s_index = page_type.split('=');
        ShowBookInfo(Number(s_index[s_index.length - 1]));
    }
    else ShowBookSearch();
}


/// Initialiser method for Firebase
function Bootstrap() {
    firebase.initializeApp(g_FirebaseConfig);
    g_LoginData.db = firebase.firestore();

    firebase.auth().onAuthStateChanged((user) => {
        g_LoginData.user_data = user;
        if(g_LoginData.user_data !== null) {
            if(g_LoginData.user_data.displayName === null && g_LoginData.displayName !== null) {
                g_LoginData.user_data.updateProfile({
                    displayName: g_LoginData.display_name
                });
            }
        } else ToggleLoginPrompt();

        HandleURLSearchParams();
    });
}


/// Trigger file input click
function TriggerFileInput() {
    document.getElementById("img_attachment").click();
    document.getElementById("img_attachment").onchange = function(evt) {
        let file = evt.target.files[0];
        var fr = new FileReader();

        fr.onload = () => { 
            // convert base64 encoded string to byte array
            const regex = /data:.*,/i;
            const base64 = fr.result.replace(regex, '');
            var bin = window.atob(base64);
            g_Attachment = new Uint8Array(bin.length);
            for(let i = 0; i < bin.length; i++) 
                g_Attachment[i] = bin.charCodeAt(i);

            document.getElementById("attachment_msg").innerHTML = "Click to replace attachment";
        }
        fr.readAsDataURL(file);
    };
}
