let ingredients = [];

function searchProduct(barcode, expirationDate) {
  // Codes barre : '3272770098090', '3302745733029', '3270190207689'
  //Check le code barre
  let query = 'https://fr.openfoodfacts.org/api/v0/produit/' + barcode + '.json';

  $.getJSON(query, function(data) {
    if (data.status_verbose === 'product found') {
      let product = [];
      product['name'] = data.product.product_name_fr; //product_name si rien trouvé ?
      product['quantityUnit'] = data.product.quantity; //product_quantity selon l'usage (ou l'api marmiton)
      product['quantity'] = data.product.product_quantity;
      product['expirationDate'] = changeDateFormat(expirationDate);
      product['barCode'] = barcode;
      addToIngredients(product);
      //display(); //A décommenter si l'ajout de produit sur la même page que la consultation
    } else {
      //error
    }
    document.getElementById('ajoutIngredient').reset();
  });
}

function changeDateFormat(date) {
  function pad(s) {
    return s < 10 ? '0' + s : s;
  }
  let d = new Date(date);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}

function operationIngredients(quantity, exQuantityUnit, exQuantity, operation) {
  let unity = exQuantityUnit.replace(exQuantity, '');
  let newQuantity = [];
  let hasError = false;
  switch (operation) {
    case '+':
      newQuantity['quantity'] = quantity + exQuantity;
      break;
    case '-':
      newQuantity['quantity'] = quantity - exQuantity;
      break;
    default:
      hasError = true;
      break;
  }
  if (!hasError) {
    newQuantity['quantityUnit'] = newQuantity['quantity'].toString() + unity;
  }
  return newQuantity;
}

function removeQuantity(barcode, expirationDate, quantity) {
  let find = ingredients.find(function(prod) {
    return prod['barcode'] === barcode && prod['expirationDate'] === expirationDate;
  });
  if (find !== undefined) {
    let quantity = document.getElementById('quantiteASuppr');
    let newQuantity = operationIngredients(quantity, find['quantityUnit'], find['quantity'], '-');
    if (newQuantity['quantity'] <= 0) {
      ingredients.splice(find);
    } else {
      find['quantityUnit'] = newQuantity['quantityUnit'];
      find['quantity'] = newQuantity['quantity'];
    }
  }
}

function addToIngredients(product) {
  let find = ingredients.find(function(prod) {
    return (
      prod['name'] === product['name'] &&
      prod['expirationDate'] === product['expirationDate'] &&
      product['expirationDate'] !== ''
    );
  });
  if (find === undefined) {
    ingredients.push(product);
  } else {
    let newQuantity = operationIngredients(product['quantity'], find['quantityUnit'], find['quantity'], '+');
    find['quantityUnit'] = newQuantity['quantityUnit'];
    find['quantity'] = newQuantity['quantity'];
  }
  writeCookie();
}

function display() {
  if (ingredients.length !== 0) {
    let tabIngredients = document.getElementById('divIngredients');

    if (document.getElementById('tabIngredients') !== null) {
      tabIngredients.removeChild(document.getElementById('tabIngredients'));
      tabIngredients.removeChild(document.getElementById('titleIngredients'));
    }

    let title = document.createElement('h1');
    title.id = 'titleIngredients';
    title.innerText = 'Mes produits';
    tabIngredients.appendChild(title);

    let table = document.createElement('table');
    table.id = 'tabIngredients';
    table.className = 'table-striped';
    tabIngredients.appendChild(table);

    let thead = document.createElement('thead');
    table.classList.add('table');
    table.appendChild(thead);

    let trHead = document.createElement('tr');
    thead.appendChild(trHead);

    let tdProduct = document.createElement('td');
    tdProduct.innerText = 'Produits';
    trHead.appendChild(tdProduct);

    let tdQuantity = document.createElement('td');
    tdQuantity.innerText = 'Quantité';
    trHead.appendChild(tdQuantity);

    let tdExpirationDate = document.createElement('td');
    tdExpirationDate.innerText = 'Date de péremption';
    trHead.appendChild(tdExpirationDate);

    let tbody = document.createElement('tbody');
    table.appendChild(tbody);

    ingredients.forEach(function(product) {
      let trBody = document.createElement('tr');
      trBody.dataset.barcode = product['barCode'];
      trBody.dataset.expirationdate = product['expirationDate'];
      tbody.appendChild(trBody);

      let tdName = document.createElement('td');
      tdName.innerText = product['name'];
      trBody.appendChild(tdName);

      let tdQuantity = document.createElement('td');
      tdQuantity.innerText = product['quantityUnit'];
      trBody.appendChild(tdQuantity);

      let tdPeremp = document.createElement('td');
      tdPeremp.innerText = product['expirationDate'];
      trBody.appendChild(tdPeremp);

      let tdAction = document.createElement('td');
      trBody.appendChild(tdAction);
    });
  }
}

function writeCookie() {
  let cookieContent = '';
  let separator = '#';
  let separatorProduct = '\\';
  ingredients.forEach(function(product) {
    cookieContent +=
      product['name'] +
      separator +
      product['quantityUnit'] +
      separator +
      product['quantity'] +
      separator +
      product['expirationDate'] +
      separator +
      product['barCode'] +
      separatorProduct;
  });
  document.cookie = cookieContent;
}

window.onload = function readCookie() {
  let cookie = document.cookie;
  let product = cookie.split('\\');
  product.forEach(function(prod) {
    if (prod !== '') {
      let detail = prod.split('#');
      let product = [];
      product['name'] = detail[0];
      product['quantityUnit'] = detail[1];
      product['quantity'] = parseInt(detail[2]);
      product['expirationDate'] = detail[3];
      product['barCode'] = parseInt(detail[4]);
      ingredients.push(product);
    }
  });
  display();
};
