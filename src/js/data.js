let ingredients = [];
const cookieProduits = 'cookieProduits';

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

//après-manger : écrire supprimer ingrédients et changerQuantité
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

    let tdAction = document.createElement('td');
    tdAction.innerText = 'Action';
    trHead.appendChild(tdAction);

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
        let buttonSuppr = document.createElement('button');
        buttonSuppr.innerText = 'SUPPR';

        buttonSuppr.onclick = function () {
            //Il faut mettre le numero de la ligne pour savoir l'index du tableau que l'on doit supprimer
        };

        tdAction.appendChild(buttonSuppr);
        let buttonUpdate = document.createElement('button');
        buttonUpdate.onclick = function () {
            //Il faut mettre le numéro de la ligne pour savoir l'index du tableau que l'on doit modifier
        };
        buttonUpdate.innerText = 'Update';
        tdAction.appendChild(buttonUpdate);
        trBody.appendChild(tdAction);
    });
  }
}

function writeCookie() {
  let cookieContent = cookieProduits;
  let separator = '#';
  let separatorProduct = '\\';
  cookieContent += '=';
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
  let cookie = getCookie(cookieProduits);
  if (cookie !== '') {
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
    getNotifications();
  }
};

function getCookie(cookieName) {
  let allCookies = document.cookie;
  let splitedCookie = allCookies.split(';');
  let cookie = '';
  splitedCookie.forEach(function(cookieIt) {
    if (cookieIt.includes('=')) {
      let cookieContent = cookieIt.split('=');
      if (cookieContent[0] === cookieName) {
        cookie = cookieContent[1];
      }
    }
  });
  return cookie;
}

function getExpirationsDate() {
  let expirationDates = [];
  let today = '';
  let d = new Date();
  today += d.getFullYear();
  today += '/';
  today += d.getMonth() + 1;
  today += '/';
  today += d.getDate();

  let dateToday = new Date(today);
  ingredients.forEach(function(produit) {
    let dateToR = produit['expirationDate'];
    let values = dateToR.split('/');
    dateToR = values[1] + '/' + values[0] + '/' + values[2];
    let dateExpiration = new Date(dateToR);
    let timeDiff = Math.abs(dateExpiration.getTime() - dateToday.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (dateExpiration.getTime() < dateToday.getTime()) {
      diffDays = diffDays * -1;
    }
    if (diffDays <= 2) {
      let product = [];
      product['ingredient'] = produit['name'];
      product['expirationDate'] = produit['expirationDate'];
      product['daysLeft'] = diffDays;
      expirationDates.push(product);
    }
  });
  return expirationDates;
}

function displayNotifications(expirationDates) {
  let divNotification = document.getElementById('dropdownNotifications');
  let nbNotifs = 0;

  /*let button = document.createElement('button');
  button.classList.add('btn');
  button.classList.add('btn-secondary');
  button.classList.add('dropdown-toggle');
  button.setAttribute('type', 'button');
  button.setAttribute('data-toggle', 'dropdown');
  divNotification.appendChild(button);*/

  let dropdownMenu = document.createElement('div');
  dropdownMenu.classList.add('dropdown-menu');
  dropdownMenu.classList.add('dropdown-menu-right');
  divNotification.appendChild(dropdownMenu);

  expirationDates.forEach(function(dates) {
    let notif = document.createElement('a');
    notif.classList.add('dropdown-item');
    notif.setAttribute('href', '#');
    let message = '';
    if (dates['daysLeft'] < 0) {
      message = dates['ingredient'] + ' périmé depuis ' + Math.abs(dates['daysLeft']) + ' jour(s)';
      nbNotifs++;
    } else if (dates['daysLeft'] === 0) {
      message = dates['ingredient'] + " périme aujourd'hui";
      nbNotifs++;
    } else if (dates['daysLeft'] <= 2) {
      message = dates['ingredient'] + ' périmé dans ' + dates['daysLeft'] + ' jour(s)';
      nbNotifs++;
    }
    notif.innerText = message;
    if (nbNotifs !== 0) {
      let buttonNotifications = document.getElementById('dropdownNotifications');
      let showNotifs = document.createElement('span');
      showNotifs.classList.add('button_badge');
      showNotifs.innerText = nbNotifs.toString();
      buttonNotifications.appendChild(showNotifs);
    }
    dropdownMenu.appendChild(notif);
  });
}

function getNotifications() {
  let expirationDates = getExpirationsDate();
  if (expirationDates !== []) {
    displayNotifications(expirationDates);
  }
}

/* ARRAY TO CSV
SOURCE : https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/*/
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ';';
  lineDelimiter = args.lineDelimiter || '\n';

  keys = Object.keys(data[0]);

  result = '';
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    ctr = 0;
    keys.forEach(function(key) {
      if (ctr > 0) result += columnDelimiter;

      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

function downloadCSV(args) {
  var data, filename, link;
  var csv = convertArrayOfObjectsToCSV({
    data: ingredients,
  });
  if (csv == null) return;
  filename = args.filename || 'export.csv';

  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
