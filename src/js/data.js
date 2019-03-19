let ingredients = [];

function searchProduct(barcode) {
    // Codes barre : '3272770098090', '3302745733029', '3270190207689'
    let query = 'https://fr.openfoodfacts.org/api/v0/produit/' + barcode + '.json';

    $.getJSON(query, function(data) {

        if(data.status_verbose === 'product found') {
            let product = [];
            product["name"] = data.product.product_name_fr; //product_name si rien trouvé ?
            product["quantityUnit"] = data.product.quantity; //product_quantity selon l'usage (ou l'api marmiton)
            product["quantity"] = data.product.product_quantity;
            product["expirationDate"] = "21/04/2019";
            product["barCode"] = barcode;
            //3272770098090 : product_name_fr = "St Moret", product_name = "St Moret" quantity = "150 g", product_quantity = 150
            addToIngredients(product);
            writeCookie();
            display();
        } else {
            //error
        }

    });
}

function removeQuantity(quantity) {

}

function operationIngredients(quantityUnit, quantity, exQuantityUnit, exQuantity, operation) {
    let unity = quantityUnit.replace(quantity,'');
    let newQuantity = [];
    let hasError = false;
    switch (operation) {
        case '+' :
            newQuantity["quantity"] = quantity + exQuantity;
            break;
        case '-' :
            newQuantity["quantity"] = quantity - exQuantity;
            break;
        default:
            hasError = true;
            break;
    }
    if(!hasError) {
        newQuantity["quantityUnit"] = newQuantity["quantity"].toString() + unity;
    }
    return newQuantity;

}

function addToIngredients(product) {
    let find = ingredients.find(function (prod) {
        return (prod["name"] === product["name"]) && (prod["expirationDate"] === product["expirationDate"]) && (product["expirationDate"] !== "");
    });
    if(find === undefined) {
        ingredients.push(product);
    } else {
        let newQuantity = operationIngredients(product["quantityUnit"], product["quantity"], find["quantityUnit"], find["quantity"], '+');
        find["quantityUnit"] = newQuantity["quantityUnit"];
        find["quantity"] = newQuantity["quantity"];
    }
}

function display() {
    if(ingredients.length !== 0) {
        let tabIngredients = document.getElementById("divIngredients");

        if(document.getElementById("tabIngredients") !== null) {
            tabIngredients.removeChild(document.getElementById("tabIngredients"));
        }

        let table = document.createElement("table");
        table.id = "tabIngredients";
        tabIngredients.appendChild(table);

        let thead = document.createElement("thead");
        table.classList.add("table");
        table.appendChild(thead);

        let trHead = document.createElement("tr");
        thead.appendChild(trHead);

        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        ingredients.forEach(function (product) {
            let trBody = document.createElement("tr");
            trBody.dataset.barcode = product["barCode"];
            trBody.dataset.expirationdate = product["expirationDate"];
            tbody.appendChild(trBody);

            let tdName = document.createElement("td");
            tdName.innerText = product["name"];
            trBody.appendChild(tdName);

            let tdQuantity = document.createElement("td");
            tdQuantity.innerText = product["quantityUnit"];
            trBody.appendChild(tdQuantity);

            let tdPeremp = document.createElement("td");
            tdPeremp.innerText = product["expirationDate"];
            trBody.appendChild(tdPeremp);

            let tdAction = document.createElement("td");
            trBody.appendChild(tdAction);
        })
    }
}

function writeCookie() {
    let cookieContent = "";
    let separator = "#";
    let separatorProduct = "\\";
    ingredients.forEach(function (product) {
        cookieContent += product["name"] + separator + product["quantityUnit"] + separator + product["quantity"] + separator + product["expirationDate"] + separator + product["barCode"] + separatorProduct;
    });
    document.cookie = cookieContent;
}

window.onload = function readCookie2() {
    let cookie = document.cookie;
    let product = cookie.split("\\");
    product.forEach(function (prod) {
        if(prod !== "") {
            let detail = prod.split('#');
            let product = [];
            product["name"] = detail[0];
            product["quantityUnit"] = detail[1];
            product["quantity"] = parseInt(detail[2]);
            product["expirationDate"] = detail[3];
            product["barCode"] = parseInt(detail[4]);
            ingredients.push(product);
        }
    });
    display();
};