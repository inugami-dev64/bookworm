// Backend configuration
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
    "list",
    "user_profile",
    "cart_contents",
    "catalog",
    "sale_form",
    "book_info"
];


// Seperator to use in Firebase displayName for username, first name and last name 
const g_DisplayNameSeperator = "\\";


// Collection to read from and write into
const g_BooksCollection = [ "books", "ZC9wHORgElJ3IPXTcWEs" ];


// Image url to use for fetching book images
const g_ImgURL = "gs://bookworm-333f5.appspot.com/";

// Informational data-structure for handling logins
let g_LoginData = {
    "is_logged_in": false,
    "current_section": "login",
    "is_prompt": false,
    "is_account_management": false,
    "is_cart": false,
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


/// contains following structures:
///     {
///         name: string,
///         seller: string,
///         price: number,
///         url: string
///     }
///
let g_CartContents = [];
