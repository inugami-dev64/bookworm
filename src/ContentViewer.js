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
    g_LoginData.db.collection("books").orderBy("name").onSnapshot((query) => {
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
    let ref = g_LoginData.db.collection("books").orderBy("name")
    ref.get().then((query) => {
        document.getElementById("book_info_name").innerHTML = query.docs[index].data().name;
        document.getElementById("book_info_price").innerHTML = query.docs[index].data().price.toFixed(2) + "€";
        document.getElementById("book_info_author").innerHTML = query.docs[index].data().author;

        // split the display name into uname, fname and lname
        let seller_name = query.docs[index].data().seller.split(g_DisplayNameSeperator);
        document.getElementById("book_info_seller").innerHTML = seller_name[0];
        document.getElementById("book_info_seller").href = "seller.html/?sellerid=";
        document.getElementById("book_info_desc").innerHTML = query.docs[index].data().desc;

        // set appropriate image attachment
        console.log(query.docs[index].data().pic_file);
        GetImgURL(query.docs[index].data().pic_file, (url) => {
            console.log("book showing url: " + url);
            document.getElementById("book_info_attach").src = url;

            let book_data = {
                "name": query.docs[index].data().name,
                "seller": seller_name[0],
                "price": query.docs[index].data().price,
                "url": url
            };

            document.getElementById("detailed_add_to_cart").onclick = function() { AddToCart(book_data); };
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
    else if(page_type === "?list") ShowBookList();
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


/// Toggle the account manager divisor
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


/// Load all books and list them into list.html
function ShowBookList() {
    HideContent();

    // make book list div visible
    document.getElementById("list").style.display = "block";
    let books = document.getElementById("books");

    g_LoginData.db.collection("books").orderBy("name").onSnapshot((query) => {
        console.log("Updating book list");
        console.log("Query length: " + query.docs.length);
        books.innerHTML = "";
        for(let i = 0; i < query.docs.length; i++) {
            let name = query.docs[i].data().name;
            let price = query.docs[i].data().price.toFixed(2);
            let author = query.docs[i].data().author;
            let seller = query.docs[i].data().seller.split(g_DisplayNameSeperator)[0];
            // Set the divs and image urls
            GetImgURL(query.docs[i].data().pic_file, (url) => {
                let book_data = {
                    "name": name,
                    "seller": seller,
                    "price": query.docs[i].data().price,
                    "url": url
                };

                books.innerHTML += 
                    "<li>" +
                    "   <div class=\"item\">" +
                    "       <img src=\"" + url + "\">" +
                    "       <div class=\"book_info\">" +
                    "           <h1>" + name + "</h1>" +
                    "           <p>Author: " + author + "</p>" +
                    "           <p>Seller: " + seller + "</p>" +
                    "           <p>Price: " + price + "€</p>" +
                    "       </div>" +
                    "       <button class=\"round_btn\" id=\"add_book_id_" + i + "\">Add to Cart</button>" +
                    "   </div>" +
                    "</li>";

                document.getElementById("add_book_id_" + i.toString()).onclick = function() { AddToCart(book_data) };
            });
        }
    });
}


/// Add book with specified index to cart
function AddToCart(book) {
    console.log("Adding " + book)
    g_CartContents.push(book);
}


/// Display all items placed to cart
function ToggleCart() {
    g_LoginData.is_cart = !g_LoginData.is_cart;
    HideContent();

    if(g_LoginData.is_cart) {
        let total_price = 0;

        // display only the cart elements
        document.getElementById("cart_contents").style.display = "flex";
        let books = document.getElementById("books_in_cart");
        books.innerHTML = "";

        for(let i = 0; i < g_CartContents.length; i++) {
            let name = g_CartContents[i].name;
            let seller = g_CartContents[i].seller;
            let price = g_CartContents[i].price.toFixed(2);
            let url = g_CartContents[i].url;
            total_price = g_CartContents[i].price;

            // Set the divs and image urls
            books.innerHTML += 
                "<div class=\"cart_book\">" +
                "   <img src=\"" + url + "\">" +
                "   <div class=\"book_info\">" +
                "       <h2>" + name + "</h2>" +
                "       <p>" + seller + "</p>" +
                "   </div>" +
                "   <p style=\"margin-top: auto;\">" + price + "€</p>" +
                "</div>";
        }

        // update price data
        document.getElementById("total_price").innerHTML = total_price.toFixed(2) + "€";
        document.getElementById("order_price").innerHTML = (total_price * 0.8).toFixed(2) + "€";
        document.getElementById("tax_price").innerHTML = (total_price * 0.2).toFixed(2) + "€";
    } else {
        ShowBookSearch();
    }
}


/// Scroll expandable listings to right
function ScrollRight(id) {
    let dom = document.getElementById(id);
    let visible_width = dom.clientWidth;
    let width = dom.scrollWidth;
    let scroll_left = dom.scrollLeft;

    if(scroll_left + (visible_width / 2) <= width)
        dom.scroll({left: scroll_left + (visible_width / 2), top: 0, behavior: 'smooth'});
    else dom.scroll({left: width, top: 0, behavior: 'smooth'})
}


/// Scroll expandable listings to left
function ScrollLeft(id) {
    let dom = document.getElementById(id);
    let visible_width = dom.clientWidth;
    let width = dom.scrollWidth;
    let scroll_left = dom.scrollLeft;

    if(scroll_left - (visible_width / 2) >= 0)
        dom.scroll({left: scroll_left - (visible_width / 2), top: 0, behavior: 'smooth'});
    else dom.scroll({left: 0, top: 0, behavior: 'smooth'});
}
